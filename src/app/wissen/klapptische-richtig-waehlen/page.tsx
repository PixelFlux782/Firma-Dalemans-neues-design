import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("klapptische-richtig-waehlen");

export const metadata: Metadata = buildMetadata({
  title: "Klapptische richtig wählen und planen",
  description: "Orientierung zu 140 × 70 cm, Platz pro Person, Reihen- und Einzelstellung sowie den Gestellen K1 bis K4.",
  path: "/wissen/klapptische-richtig-waehlen",
  keywords: ["Klapptische", "Tischgröße", "Raumplanung", "K1", "K2", "K3", "K4"],
});

export default function FoldingTablesGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
