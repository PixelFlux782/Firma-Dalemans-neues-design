import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LegalDocument from "@/components/legal/LegalDocument";
import { agbText } from "@/lib/legal-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Allgemeine Geschäftsbedingungen",
    description: "Verkaufs-, Lieferungs- und Zahlungsbedingungen von Dalemans.",
    path: "/agb",
  }),
  robots: { index: false, follow: true },
};

export default function AgbPage() {
  return (
    <div className="page-stack max-w-4xl">
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "AGB" }]} currentPath="/agb" />
      <article className="premium-card p-6 sm:p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Rechtliches</p>
        <h1 lang="de" className="section-title mt-5 hyphens-auto max-sm:!text-[clamp(1.25rem,6.5vw,1.65rem)]">AGB –{"\u00a0"}Verkaufs-, Lieferungs- und Zahlungsbedingungen</h1>
        <LegalDocument content={agbText} />
        <nav aria-label="Weitere rechtliche Seiten" className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-premium-beige pt-6 text-sm">
          <Link href="/widerruf" className="font-medium text-premium-charcoal underline-offset-4 hover:underline">Widerruf und Muster-Widerrufsformular</Link>
          <Link href="/impressum" className="font-medium text-premium-charcoal underline-offset-4 hover:text-premium-bronze hover:underline">Impressum</Link>
          <Link href="/datenschutz" className="font-medium text-premium-charcoal underline-offset-4 hover:text-premium-bronze hover:underline">Datenschutzerklärung</Link>
        </nav>
      </article>
    </div>
  );
}
