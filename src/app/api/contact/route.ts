import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function text(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Anfrage konnte nicht gelesen werden." }, { status: 400 });
  }

  const name = text(body.name);
  const organization = text(body.organization);
  const email = text(body.email);
  const phone = text(body.phone);
  const subject = text(body.subject);
  const message = text(body.message, 5000);

  if (text(body.website)) return NextResponse.json({ ok: true });
  if (!name || !organization || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || message.length < 10) {
    return NextResponse.json(
      { error: "Bitte prüfen Sie die Pflichtfelder und Ihre E-Mail-Adresse." },
      { status: 422 },
    );
  }

  const required = [
    "CONTACT_SMTP_HOST", "CONTACT_SMTP_PORT", "CONTACT_SMTP_USER",
    "CONTACT_SMTP_PASSWORD", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Contact form is not configured: ${missing.join(", ")}`);
    return NextResponse.json(
      { error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de." },
      { status: 503 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST,
    port: Number(process.env.CONTACT_SMTP_PORT),
    secure: process.env.CONTACT_SMTP_SECURE === "true",
    auth: { user: process.env.CONTACT_SMTP_USER, pass: process.env.CONTACT_SMTP_PASSWORD },
  });

  try {
    await transporter.sendMail({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Website-Anfrage: ${subject}`,
      text: [
        `Name: ${name}`, `Gemeinde / Organisation: ${organization}`,
        `E-Mail: ${email}`, `Telefon: ${phone || "nicht angegeben"}`,
        `Anliegen: ${subject}`, "", message,
      ].join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return NextResponse.json(
      { error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@dalemans.de." },
      { status: 502 },
    );
  }
}
