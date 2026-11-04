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

const MAX_REQUEST_BYTES = 35_000;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000;

export async function POST(request: Request) {
  if (!isAllowedFormRequest(request)) {
    logFormEvent("inquiry", "request_origin_rejected", "warn");
    return NextResponse.json({ accepted: false, error: "Die Anfrage konnte nicht verarbeitet werden." }, { status: 403 });
  }

  let claimedKey: string | null = null;

  try {
    const body = validateInquiryBody(await readJsonBody(request, MAX_REQUEST_BYTES));
    if (body.website) {
      return NextResponse.json({ accepted: true, inquiryId: "DLMNS-ANFRAGE", customerConfirmation: "sent" });
    }

    const key = idempotencyDigest(body.idempotencyKey);
    const existing = await claimIdempotency("inquiry", key, IDEMPOTENCY_TTL_MS);
    if (existing && existing !== "pending") {
      return NextResponse.json(JSON.parse(existing) as InquirySuccessResponse);
    }
    if (existing === "pending") {
      return NextResponse.json({ accepted: false, error: "Diese Anfrage wird bereits verarbeitet." }, { status: 409 });
    }
    claimedKey = key;

    const retryAfter = await checkRateLimit(request, "inquiry");
    if (retryAfter) {
      await releaseIdempotency("inquiry", key);
      claimedKey = null;
      logFormEvent("inquiry", "rate_limited", "warn");
      return NextResponse.json(
        { accepted: false, error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const lines = await resolveInquiryItems(body.items);
    const result = await deliverInquiry(body, lines);
    try {
      await storeIdempotencyResult("inquiry", key, JSON.stringify(result), IDEMPOTENCY_TTL_MS);
    } catch {
      // Delivery is already accepted. Keep the full-window pending claim and
      // return success instead of encouraging a duplicate order transmission.
      logFormEvent("inquiry", "accepted_state_unavailable");
    }
    claimedKey = null;
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (claimedKey) {
      try { await releaseIdempotency("inquiry", claimedKey); } catch { /* original error remains primary */ }
    }
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
    if (error instanceof FormProtectionUnavailable) {
      logFormEvent("inquiry", "form_protection_unavailable");
      return NextResponse.json({
        accepted: false,
        error: "Die Online-Übermittlung ist derzeit nicht verfügbar. Bitte schreiben Sie an info@dalemans.de.",
      }, { status: 503 });
    }
    const unavailable = error instanceof Error
      && (error.message === "MAIL_NOT_CONFIGURED" || error.message === "MAIL_TEST_RECIPIENT_MISSING");
    logFormEvent("inquiry", unavailable ? "mail_not_configured" : "delivery_failed");
    return NextResponse.json({
      accepted: false,
      error: unavailable
        ? "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte schreiben Sie an info@dalemans.de."
        : "Ihre Anfrage konnte nicht sicher angenommen werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@dalemans.de.",
    }, { status: unavailable ? 503 : 502 });
  }
}
