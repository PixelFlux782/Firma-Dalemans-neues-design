import type { Metadata } from "next";
import Link from "next/link";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import HomeSection from "@/components/home/HomeSection";
import { getCollections } from "@/lib/commerce/service";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shop für Zubehör, Ersatzteile und Nachrüstung",
  description:
    "Ausstattung, Ersatzteile und Zubehör für bestehende Bestuhlungen – mit persönlicher Hilfe bei Auswahl, Maßen und Kompatibilität.",
  path: "/shop",
  keywords: ["Dalemans Shop", "Stuhlzubehör", "Ersatzteile", "Nachrüstung"],
});

const strengths = [
  {
    title: "Persönlich statt anonym",
    text: "Wenn Maße oder Modelle nicht eindeutig sind, schauen wir gemeinsam auf den vorhandenen Bestand.",
  },
  {
    title: "Für langfristige Nutzung",
    text: "Ersatzteile und Nachrüstung helfen, bewährte Bestuhlungen sinnvoll weiterzuverwenden.",
  },
  {
    title: "Kompatibilität zuerst",
    text: "Foto, Maß und Einbausituation sind oft wichtiger als eine schnelle, aber unsichere Auswahl.",
  },
] as const;

export default async function ShopPage() {
  const collections = await getCollections();

  return (
    <div className="page-stack">
      <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-premium-ink px-6 py-10 text-white shadow-premium-lg sm:px-10 md:py-14 lg:min-h-[600px] lg:px-14 lg:py-16">
        <div className="absolute inset-0 opacity-90 [background:radial-gradient(circle_at_82%_18%,rgba(201,213,191,.2),transparent_30%),linear-gradient(135deg,#17251d_0%,#123322_60%,#0d1712_100%)]" aria-hidden />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full border border-white/10" aria-hidden />
        <div className="absolute -bottom-12 right-24 h-60 w-60 rounded-full border border-white/[0.07]" aria-hidden />
        <div className="relative grid min-h-[500px] items-end gap-12 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
          <div>
            <Breadcrumbs
              items={[{ label: "Start", href: "/" }, { label: "Shop" }]}
              currentPath="/shop"
              className="text-white/65 [&_[aria-current=page]]:text-white"
            />
            <p className="section-eyebrow mt-10 text-premium-sand">DLMNS Shop</p>
            <h1 className="mt-5 max-w-[15ch] font-display text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl lg:text-[4rem]">
              Ausstattung, Ersatzteile und Zubehör für Räume, die funktionieren.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Durchdachte Ergänzungen für vorhandene Bestuhlungen – ruhig ausgewählt, passend eingeordnet und persönlich begleitet.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#collections" className="btn-on-dark text-center">Produkte entdecken</Link>
              <Link href="/shop/gleiter-finder" prefetch={false} className="btn-outline-dark text-center">
                Passendes Ersatzteil finden
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-sand">Noch nicht sicher?</p>
            <h2 className="mt-4 font-display text-2xl font-medium tracking-[-0.02em] text-white">
              Form und Außenmaß führen zum passenden Gleiter.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Der Gleiter-Finder grenzt passende Varianten anhand von Gestellform, Maß und Boden ein. Bei Unsicherheit bleiben Foto und persönliche Prüfung der beste Weg.
            </p>
            <Link href="/shop/gleiter-finder" prefetch={false} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-premium-sand/60 underline-offset-4 transition hover:decoration-white">
              Gleiter-Finder starten <span className="ml-2" aria-hidden>→</span>
            </Link>
          </aside>
        </div>
      </section>

      <HomeSection id="collections">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Sortiment entdecken</p>
            <h2 className="section-title mt-4">Nach Aufgabe auswählen, nicht nach Shoplogik.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-premium-muted">
            Die lokale Produktauswahl bildet die Customer Experience ab. Preise und Verfügbarkeit werden erst nach finaler Sortimentsprüfung verbindlich.
          </p>
        </div>

        <div className="section-grid-top grid gap-x-8 gap-y-14 lg:grid-cols-2 lg:gap-y-20">
          {collections.map((collection, index) => (
            <article key={collection.id} className={`group min-w-0 ${index % 2 ? "lg:translate-y-16" : ""}`}>
              <Link href={`/shop/${collection.handle}`} className="block overflow-hidden rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4" aria-label={`${collection.title} ansehen`}>
                <CommerceMedia
                  image={collection.image}
                  fallbackLabel={collection.title}
                  priority={index < 2}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  aspectRatio="5 / 4"
                  className="transition duration-700 ease-out group-hover:scale-[1.012]"
                  imageInset={collection.handle === "transport-lagerung" ? "4%" : "7%"}
                />
              </Link>
              <div className="border-t border-premium-beige/80 px-1 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-premium-bronze">
                  {collection.products.length ? `${collection.products.length} ${collection.products.length === 1 ? "Produkt" : "Produkte"}` : "Beratung im Aufbau"}
                </p>
                <h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink">
                  <Link href={`/shop/${collection.handle}`} className="rounded-sm underline-offset-4 hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                    {collection.title}
                  </Link>
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-premium-muted">{collection.shortDescription}</p>
                <Link href={`/shop/${collection.handle}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:text-premium-bronze hover:underline">
                  Bereich ansehen <span className="ml-2" aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">DLMNS Kompetenz</p>
            <h2 className="section-title mt-4">Zubehör muss zum Bestand passen.</h2>
            <p className="section-lead mt-6">
              Gute Nachrüstung beginnt mit genauem Hinsehen. Wir kennen bestehende Bestuhlungen, typische Einbausituationen und die Fragen, die vor einer Bestellung geklärt werden sollten.
            </p>
          </div>
          <div className="divide-y divide-premium-beige/80 border-y border-premium-beige/80">
            {strengths.map((strength, index) => (
              <article key={strength.title} className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-5">
                <span className="font-display text-xl text-premium-bronze" aria-hidden>0{index + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-medium text-premium-ink">{strength.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-premium-muted">{strength.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection>
        <section className="rounded-[2.5rem] bg-premium-warm px-6 py-10 sm:px-10 md:py-14 lg:px-14">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="section-eyebrow">Beratung statt Sackgasse</p>
              <h2 className="section-title mt-4">Produkt oder Maß nicht sicher?</h2>
              <p className="section-lead mt-5 max-w-2xl">
                Senden Sie uns ein Foto und die vorhandenen Maße. Wir prüfen gemeinsam, welcher Weg sinnvoll ist – ohne langes Formular und ohne vorschnelle Zuordnung.
              </p>
            </div>
            <Link href="/kontakt?anliegen=Shop-Beratung" className="btn-primary text-center">Kontakt aufnehmen</Link>
          </div>
        </section>
      </HomeSection>
    </div>
  );
}
