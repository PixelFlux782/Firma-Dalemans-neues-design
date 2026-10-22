import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { InquirySuccessResponse } from "@/lib/inquiry/types";
import {
  deliverInquiry,
  idempotencyDigest,
  InquiryInputError,
  resolveInquiryItems,
  validateInquiryBody,
} from "@/lib/inquiry/server";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 35_000;
const RATE_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT = 5;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000;
const MAX_RATE_ENTRIES = 10_000;

interface RateEntry { count: number; resetAt: number }
interface CachedResult { expiresAt: number; result: InquirySuccessResponse }

const rateEntries = new Map<string, RateEntry>();
const acceptedResults = new Map<string, CachedResult>();
const pendingRequests = new Map<string, Promise<InquirySuccessResponse>>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

function isRateLimited(key: string, now: number) {
  const current = rateEntries.get(key);
  if (!current || current.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function prune(now: number) {
  for (const [key, value] of rateEntries) if (value.resetAt <= now) rateEntries.delete(key);
  for (const [key, value] of acceptedResults) if (value.expiresAt <= now) acceptedResults.delete(key);
  while (rateEntries.size > MAX_RATE_ENTRIES) {
    const oldest = rateEntries.keys().next().value as string | undefined;
    if (!oldest) break;
    rateEntries.delete(oldest);
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ accepted: false, error: "Die Anfrage ist zu groß." }, { status: 413 });
  }

  const now = Date.now();
  prune(now);

  try {
    const body = validateInquiryBody(await request.json());
    if (body.website) {
      return NextResponse.json({ accepted: true, inquiryId: "DLMNS-ANFRAGE", customerConfirmation: "sent" });
    }

    const key = idempotencyDigest(body.idempotencyKey);
    const cached = acceptedResults.get(key);
    if (cached) return NextResponse.json(cached.result);

    const running = pendingRequests.get(key);
    if (running) return NextResponse.json(await running);

    if (isRateLimited(clientKey(request), now)) {
      return NextResponse.json(
        { accepted: false, error: "Zu viele Sendeversuche. Bitte warten Sie einige Minuten." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(RATE_WINDOW_MS / 1_000)) } },
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
    if (error instanceof SyntaxError) {
      return NextResponse.json({ accepted: false, error: "Die Anfrage konnte nicht gelesen werden." }, { status: 400 });
    }
    const unavailable = error instanceof Error
      && (error.message === "MAIL_NOT_CONFIGURED" || error.message === "MAIL_TEST_RECIPIENT_MISSING");
    console.error(unavailable ? "Inquiry mail is not configured." : "Inquiry delivery failed.");
    return NextResponse.json({
      accepted: false,
      error: unavailable
        ? "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte schreiben Sie an info@dalemans.de."
        : "Ihre Anfrage konnte nicht sicher angenommen werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@dalemans.de.",
    }, { status: unavailable ? 503 : 502 });
  }
}
