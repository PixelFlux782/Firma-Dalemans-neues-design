import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LegalDocument from "@/components/legal/LegalDocument";
import { privacyText } from "@/lib/legal-content";
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
    <div className="page-stack max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Start", href: "/" },
          { label: "Datenschutz" },
        ]}
        currentPath="/datenschutz"
      />

      <article className="premium-card p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Rechtliches</p>
        <h1 className="section-title mt-5">Datenschutzerklärung</h1>
        <LegalDocument content={privacyText} />

        <p className="mt-10 text-sm leading-[1.75] text-premium-subtle">
          <Link
            href="/impressum"
            className="font-medium text-premium-charcoal underline-offset-4 transition hover:text-premium-bronze hover:underline"
          >
            Zum Impressum
          </Link>
        </p>
      </article>
    </div>
  );
}
