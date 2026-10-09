import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("reihenverbinder-fuer-stapelstuehle");

export const metadata: Metadata = buildMetadata({
  title: "Reihenverbinder für Stapelstühle einplanen",
  description: "Vorteile von Reihenverbindern, Werksausführung, Nachrüstung und Anforderungen des genehmigten Bestuhlungsplans einordnen.",
  path: "/wissen/reihenverbinder-fuer-stapelstuehle",
  keywords: ["Reihenverbinder", "Reihenbestuhlung", "Stapelstuhl verbinden", "Bestuhlungsplan"],
});

export default function RowConnectorsGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
