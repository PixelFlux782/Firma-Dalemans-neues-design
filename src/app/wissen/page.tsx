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

const knowledgeTopicGroups = [
  {
    id: "stapelstuehle",
    number: "01",
    title: "Stapelstühle",
    description: "Kauf, Verarbeitung, Schichtholz, Reihen und langlebige Nutzung fundiert planen.",
    topics: ["Kaufberatung", "Qualität & Verarbeitung", "Schichtholz & Gestelle", "Reihenverbinder", "Bestuhlungsplanung", "Langlebigkeit"],
    guideSlugs: ["stapelstuehle-richtig-auswaehlen", "reihenverbinder-fuer-stapelstuehle"],
    relatedLinks: [
      { href: "/produkte/stapelstuehle", label: "Stapelstuhlmodelle ansehen" },
      { href: "/raumplaner", label: "Bestuhlung im Raum planen" },
    ],
  },
  {
    id: "klapptische",
    number: "02",
    title: "Klapptische",
    description: "Tischmaße, Sitzplatzbedarf, Blockstellungen, Gestelle, Kanten und Oberflächen vergleichen.",
    topics: ["Das richtige Tischmaß", "Sitzplatzbedarf", "Blockstellung & 2:1", "Gestelle K1–K4", "Tischkanten", "HPL versus Melamin"],
    guideSlugs: ["klapptische-richtig-waehlen", "tischplatten-und-kanten"],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Klapptische ansehen" },
      { href: "/produkte/tischfuesse-gestellteile", label: "Tischgestelle vergleichen" },
    ],
  },
  {
    id: "stoffe-polsterung",
    number: "03",
    title: "Stoffe & Polsterung",
    description: "Industriestoffe, Stoffgruppen, Martindale, Farben und spätere Ergänzungen einordnen.",
    topics: ["Industriestoffe", "Stoffgruppen", "Martindale", "Abriebfestigkeit", "Farben & Gestaltung", "Nachbestellung & Reparatur"],
    guideSlugs: ["stoffe-und-bezuege"],
    relatedLinks: [
      { href: "/wissen/stoffkarten", label: "Stoffkarten der Gruppen 2–4" },
      { href: "/kontakt?anliegen=Stoffmuster", label: "Echtes Stoffmuster anfragen" },
    ],
  },
  {
    id: "zubehoer-pflege",
    number: "04",
    title: "Zubehör & Pflege",
    description: "Gleiter, Bodenschutz, Buchablagen, Ersatzteile, Pflege und Werterhalt passend zum Bestand auswählen.",
    topics: ["Gleiter & Bodenschutz", "Reihenverbinder & Zubehör", "Buchablagen", "Ersatzteile", "Pflege", "Werterhalt"],
    guideSlugs: ["transport-lagerung-pflege"],
    relatedLinks: [
      { href: "/produkte/gleiter-finder", label: "Gleiter mit Messhilfe finden" },
      { href: "/produkte/kategorien/transportwagen-zubehoer", label: "Zubehör & Ersatzteile ansehen" },
      { href: "/produkte/artikel/buchablage-nachruesten", label: "Buchablage nachrüsten" },
    ],
  },
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
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">Hier teilen wir unsere Erfahrung zu Stühlen, Tischen, Materialien und Raumplanung. Wo es auf das konkrete Modell ankommt, sagen wir Ihnen genau, was wir noch prüfen müssen.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link href="#themenbereiche" className="btn-on-dark text-center">Ratgeber nach Themen</Link><Link href="/kontakt?anliegen=Beratung" className="btn-outline-dark text-center">Persönlich beraten lassen</Link></div>
        </div>
      </header>

      <section aria-labelledby="knowledge-topics">
        <div className="max-w-3xl"><p className="section-eyebrow">Themen entdecken</p><h2 id="knowledge-topics" className="section-title mt-5">Vier klare Wege zum passenden Fachwissen.</h2><p className="section-lead mt-5">Jeder Einstieg führt direkt zum Themenbereich mit allen zugeordneten, vollständig erreichbaren Ratgebern.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {knowledgeTopicGroups.map((theme) => (
            <article key={theme.id} className="flex min-w-0 flex-col rounded-3xl border border-premium-beige/70 bg-white/70 p-6 shadow-[0_8px_28px_rgba(20,18,16,.04)] md:p-7">
              <p className="font-display text-3xl text-premium-stone" aria-hidden>{theme.number}</p><h3 className="mt-5 font-display text-2xl font-medium text-premium-ink">{theme.title}</h3><p className="mt-3 text-sm leading-7 text-premium-muted">{theme.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Themen in ${theme.title}`}>{theme.topics.map((topic) => <li key={topic} className="rounded-full bg-premium-warm px-3 py-1.5 text-xs font-medium text-premium-charcoal">{topic}</li>)}</ul>
              <Link href={`#${theme.id}`} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">Zum Themenbereich <span className="ml-2" aria-hidden>→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section id="themenbereiche" className="scroll-mt-28" aria-labelledby="published-guides">
        <p className="section-eyebrow">Fundiert & geprüft</p><h2 id="published-guides" className="section-title mt-5">Ratgeber nach Themen.</h2>
        <div className="mt-10 space-y-16 md:space-y-20">
          {knowledgeTopicGroups.map((topic) => {
            const topicGuides = guides.filter((guide) => topic.guideSlugs.some((slug) => slug === guide.slug));
            return (
              <section key={topic.id} id={topic.id} className="scroll-mt-28 border-t border-premium-beige/80 pt-9" aria-labelledby={`${topic.id}-title`}>
                <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
                  <div><p className="font-display text-3xl text-premium-stone" aria-hidden>{topic.number}</p><p className="section-eyebrow mt-3">Themenbereich</p></div>
                  <div><h3 id={`${topic.id}-title`} className="font-display text-3xl font-medium text-premium-ink sm:text-4xl">{topic.title}</h3><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">{topic.description}</p></div>
                </div>
                <div className="mt-8 grid gap-5 lg:ml-[14.5rem] lg:grid-cols-2">
                  {topicGuides.map((guide) => (
                    <article key={guide.slug} className="flex min-w-0 flex-col rounded-3xl border border-premium-beige/70 bg-white/70 p-6 shadow-[0_8px_28px_rgba(20,18,16,.04)]">
                      <p className="section-eyebrow">Ausführlicher Ratgeber</p>
                      <h4 className="mt-3 font-display text-2xl font-medium text-premium-ink"><Link href={`/wissen/${guide.slug}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4">{guide.title}</Link></h4>
                      <p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">{guide.description}</p>
                      <Link href={`/wissen/${guide.slug}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">Vollständigen Ratgeber lesen <span className="ml-2" aria-hidden>→</span></Link>
                    </article>
                  ))}
                </div>
                <nav aria-label={`Weitere Links zu ${topic.title}`} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 lg:ml-[14.5rem]">
                  {topic.relatedLinks.map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{link.label} <span className="ml-2" aria-hidden>→</span></Link>)}
                </nav>
              </section>
            );
          })}
        </div>
      </section>

      <CtaBanner eyebrow="Persönliche Orientierung" title="Material- und Planungsfragen im Zusammenhang klären." lead="Wir unterstützen Sie bei der Auswahl für Ihren Raum, Ihre Nutzung und die gewünschte Ausstattung." primaryHref="/kontakt?anliegen=Beratung" primaryLabel="Beratung anfragen" secondaryHref="/raumplaner" secondaryLabel="Raumplaner öffnen" />
    </div>
  );
}
