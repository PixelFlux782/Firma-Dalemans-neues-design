import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CtaBanner from "@/components/ui/CtaBanner";
import { fabricCards, hasVerifiedFabricCard } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stoffkarten für Stapelstühle",
  description: "Stoffgruppen 2, 3 und 4 im Überblick. Stoffkarten, Muster und persönliche Stoffberatung bei Dalemans.",
  path: "/wissen/stoffkarten",
  keywords: ["Stoffkarten", "Stoffmuster", "Stoffgruppe 2", "Stoffgruppe 3", "Stoffgruppe 4"],
});

const groupNotes = {
  2: "Eine Auswahl für unterschiedliche Raumkonzepte. Eigenschaften und Eignung werden immer an der konkreten Stoffvariante geprüft.",
  3: "In dieser Gruppe sind laut Dalemans in der Regel Varianten mit B1-Eigenschaften erhältlich. Entscheidend bleibt der Einzelnachweis.",
  4: "Weitere Farben und Materialien für eine differenzierte Gestaltung. Die Gruppennummer allein ist kein Qualitätsversprechen.",
} as const;

export default function FabricCardsPage() {
  return (
    <div className="page-stack">
      <header className="rounded-5xl border border-white/60 bg-white/80 px-7 py-9 shadow-premium backdrop-blur-sm sm:px-9 md:px-12 md:py-14 lg:px-16">
        <Breadcrumbs currentPath="/wissen/stoffkarten" items={[{ label: "Start", href: "/" }, { label: "Wissen", href: "/wissen" }, { label: "Stoffkarten" }]} />
        <p className="section-eyebrow mt-10">Stoffbibliothek</p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl lg:text-6xl">Stoffgruppen in Ruhe vergleichen.</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-premium-muted md:text-lg">Hier finden Sie die Dalemans-Stoffgruppen 2, 3 und 4. Eine Gruppe ist eine Sortimentszuordnung – keine genormte Qualitäts- oder Brandschutzklasse.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link href="/wissen/stoffe-und-bezuege" className="btn-primary text-center">Stoffratgeber lesen</Link><Link href="/kontakt?anliegen=Stoffmuster" className="btn-secondary text-center">Stoffmuster anfragen</Link></div>
      </header>

      <section aria-labelledby="fabric-card-groups">
        <p className="section-eyebrow">Gruppen 2–4</p>
        <h2 id="fabric-card-groups" className="section-title mt-4">Verfügbare Unterlagen und persönliche Muster.</h2>
        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {fabricCards.map((card) => {
            const downloadable = hasVerifiedFabricCard(card);
            return (
              <article key={card.group} id={`stoffgruppe-${card.group}`} className="scroll-mt-28 rounded-4xl border border-premium-beige/70 bg-white/70 p-7 shadow-[0_8px_28px_rgba(20,18,16,.04)] md:p-8">
                <div className="flex items-start justify-between gap-4"><div><p className="section-eyebrow">Bezugsstoffe</p><h3 className="mt-3 font-display text-3xl font-medium text-premium-ink">{card.title}</h3></div><span className="font-display text-4xl text-premium-stone" aria-hidden>{card.group}</span></div>
                <p className="mt-5 text-sm leading-7 text-premium-muted">{groupNotes[card.group]}</p>
                <div className="mt-7 border-t border-premium-beige/70 pt-6">
                  {downloadable ? <a href={card.publicUrl} className="btn-primary w-full text-center" download>Stoffkarte herunterladen</a> : <div className="rounded-2xl bg-premium-warm/75 p-4"><p className="text-sm font-semibold text-premium-ink">Stoffkarte wird geprüft</p><p className="mt-2 text-xs leading-6 text-premium-muted">Derzeit ist keine aktuell geprüfte öffentliche PDF hinterlegt. Gern senden wir Ihnen passende Muster und Unterlagen persönlich.</p><Link href={`/kontakt?anliegen=${encodeURIComponent(`Stoffmuster ${card.title}`)}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline underline-offset-4">Muster zu {card.title} anfragen</Link></div>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 rounded-4xl border border-premium-beige/70 bg-premium-warm/60 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10" aria-labelledby="fabric-advice">
        <div><p className="section-eyebrow">Gut zu wissen</p><h2 id="fabric-advice" className="mt-4 font-display text-2xl font-medium text-premium-ink">Technische Werte gehören immer zur einzelnen Variante.</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">Material, Scheuertouren, Pflege und Brandschutznachweise können innerhalb einer Gruppe variieren. Im Stoffratgeber erfahren Sie, wie diese Angaben sinnvoll eingeordnet werden.</p></div>
        <Link href="/wissen/stoffe-und-bezuege" className="btn-secondary shrink-0 text-center">Zum Stoffratgeber</Link>
      </section>

      <CtaBanner eyebrow="Bemusterung" title="Farben und Haptik am besten im Raum beurteilen." lead="Wir stellen eine passende Musterauswahl zusammen und beraten zu Nutzung, Pflege und erforderlichen Nachweisen." primaryHref="/kontakt?anliegen=Stoffmuster" primaryLabel="Stoffmuster anfragen" secondaryHref="/kontakt?anliegen=Stoffberatung" secondaryLabel="Persönlich beraten lassen" />
    </div>
  );
}
