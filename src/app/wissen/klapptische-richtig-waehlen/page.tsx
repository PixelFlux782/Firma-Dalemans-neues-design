import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("klapptische-richtig-waehlen");

export const metadata: Metadata = buildMetadata({
  title: "Klapptische richtig wählen und planen",
  description: "Orientierung zu Tischmaßen, Sitzplatzbedarf, 2:1-Blockstellungen, Gestellen K1 bis K4, Modell 210 und Sonderausführungen.",
  path: "/wissen/klapptische-richtig-waehlen",
  keywords: ["Klapptische", "Tischgröße", "Sitzplatzbedarf", "2:1 Tischmaß", "Blockstellung", "K1", "K2", "K3", "K4"],
});

export default function FoldingTablesGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
