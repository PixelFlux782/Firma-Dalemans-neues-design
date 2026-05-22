import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Datenschutz",
    description: "Datenschutzhinweise der Website von Dalemans.",
    path: "/datenschutz",
  }),
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="page-stack max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Start", href: "/" },
          { label: "Datenschutz" },
        ]}
      />

      <article className="premium-card p-8 md:p-10 lg:p-12">
        <p className="section-eyebrow">Rechtliches</p>
        <h1 className="section-title mt-5">Datenschutzerklärung</h1>
        <p className="section-lead mt-6">
          Wir nehmen den Schutz Ihrer Daten ernst. Nachfolgend informieren wir
          Sie über die wichtigsten Punkte im Zusammenhang mit dieser Website.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-[1.8] text-premium-muted">
          <section>
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
              Verantwortlicher
            </h2>
            <p className="mt-4">
              Dalemans, Bollenwaldstraße 108a, 63743 Aschaffenburg, Deutschland.
              Kontakt:{" "}
              <a
                href="mailto:info@dalemans.de"
                className="text-premium-ink transition hover:text-premium-bronze"
              >
                info@dalemans.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
              Kontaktformular
            </h2>
            <p className="mt-4">
              Wenn Sie uns über das Formular auf der Seite{" "}
              <Link
                href="/kontakt"
                className="text-premium-ink underline-offset-4 transition hover:text-premium-bronze hover:underline"
              >
                Kontakt
              </Link>{" "}
              eine Nachricht senden, verwenden wir Ihre Angaben ausschließlich
              zur Bearbeitung Ihrer Anfrage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
              Server-Logdateien
            </h2>
            <p className="mt-4">
              Beim Aufruf dieser Website können technisch notwendige
              Protokolldaten (z. B. IP-Adresse, Zeitpunkt, Browsertyp)
              automatisch erfasst werden, um den sicheren Betrieb zu gewährleisten.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
              Ihre Rechte
            </h2>
            <p className="mt-4">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung sowie Widerspruch gegen die
              Verarbeitung Ihrer personenbezogenen Daten im Rahmen der
              gesetzlichen Vorgaben.
            </p>
          </section>
        </div>

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
