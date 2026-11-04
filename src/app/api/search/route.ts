import { NextRequest, NextResponse } from "next/server";
import { searchCommerce } from "@/lib/search/service";
import type { SearchResponse, SearchResult } from "@/lib/search/types";

function compactResult(result: SearchResult): SearchResult {
  return {
    ...result,
    document: {
      ...result.document,
      fields: [],
      aliases: [],
      variantLabels: [],
    },
  };
}

function compactResponse(response: SearchResponse): SearchResponse {
  return {
    ...response,
    groups: {
      products: response.groups.products.map(compactResult),
      collections: response.groups.collections.map(compactResult),
      help: response.groups.help.map(compactResult),
      knowledge: response.groups.knowledge.map(compactResult),
    },
  };
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 120);
  const results = compactResponse(await searchCommerce(query));
  const localCatalog = (process.env.COMMERCE_PROVIDER?.trim().toLowerCase() || "local") === "local";
  return NextResponse.json(results, {
    headers: localCatalog
      ? {
          "Cache-Control": "public, max-age=60",
          "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        }
      : { "Cache-Control": "private, max-age=30" },
  });
}
