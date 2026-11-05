import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import {
  checkRateLimit,
  claimIdempotency,
  FormProtectionUnavailable,
  isAllowedFormRequest,
  logFormEvent,
  readJsonBody,
  releaseIdempotency,
  RequestBodyError,
  storeIdempotencyResult,
} from "@/lib/server/form-protection";

export const runtime = "nodejs";

function text(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const MAX_REQUEST_BYTES = 10_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1_000;
const PRODUCTION_RECIPIENT = "anfrage@dalemans.de";

export async function POST(request: Request) {
  if (!isAllowedFormRequest(request)) {
    logFormEvent("contact", "request_origin_rejected", "warn");
    return NextResponse.json({ error: "Die Anfrage konnte nicht verarbeitet werden." }, { status: 403 });
  }

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
  let retryAfter: number | null;
  try {
    // Keep an in-flight claim for the full duplicate-suppression window. If a
    // process disappears after SMTP accepted the message, a retry must not be
    // able to send the same submission again after only a few seconds.
    const existing = await claimIdempotency("contact", submissionKey, IDEMPOTENCY_TTL_MS);
    if (existing === "accepted") return NextResponse.json({ ok: true });
    if (existing === "pending") {
      return NextResponse.json({ error: "Diese Anfrage wird bereits verarbeitet." }, { status: 409 });
    }
    retryAfter = await checkRateLimit(request, "contact");
  } catch (error) {
    if (!(error instanceof FormProtectionUnavailable)) throw error;
    logFormEvent("contact", "form_protection_unavailable");
    return NextResponse.json(
      { error: "Die Online-Übermittlung ist derzeit nicht verfügbar. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
      { status: 503 },
    );
  }
  if (retryAfter) {
    await releaseIdempotency("contact", submissionKey);
    logFormEvent("contact", "rate_limited", "warn");
    return NextResponse.json(
      { error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const required = [
    "CONTACT_SMTP_HOST", "CONTACT_SMTP_PORT", "CONTACT_SMTP_USER",
    "CONTACT_SMTP_PASSWORD", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL",
  ] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    await releaseIdempotency("contact", submissionKey);
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
  const recipient = testMode ? testRecipient : PRODUCTION_RECIPIENT;
  const from = process.env.CONTACT_FROM_EMAIL!.trim();
  if (!Number.isInteger(port) || port < 1 || port > 65_535
    || !["true", "false"].includes(secureValue ?? "")
    || !recipient || !emailPattern.test(recipient) || !emailPattern.test(from)
    || (!testMode && configuredRecipient.toLowerCase() !== PRODUCTION_RECIPIENT)) {
    await releaseIdempotency("contact", submissionKey);
    logFormEvent("contact", testMode && !testRecipient ? "mail_test_recipient_missing" : "mail_config_invalid");
    return NextResponse.json(
      { error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
      { status: 503 },
    );
  }

  const host = process.env.CONTACT_SMTP_HOST!.trim();
  const secure = secureValue === "true";
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user: process.env.CONTACT_SMTP_USER, pass: process.env.CONTACT_SMTP_PASSWORD },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true, servername: host },
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
  try {
    await delivery;
  } catch {
    try { await releaseIdempotency("contact", submissionKey); } catch { /* delivery error remains primary */ }
    logFormEvent("contact", "delivery_failed");
    return NextResponse.json(
      { error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@dalemans.de." },
      { status: 502 },
    );
  }

  try {
    await storeIdempotencyResult("contact", submissionKey, "accepted", IDEMPOTENCY_TTL_MS);
  } catch {
    // SMTP has already accepted the message. Reporting failure would invite a
    // duplicate retry. The long-lived pending claim remains as the safe state.
    logFormEvent("contact", "accepted_state_unavailable");
  }
  return NextResponse.json({ ok: true });
}
