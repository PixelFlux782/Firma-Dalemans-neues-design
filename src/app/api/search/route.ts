import { NextRequest, NextResponse } from "next/server";
import { searchCommerce } from "@/lib/search/service";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 120);
  const results = await searchCommerce(query);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
