import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  checkRateLimit,
  FormProtectionError,
  logFormEvent,
  RateLimitError,
  readJsonBody,
  RequestBodyError,
  runIdempotent,
} from "@/lib/server/form-protection";
import { logSmtpFailure } from "@/lib/server/smtp-diagnostics";

export const runtime = "nodejs";

function text(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const MAX_REQUEST_BYTES = 10_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1_000;

class MailConfigurationError extends Error {}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const value = await readJsonBody(request, MAX_REQUEST_BYTES);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestBodyError(400);
    body = value as Record<string, unknown>;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json(
      { error: status === 413 ? "Die Anfrage ist zu groß." : "Die Anfrage konnte nicht gelesen werden." },
      { status },
    );
  }

  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const organization = text(body.organization);
  const email = text(body.email).toLowerCase();
  const phone = text(body.phone);
  const subject = text(body.subject).replace(/[\r\n]+/g, " ");
  const message = text(body.message, 5000);
  const submissionId = text(body.submissionId, 100);
  const validEmail = emailPattern.test(email);

  if (text(body.website)) return NextResponse.json({ ok: true });
  if (
    !firstName || !lastName || (!email && !phone) || (email.length > 0 && !validEmail)
    || !subject || message.length < 10 || !/^[a-zA-Z0-9_-]{16,100}$/.test(submissionId)
  ) {
    return NextResponse.json(
      { error: "Bitte prüfen Sie die Pflichtfelder und Ihre E-Mail-Adresse." },
      { status: 422 },
    );
  }

  const submissionKey = createHash("sha256").update(submissionId).digest("hex");
  try {
    const result = await runIdempotent("contact", submissionKey, IDEMPOTENCY_TTL_MS, async () => {
      const retryAfter = await checkRateLimit(request, "contact");
      if (retryAfter) throw new RateLimitError(retryAfter);

      const required = [
        "CONTACT_SMTP_HOST", "CONTACT_SMTP_PORT", "CONTACT_SMTP_USER",
        "CONTACT_SMTP_PASSWORD", "CONTACT_FROM_EMAIL",
      ] as const;
      if (required.some((key) => !process.env[key]?.trim())) throw new MailConfigurationError();

      const port = Number(process.env.CONTACT_SMTP_PORT);
      const secureValue = process.env.CONTACT_SMTP_SECURE;
      const testMode = process.env.CONTACT_MAIL_TEST_MODE === "true";
      const testRecipient = process.env.CONTACT_TEST_TO_EMAIL?.trim();
      const configuredRecipient = process.env.CONTACT_TO_EMAIL?.trim();
      const recipient = testMode ? testRecipient : configuredRecipient;
      const from = process.env.CONTACT_FROM_EMAIL!.trim();
      if (!Number.isInteger(port) || port < 1 || port > 65_535
        || !["true", "false"].includes(secureValue ?? "")
        || !recipient || !emailPattern.test(recipient) || !emailPattern.test(from)) {
        throw new MailConfigurationError();
      }

      const transporter = nodemailer.createTransport({
        host: process.env.CONTACT_SMTP_HOST,
        port,
        secure: secureValue === "true",
        auth: { user: process.env.CONTACT_SMTP_USER, pass: process.env.CONTACT_SMTP_PASSWORD },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      const info = await transporter.sendMail({
        from,
        to: recipient,
        replyTo: validEmail ? email : undefined,
        subject: `Website-Anfrage: ${subject}`,
        text: [
          `Vorname: ${firstName}`,
          `Nachname: ${lastName}`,
          `Gemeinde / Organisation: ${organization || "nicht angegeben"}`,
          `E-Mail: ${email || "nicht angegeben"}`, `Telefon: ${phone || "nicht angegeben"}`,
          `Anliegen: ${subject}`, "", message,
        ].join("\n"),
      });
      if (!info.accepted?.length) throw new Error("MAIL_NOT_ACCEPTED");
      return { ok: true as const };
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RateLimitError) {
      logFormEvent("contact", "rate_limited", "warn");
      return NextResponse.json(
        { error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      );
    }
    if (error instanceof FormProtectionError) {
      logFormEvent("contact", "form_protection_failed", "error", error.errorType);
      return NextResponse.json(
        { error: "Die Online-Übermittlung ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut." },
        { status: 503 },
      );
    }
    if (error instanceof MailConfigurationError) {
      logFormEvent("contact", "mail_not_configured", "error", "configuration");
      return NextResponse.json(
        { error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
        { status: 503 },
      );
    }
    logSmtpFailure("contact", "delivery_failed", error);
    return NextResponse.json(
      { error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@dalemans.de." },
      { status: 502 },
    );
  }
}
