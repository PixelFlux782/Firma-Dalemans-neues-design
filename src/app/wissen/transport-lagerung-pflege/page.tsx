import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/knowledge/GuidePage";
import { getPublishedGuide } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

const article = getPublishedGuide("transport-lagerung-pflege");

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle & Klapptische lagern und pflegen",
  description: "Orientierung zu Stapelhöhen, Transportwagen, flacher Tischlagerung, Polsterpflege, Ersatzteilen und Reparatur.",
  path: "/wissen/transport-lagerung-pflege",
  keywords: ["Stapelstühle lagern", "Klapptische lagern", "Polster reinigen", "Möbel Ersatzteile"],
});

export default function TransportStorageCareGuidePage() {
  if (!article) notFound();
  return <GuidePage article={article} />;
}
