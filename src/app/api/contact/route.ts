import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import {
  checkLocalRateLimit,
  logFormEvent,
  readJsonBody,
  RequestBodyError,
} from "@/lib/server/form-protection";

export const runtime = "nodejs";

function text(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const MAX_REQUEST_BYTES = 10_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1_000;
const acceptedSubmissions = new Map<string, number>();
const pendingSubmissions = new Map<string, Promise<void>>();

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

  const now = Date.now();
  for (const [key, expiresAt] of acceptedSubmissions) {
    if (expiresAt <= now) acceptedSubmissions.delete(key);
  }
  const submissionKey = createHash("sha256").update(submissionId).digest("hex");
  if (acceptedSubmissions.has(submissionKey)) return NextResponse.json({ ok: true });
  const pending = pendingSubmissions.get(submissionKey);
  if (pending) {
    try {
      await pending;
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@dalemans.de." },
        { status: 502 },
      );
    }
  }

  const retryAfter = checkLocalRateLimit(request, "contact");
  if (retryAfter) {
    logFormEvent("contact", "rate_limited", "warn");
    return NextResponse.json(
      { error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const required = [
    "CONTACT_SMTP_HOST", "CONTACT_SMTP_PORT", "CONTACT_SMTP_USER",
    "CONTACT_SMTP_PASSWORD", "CONTACT_FROM_EMAIL",
  ] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    logFormEvent("contact", "mail_not_configured");
    return NextResponse.json(
      { error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
      { status: 503 },
    );
  }

  const port = Number(process.env.CONTACT_SMTP_PORT);
  const secureValue = process.env.CONTACT_SMTP_SECURE;
  const testMode = process.env.CONTACT_MAIL_TEST_MODE === "true";
  const testRecipient = process.env.CONTACT_TEST_TO_EMAIL?.trim();
  const configuredRecipient = process.env.CONTACT_TO_EMAIL!.trim();
  const recipient = testMode ? testRecipient : configuredRecipient;
  const from = process.env.CONTACT_FROM_EMAIL!.trim();
  if (!Number.isInteger(port) || port < 1 || port > 65_535
    || !["true", "false"].includes(secureValue ?? "")
    || !recipient || !emailPattern.test(recipient) || !emailPattern.test(from)) {
    logFormEvent("contact", testMode && !testRecipient ? "mail_test_recipient_missing" : "mail_config_invalid");
    return NextResponse.json(
      { error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
      { status: 503 },
    );
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

  const delivery = (async () => {
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
  })();
  pendingSubmissions.set(submissionKey, delivery);

  try {
    await delivery;
    acceptedSubmissions.set(submissionKey, Date.now() + IDEMPOTENCY_TTL_MS);
    return NextResponse.json({ ok: true });
  } catch {
    logFormEvent("contact", "delivery_failed");
    return NextResponse.json(
      { error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@dalemans.de." },
      { status: 502 },
    );
  } finally {
    pendingSubmissions.delete(submissionKey);
  }
}
