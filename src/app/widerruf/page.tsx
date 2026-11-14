import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LegalDocument from "@/components/legal/LegalDocument";
import { withdrawalText } from "@/lib/consumer-information";
import { buildMetadata } from "@/lib/seo";
import "./print.css";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Widerruf und Muster-Widerrufsformular", description: "Informationen zum Verbraucherwiderruf bei Dalemans und Muster-Widerrufsformular.", path: "/widerruf" }),
  robots: { index: false, follow: true },
};

export default function WithdrawalPage() {
  return (
    <div className="withdrawal-page page-stack max-w-4xl">
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Widerruf" }]} currentPath="/widerruf" />
      <article className="premium-card p-6 sm:p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Verbraucherinformationen</p>
        <h1 className="section-title mt-5">Widerruf und Muster-Widerrufsformular</h1>
        <LegalDocument content={withdrawalText} />
        <nav aria-label="Weitere rechtliche Seiten" className="mt-10 flex flex-wrap gap-5 border-t border-premium-beige pt-6 text-sm underline underline-offset-4">
          <Link href="/agb">AGB</Link><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link>
        </nav>
      </article>
    </div>
  );
}
