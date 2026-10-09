import { NextResponse } from "next/server";
import {
  getKnowledgeEntriesByOptionId,
  getKnowledgeEntryById,
} from "@/lib/knowledge";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const optionId = searchParams.get("optionId");
  const entry = id
    ? getKnowledgeEntryById(id)
    : optionId
      ? getKnowledgeEntriesByOptionId(optionId)[0]
      : undefined;

  if (!entry) {
    return NextResponse.json({ entry: null }, { status: 404 });
  }

  return NextResponse.json({ entry });
}
