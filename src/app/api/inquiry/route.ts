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
  checkLocalRateLimit,
  logFormEvent,
  readJsonBody,
  RequestBodyError,
} from "@/lib/server/form-protection";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 35_000;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000;

interface CachedResult { expiresAt: number; result: InquirySuccessResponse }

const acceptedResults = new Map<string, CachedResult>();
const pendingRequests = new Map<string, Promise<InquirySuccessResponse>>();

function prune(now: number) {
  for (const [key, value] of acceptedResults) if (value.expiresAt <= now) acceptedResults.delete(key);
}

export async function POST(request: Request) {
  const now = Date.now();
  prune(now);

  try {
    const body = validateInquiryBody(await readJsonBody(request, MAX_REQUEST_BYTES));
    if (body.website) {
      return NextResponse.json({ accepted: true, inquiryId: "DLMNS-ANFRAGE", customerConfirmation: "sent" });
    }

    const key = idempotencyDigest(body.idempotencyKey);
    const cached = acceptedResults.get(key);
    if (cached) return NextResponse.json(cached.result);

    const running = pendingRequests.get(key);
    if (running) return NextResponse.json(await running);

    const retryAfter = checkLocalRateLimit(request, "inquiry");
    if (retryAfter) {
      logFormEvent("inquiry", "rate_limited", "warn");
      return NextResponse.json(
        { accepted: false, error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const delivery = (async () => {
      const lines = await resolveInquiryItems(body.items);
      return deliverInquiry(body, lines);
    })();
    pendingRequests.set(key, delivery);

    try {
      const result = await delivery;
      acceptedResults.set(key, { result, expiresAt: Date.now() + IDEMPOTENCY_TTL_MS });
      return NextResponse.json(result, { status: 201 });
    } finally {
      pendingRequests.delete(key);
    }
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
