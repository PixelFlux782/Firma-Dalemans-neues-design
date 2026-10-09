import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import { knowledgeCategories } from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Wissen & Materialien",
  description:
    "Wissen zu Stoffen, Polstern, Tischplatten, Oberflächen, Tischkanten und Tischkonstruktionen bei Dalemans.",
  path: "/wissen",
  keywords: ["Materialwissen", "Stoffgruppen", "Tischplatten", "Tischkanten", "Klapptische"],
});

export default function WissenPage() {
  return (
    <div className="page-stack">
      <header className="relative overflow-hidden rounded-5xl bg-premium-forest px-7 py-9 text-white shadow-premium-xl sm:px-9 md:px-12 md:py-14 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_85%_0%,rgba(201,213,191,.2),transparent_65%)]" aria-hidden />
        <div className="relative">
          <Breadcrumbs
            currentPath="/wissen"
            items={[{ label: "Start", href: "/" }, { label: "Wissen" }]}
            className="text-white/65 [&_[aria-current=page]]:text-white"
          />
          <p className="section-eyebrow mt-10 text-premium-sand">DLMNS Wissenswelt</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Wissen & Materialien
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
            Gut informiert. Passend entschieden.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            Verlässliche Informationen zu Materialien, Ausstattung und Konstruktion – zentral gepflegt und verständlich aufbereitet.
          </p>
        </div>
      </header>

      <section aria-labelledby="knowledge-categories">
        <div className="max-w-3xl">
          <p className="section-eyebrow">Themen entdecken</p>
          <h2 id="knowledge-categories" className="section-title mt-5">Vier Bereiche für eine fundierte Auswahl</h2>
          <p className="section-lead mt-5">Beginnen Sie bei dem Detail, das für Ihre Planung gerade zählt. Die Wissenswelt wächst mit allen bestätigten Informationen.</p>
        </div>

        <div className="mt-10 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {knowledgeCategories.map((category, index) => (
            <article key={category.id} className="group grid gap-5 py-8 md:grid-cols-[4rem_minmax(0,1fr)_minmax(14rem,.75fr)_auto] md:items-center md:gap-7 lg:py-10">
              <p className="font-display text-3xl text-premium-stone" aria-hidden>{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="font-display text-2xl font-medium text-premium-ink md:text-3xl">
                  <Link href={`/wissen/${category.slug}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4">
                    {category.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-premium-muted">{category.description}</p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-premium-muted" aria-label={`Themen in ${category.title}`}>
                {category.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}
              </ul>
              <Link href={`/wissen/${category.slug}`} aria-label={`${category.title} öffnen`} className="inline-flex size-11 items-center justify-center rounded-full border border-premium-beige bg-white/60 text-lg text-premium-forest transition group-hover:border-premium-sage group-hover:bg-white group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <PremiumCtaSection
        eyebrow="Persönliche Orientierung"
        title="Materialfragen lassen sich am besten im Zusammenhang klären."
        lead="Wir unterstützen Sie bei der Auswahl für Ihren Raum, Ihre Nutzung und Ihre gewünschte Ausstattung."
        primaryHref="/kontakt?anliegen=Materialberatung"
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte"
        secondaryLabel="Produkte ansehen"
        showDirectContact
      />
    </div>
  );
}
