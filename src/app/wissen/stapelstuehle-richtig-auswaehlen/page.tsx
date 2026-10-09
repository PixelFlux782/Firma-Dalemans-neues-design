import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("stapelstuehle-richtig-auswaehlen");

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle für flexible Räume auswählen",
  description: "Stapelstühle nach Raum, Nutzung, Polsterung, Reihenverbindung und Verarbeitung auswählen – mit Musterstuhl-Empfehlung.",
  path: "/wissen/stapelstuehle-richtig-auswaehlen",
  keywords: ["Stapelstühle auswählen", "Musterstuhl", "Reihenverbinder", "Sitzpolster"],
});

export default function StackingChairsGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
