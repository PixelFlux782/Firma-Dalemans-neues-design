import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LegalDocument from "@/components/legal/LegalDocument";
import { technicalPrivacyText } from "@/lib/privacy-technical";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Datenschutz",
    description: "Datenschutzhinweise der Website von Dalemans.",
    path: "/datenschutz",
  }),
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <div className="page-stack max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Start", href: "/" },
          { label: "Datenschutz" },
        ]}
        currentPath="/datenschutz"
      />

      <article className="premium-card p-6 sm:p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Rechtliches</p>
        <h1 lang="de" className="section-title mt-5 hyphens-auto max-sm:!text-[clamp(1.25rem,6.5vw,1.65rem)]">Datenschutzerklärung</h1>
        <LegalDocument content={technicalPrivacyText} />

        <p className="mt-10 text-sm leading-[1.75] text-premium-subtle">
          <Link
            href="/impressum"
            className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline"
          >
            Zum Impressum
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/agb" className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline">Zu den AGB</Link>
        </p>
      </article>
    </div>
  );
}
