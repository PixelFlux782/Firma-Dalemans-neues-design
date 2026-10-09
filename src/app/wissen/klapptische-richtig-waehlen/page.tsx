import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("klapptische-richtig-waehlen");

export const metadata: Metadata = buildMetadata({
  title: "Klapptische richtig wählen und planen",
  description: "Orientierung zu zwölf Tischmaßen, dem 2:1-Prinzip, Gestellen K1 und K3, Modell 210 und Sonderausführungen.",
  path: "/wissen/klapptische-richtig-waehlen",
  keywords: ["Klapptische", "Tischgröße", "2:1 Tischmaß", "Raumplanung", "K1", "K3"],
});

export default function FoldingTablesGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
