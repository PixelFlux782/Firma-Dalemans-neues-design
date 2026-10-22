import type { Metadata } from "next";
import InquiryCartSummary from "@/components/commerce/InquiryCartSummary";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Persönliches Angebot anfragen",
  description: "Prüfen Sie Ihre Produktauswahl und bereiten Sie eine unverbindliche Angebotsanfrage bei Dalemans vor.",
  path: "/anfrage",
});

export default function AnfragePage() {
  return (
    <div className="page-stack">
      <section className="py-8 sm:py-12">
        <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Anfrage" }]} currentPath="/anfrage" />
        <p className="section-eyebrow mt-8">Unverbindliche Anfrage</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight text-premium-ink sm:text-5xl">Persönliches Angebot anfragen</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-premium-muted">Prüfen Sie Ihre ausgewählten Produkte, Ausführungen, Mengen und Preise. Diese Übersicht ist keine verbindliche Bestellung.</p>
      </section>
      <InquiryCartSummary />
    </div>
  );
}
