import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Impressum",
    description: "Impressum und Anbieterkennzeichnung von Dalemans.",
    path: "/impressum",
  }),
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="page-stack max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Start", href: "/" },
          { label: "Impressum" },
        ]}
      />

      <article className="premium-card p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Rechtliches</p>
        <h1 className="section-title mt-5">Impressum</h1>
        <p className="section-lead mt-6">
          Verantwortlich für den Inhalt dieser Website:
        </p>

        <div className="mt-8 space-y-6 text-sm leading-[1.8] text-premium-muted">
          <p>
            <strong className="font-medium text-premium-ink">Dalemans</strong>
            <br />
            Bollenwaldstraße 108a
            <br />
            63743 Aschaffenburg
            <br />
            Deutschland
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Telefon</span>
            <br />
            <a
              href="tel:+499342915353"
              className="text-premium-ink transition hover:text-premium-bronze"
            >
              +49 9342 9153-53
            </a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">E-Mail</span>
            <br />
            <a
              href="mailto:info@dalemans.de"
              className="text-premium-ink transition hover:text-premium-bronze"
            >
              info@dalemans.de
            </a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">
              Umsatzsteuer-ID
            </span>
            <br />
            DE161952944
          </p>
        </div>

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
