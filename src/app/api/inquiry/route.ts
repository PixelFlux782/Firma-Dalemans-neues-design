import { NextResponse } from "next/server";
import type { InquirySuccessResponse } from "@/lib/inquiry/types";
import {
  deliverInquiry,
  idempotencyDigest,
  InquiryInputError,
  resolveInquiryItems,
  validateInquiryBody,
} from "@/lib/inquiry/server";
import {
  checkRateLimit,
  FormProtectionError,
  logFormEvent,
  RateLimitError,
  readJsonBody,
  RequestBodyError,
  runIdempotentResult,
} from "@/lib/server/form-protection";
import { logSmtpFailure } from "@/lib/server/smtp-diagnostics";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 35_000;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000;

export async function POST(request: Request) {
  try {
    const body = validateInquiryBody(await readJsonBody(request, MAX_REQUEST_BYTES));
    if (body.website) {
      return NextResponse.json({ accepted: true, inquiryId: "DLMNS-ANFRAGE", customerConfirmation: "sent" });
    }

    const key = idempotencyDigest(body.idempotencyKey);
    const delivery = await runIdempotentResult<InquirySuccessResponse>("inquiry", key, IDEMPOTENCY_TTL_MS, async () => {
      const retryAfter = await checkRateLimit(request, "inquiry");
      if (retryAfter) throw new RateLimitError(retryAfter);
      const lines = await resolveInquiryItems(body.items);
      return deliverInquiry(body, lines);
    });
    return NextResponse.json(delivery.result, { status: delivery.replayed ? 200 : 201 });
  } catch (error) {
    if (error instanceof InquiryInputError) {
      return NextResponse.json(
        { accepted: false, error: error.message, fieldErrors: error.fieldErrors },
        { status: 422 },
      );
    }
    if (error instanceof RequestBodyError) {
      return NextResponse.json({
        accepted: false,
        error: error.status === 413 ? "Die Anfrage ist zu groß." : "Die Anfrage konnte nicht gelesen werden.",
      }, { status: error.status });
    }
    if (error instanceof RateLimitError) {
      logFormEvent("inquiry", "rate_limited", "warn");
      return NextResponse.json(
        { accepted: false, error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      );
    }
    if (error instanceof FormProtectionError) {
      logFormEvent("inquiry", "form_protection_failed", "error", error.errorType);
      return NextResponse.json({
        accepted: false,
        error: "Die Online-Übermittlung ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",
      }, { status: 503 });
    }
    const unavailable = error instanceof Error
      && (error.message === "MAIL_NOT_CONFIGURED" || error.message === "MAIL_TEST_RECIPIENT_MISSING");
    if (unavailable) logFormEvent("inquiry", "mail_not_configured");
    else logSmtpFailure("inquiry", "delivery_failed", error);
    return NextResponse.json({
      accepted: false,
      error: unavailable
        ? "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte schreiben Sie an info@dalemans.de."
        : "Ihre Anfrage konnte nicht sicher angenommen werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@dalemans.de.",
    }, { status: unavailable ? 503 : 502 });
  }
}
