import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("stoffe-und-bezuege");

export const metadata: Metadata = buildMetadata({
  title: "Bezugsstoffe & Stoffgruppen für Stapelstühle",
  description: "Industriestoffe, Stoffgruppen, Martindale, einfarbige Bezüge, Pflege, Nachbestellung und konkrete Nachweise verständlich erklärt.",
  path: "/wissen/stoffe-und-bezuege",
  keywords: ["Industriestoffe", "Bezugsstoffe", "Stoffgruppen", "Martindale", "Abriebfestigkeit", "Stapelstühle", "B1"],
});

export default function FabricsGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
