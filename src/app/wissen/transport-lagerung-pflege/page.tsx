import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("transport-lagerung-pflege");

export const metadata: Metadata = buildMetadata({
  title: "Zubehör, Ersatzteile & Möbelpflege",
  description: "Orientierung zu Gleitern, Bodenschutz, Buchablagen, Ersatzteilen, Transport, Lagerung, Pflege und Reparatur.",
  path: "/wissen/transport-lagerung-pflege",
  keywords: ["Stuhlgleiter", "Bodenschutz", "Buchablage", "Stapelstühle lagern", "Klapptische lagern", "Möbel Ersatzteile"],
});

export default function TransportStorageCareGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
