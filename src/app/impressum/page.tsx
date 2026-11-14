import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
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

      <article className="premium-card p-6 sm:p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Kontaktinformationen</p>
        <h1 className="section-title mt-5">Impressum</h1>

        <div className="mt-8 space-y-6 text-sm leading-[1.8] text-premium-muted">
          <p>
            <span className="font-medium text-premium-charcoal">Anschrift</span>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">{company.legalName}</a>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">{company.address.streetAddress}</a>
            <br />
            <a href="https://goo.gl/maps/wfVuLYysaqfAGWLR6" className="text-premium-ink transition hover:text-premium-bronze">{company.address.postalCode} {company.address.addressLocality}</a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">E-Mail</span>
            <br />
            <a
              href={company.emailHref}
              className="text-premium-ink transition hover:text-premium-bronze"
            >
              {company.email}
            </a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Telefon:</span>
            <br />
            <a href={company.telephoneHref}>{company.telephone}</a>
            <br />
            <a href={company.mobileHref}>{company.mobile}</a>
          </p>

          <p>
            <span className="font-medium text-premium-charcoal">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG</span>
            <br />
            {company.vatId}
          </p>
        </div>

        <p className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-premium-beige pt-6 text-sm leading-[1.75] text-premium-subtle">
          <Link
            href="/datenschutz"
            className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline"
          >
            Datenschutzerklärung
          </Link>
          <Link href="/agb" className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline">Allgemeine Geschäftsbedingungen</Link>
        </p>
      </article>
    </div>
  );
}
