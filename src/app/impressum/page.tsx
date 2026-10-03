import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LegalDocument from "@/components/legal/LegalDocument";
import { agbText } from "@/lib/legal-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Impressum",
    description: "Impressum und Anbieterkennzeichnung von Dalemans.",
    path: "/impressum",
  }),
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <div className="page-stack max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Start", href: "/" },
          { label: "Impressum" },
        ]}
        currentPath="/impressum"
      />

      <article className="premium-card p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Kontaktinformationen</p>
        <h1 className="section-title mt-5">Impressum und Rechtliches</h1>

        <div className="mt-8 space-y-6 text-sm leading-[1.8] text-premium-muted">
          <p>
            <span className="font-medium text-premium-charcoal">Anschrift</span>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">Dalemans Sitzmöbel und Tische</a>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">Bollenwaldstraße 108a</a>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">63743 Aschaffenburg</a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Email</span>
            <br />
            <a
              href="mailto:info@dalemans.de"
              className="text-premium-ink transition hover:text-premium-bronze"
            >
              info@dalemans.de
            </a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Telefon:</span>
            <br />
            +49 9342 9153-53
            <br />
            +49 170 5555331
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Ust.-ID:</span>
            <br />
            DE161952944
          </p>
        </div>

        <section className="mt-12 border-t border-premium-ink/10 pt-8">
          <p className="section-eyebrow">AGB</p>
          <h2 className="section-title mt-4 text-2xl md:text-3xl">
            Verkaufs-, Lieferungs- und Zahlungsbedingungen
          </h2>
          <LegalDocument content={agbText.split(/\r?\n/).slice(1).join("\n")} />
        </section>

        <p className="mt-10 text-sm leading-[1.75] text-premium-subtle">
          <Link
            href="/datenschutz"
            className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline"
          >
            Datenschutzerklärung
          </Link>
        </p>
      </article>
    </div>
  );
}
