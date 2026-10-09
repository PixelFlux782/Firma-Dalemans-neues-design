import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("tischplatten-und-kanten");

export const metadata: Metadata = buildMetadata({
  title: "Tischplatten & Kanten: HPL und Melamin",
  description: "HPL, Melamin, Tischkanten, Muster, Reinigung und flache Lagerung sachlich vergleichen und passend zur Nutzung auswählen.",
  path: "/wissen/tischplatten-und-kanten",
  keywords: ["HPL", "Melamin", "Tischplatten", "Tischkanten", "Klapptische reinigen"],
});

export default function TableTopsGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
