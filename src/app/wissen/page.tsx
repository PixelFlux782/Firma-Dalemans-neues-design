import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CtaBanner from "@/components/ui/CtaBanner";
import { getPublishedGuides } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Wissen & Beratung für flexible Räume",
  description: "Praxiswissen zu Stapelstühlen, Klapptischen, Bezugsstoffen, Raumplanung, Sicherheit, Transport, Pflege und Ersatzteilen.",
  path: "/wissen",
  keywords: ["Stapelstühle Ratgeber", "Klapptische Ratgeber", "Stoffberatung", "Raumplanung"],
});

const themes = [
  { title: "Stapelstühle", description: "Auswahl, Polsterung und Ausstattung passend zur Nutzung einordnen.", href: "/wissen/stapelstuehle-richtig-auswaehlen", linkLabel: "Stapelstühle auswählen", number: "01" },
  { title: "Klapptische", description: "Maße, Platzbedarf, Aufstellung und Gestelle aus der Praxis erklärt.", href: "/wissen/klapptische-richtig-waehlen", linkLabel: "Klapptische auswählen", number: "02" },
  { title: "Stoffe & Materialien", description: "Stoffgruppen, Martindale, Materialien und Nachweise verständlich prüfen.", href: "/wissen/stoffe-und-bezuege", linkLabel: "Stoffratgeber lesen", number: "03" },
  { title: "Raumplanung", description: "Bestuhlung, Wege und flexible Nutzungen von Anfang an zusammendenken.", href: "/raumplaner", linkLabel: "Zum Raumplaner", number: "04" },
  { title: "Reihenbestuhlung", description: "Reihenverbinder, Nachrüstung und Bestuhlungsplan gemeinsam betrachten.", href: "/wissen/reihenverbinder-fuer-stapelstuehle", linkLabel: "Reihenverbinder einplanen", number: "05" },
  { title: "Transport & Lagerung", description: "Umbauwege, Stapelung und Lagerfläche sinnvoll in die Auswahl einbeziehen.", href: "/wissen/transport-lagerung-pflege", linkLabel: "Praxiswerte lesen", number: "06" },
  { title: "Pflege & Ersatzteile", description: "Oberflächen erhalten und vorhandene Ausstattung langfristig weiter nutzen.", href: "/wissen/transport-lagerung-pflege", linkLabel: "Pflegehinweise lesen", number: "07" },
] as const;

export default function WissenPage() {
  const guides = getPublishedGuides();
  return (
    <div className="page-stack">
      <header className="relative overflow-hidden rounded-5xl bg-premium-forest px-7 py-9 text-white shadow-premium-xl sm:px-9 md:px-12 md:py-14 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_85%_0%,rgba(201,213,191,.2),transparent_65%)]" aria-hidden />
        <div className="relative">
          <Breadcrumbs currentPath="/wissen" items={[{ label: "Start", href: "/" }, { label: "Wissen" }]} className="text-white/65 [&_[aria-current=page]]:text-white" />
          <p className="section-eyebrow mt-10 text-premium-sand">Wissen aus der Beratungspraxis</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">Gut entscheiden, bevor der Raum eingerichtet wird.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">Sachliche Orientierung zu Stühlen, Tischen, Materialien und Planung – verständlich aufbereitet und dort zurückhaltend, wo die konkrete Ausführung geprüft werden muss.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link href="#ratgeber" className="btn-on-dark text-center">Ratgeber lesen</Link><Link href="/kontakt?anliegen=Beratung" className="btn-outline-dark text-center">Persönlich beraten lassen</Link></div>
        </div>
      </header>

      <section aria-labelledby="knowledge-topics">
        <div className="max-w-3xl"><p className="section-eyebrow">Themen entdecken</p><h2 id="knowledge-topics" className="section-title mt-5">Sieben Zugänge für konkrete Fragen.</h2><p className="section-lead mt-5">Jeder Einstieg führt zu einem veröffentlichten Ratgeber oder zu einem bestehenden Planungswerkzeug.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <article key={theme.title} className={`flex min-w-0 flex-col rounded-3xl border p-6 md:p-7 ${"href" in theme ? "border-premium-beige/70 bg-white/70 shadow-[0_8px_28px_rgba(20,18,16,.04)]" : "border-premium-beige/60 bg-premium-warm/45"}`}>
              <p className="font-display text-3xl text-premium-stone" aria-hidden>{theme.number}</p><h3 className="mt-5 font-display text-2xl font-medium text-premium-ink">{theme.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">{theme.description}</p>
              {"href" in theme ? <Link href={theme.href} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{theme.linkLabel} <span className="ml-2" aria-hidden>→</span></Link> : <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-premium-subtle">In redaktioneller Vorbereitung</p>}
            </article>
          ))}
        </div>
      </section>

      <section id="ratgeber" className="scroll-mt-28" aria-labelledby="published-guides">
        <p className="section-eyebrow">Fundiert & geprüft</p><h2 id="published-guides" className="section-title mt-5">Aktuelle Ratgeber.</h2>
        <div className="mt-9 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {guides.map((guide, index) => (
            <article key={guide.slug} className="group grid gap-5 py-8 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:items-center md:gap-7 lg:py-10">
              <p className="font-display text-3xl text-premium-stone" aria-hidden>{String(index + 1).padStart(2, "0")}</p>
              <div><p className="section-eyebrow">{guide.category}</p><h3 className="mt-3 font-display text-2xl font-medium text-premium-ink md:text-3xl"><Link href={`/wissen/${guide.slug}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4">{guide.title}</Link></h3><p className="mt-3 max-w-2xl text-sm leading-7 text-premium-muted">{guide.description}</p></div>
              <Link href={`/wissen/${guide.slug}`} aria-label={`${guide.title} lesen`} className="inline-flex size-11 items-center justify-center rounded-full border border-premium-beige bg-white/60 text-lg text-premium-forest transition group-hover:translate-x-1 group-hover:border-premium-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"><span aria-hidden>→</span></Link>
            </article>
          ))}
        </div>
        <div className="mt-7 flex flex-col gap-4 rounded-3xl border border-premium-beige/70 bg-premium-warm/60 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-xl font-medium text-premium-ink">Stoffkarten der Gruppen 2, 3 und 4</h3><p className="mt-2 text-sm leading-6 text-premium-muted">Geprüfte Downloads erscheinen, sobald aktuelle öffentliche Dateien vorliegen.</p></div><Link href="/wissen/stoffkarten" className="btn-secondary shrink-0 text-center">Zur Stoffbibliothek</Link></div>
      </section>

      <CtaBanner eyebrow="Persönliche Orientierung" title="Material- und Planungsfragen im Zusammenhang klären." lead="Wir unterstützen Sie bei der Auswahl für Ihren Raum, Ihre Nutzung und die gewünschte Ausstattung." primaryHref="/kontakt?anliegen=Beratung" primaryLabel="Beratung anfragen" secondaryHref="/raumplaner" secondaryLabel="Raumplaner öffnen" />
    </div>
  );
}
