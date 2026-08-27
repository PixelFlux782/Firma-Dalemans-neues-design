import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import ChairComparison from "@/components/chairs/ChairComparison";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatCommerceMoney } from "@/lib/commerce/money";
import type { CommerceProduct } from "@/lib/commerce/types";

export const stackingChairCategoryFaq = [
  {
    question: "Welche Polsterung ist für einen Gemeindesaal sinnvoll?",
    answer: "Ungepolsterte Ausführungen, Sitzpolster sowie Sitz- und Rückenpolster stehen zur Wahl. Welche Ausführung passt, hängt vor allem von Nutzungsdauer, gewünschtem Komfort und den Abläufen im Raum ab.",
  },
  {
    question: "Was bedeuten die Stoffgruppen 2, 3 und 4?",
    answer: "Die aktuelle Preisliste unterscheidet diese drei Gruppen bei gepolsterten Ausführungen. Material-, Farb- und Qualitätsangaben werden noch ergänzt und deshalb nicht vorweggenommen.",
  },
  {
    question: "Sind die Modelle mit Reihenverbindung erhältlich?",
    answer: "Ja. Für alle fünf Modelle führt die aktuelle Preisliste jede Grundausführung mit und ohne Reihenverbindung.",
  },
  {
    question: "Kann ich einen Musterstuhl erhalten?",
    answer: "Musterstühle sind möglich. Dalemans stimmt Modell, Ausführung und Ablauf persönlich mit Ihnen ab.",
  },
  {
    question: "Gibt es Mengenpreise?",
    answer: "Je Ausführung sind drei Preise hinterlegt. Da die zugehörigen Mengenbereiche noch nicht dokumentiert sind, werden sie im Frontend nicht benannt und im Angebot verbindlich geklärt.",
  },
  {
    question: "Kann Dalemans bei der Bestuhlungsplanung helfen?",
    answer: "Ja. Dalemans unterstützt bei Raum- und Bestuhlungsplanung einschließlich 2D- und 3D-Planung, Stellplänen, Lagerung und Transportwegen.",
  },
  {
    question: "Können Stühle später nachbestellt werden?",
    answer: "Dalemans begleitet Nachbestellungen und Ersatzteilfragen persönlich. Die konkrete Verfügbarkeit wird für Modell und Bestand geprüft.",
  },
] as const;

function ChairVisual({ product }: { product: CommerceProduct }) {
  if (product.featuredImage) {
    return (
      <ProductVisual
        src={product.featuredImage.url}
        alt={product.featuredImage.altText ?? product.title}
        sizes="(min-width: 1024px) 36vw, (min-width: 640px) 50vw, 100vw"
        aspectRatio="5 / 4"
        imageInset="5%"
        backgroundTone="canvas"
        className="min-h-[310px] sm:min-h-[380px]"
      />
    );
  }

  return (
    <div className="flex min-h-[310px] aspect-[5/4] items-end bg-gradient-to-br from-premium-warm via-premium-canvas to-premium-sage/55 p-7 sm:min-h-[380px] sm:p-9">
      <div>
        <p className="section-eyebrow">Produktbild folgt</p>
        <p className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-premium-ink">
          {product.stackingChair?.modelCode}
        </p>
        <p className="mt-3 max-w-xs text-sm leading-6 text-premium-muted">
          Preis- und Variantendaten sind bereits vollständig hinterlegt.
        </p>
      </div>
    </div>
  );
}

export default function StackingChairHub({ products }: { products: CommerceProduct[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-16 md:gap-20 lg:gap-24">
      <section className="grid overflow-hidden rounded-[2rem] border border-premium-beige/70 bg-white/45 lg:grid-cols-[.96fr_1.04fr]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          <Breadcrumbs
            items={[
              { label: "Start", href: "/" },
              { label: "Produkte", href: "/produkte" },
              { label: "Stapelstühle" },
            ]}
            currentPath="/produkte/stapelstuehle"
          />
          <p className="section-eyebrow mt-8">Fünf Modelle · 70 Ausführungen</p>
          <h1 className="mt-4 max-w-[13ch] font-display text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.75rem]">
            Stapelstühle für flexible Räume.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-premium-muted">
            Für Gemeinden, Kirchen, Kommunen und vielseitig genutzte Räume – mit drei Polsterarten, optionaler Reihenverbindung und persönlicher Beratung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#modelle" className="btn-primary px-6">Modelle ansehen</Link>
            <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-secondary px-6">Beratung erhalten</Link>
          </div>
          <p className="mt-8 border-t border-premium-beige/70 pt-5 text-sm leading-7 text-premium-muted">
            Seit 1994 persönlich beraten · Musterstühle möglich · Raum- und Bestuhlungsplanung
          </p>
        </div>
        <ProductVisual
          src="/images/curated/Stapelstühle/1021c.webp"
          alt="Stapelstuhl für flexible Gemeinde- und Veranstaltungsräume"
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          aspectRatio="4 / 5"
          imageInset="4%"
          backgroundTone="#123322"
          surface="#123322"
          decorativeAtmosphere
          className="min-h-[430px] lg:min-h-[650px]"
        />
      </section>

      <section id="modelle" aria-labelledby="chair-models-heading" className="scroll-mt-28">
        <div className="grid gap-6 border-b border-premium-beige/70 pb-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Modellübersicht</p>
            <h2 id="chair-models-heading" className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">
              Fünf Modelle. Klar vergleichbar.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-premium-muted lg:justify-self-end">
            Nicht 70 Einzelprodukte, sondern fünf Modellfamilien. Polsterung, Stoffgruppe und Reihenverbindung wählen Sie anschließend am Modell.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-14 pt-10 md:grid-cols-2">
          {products.map((product) => {
            const fromPrice = product.priceRange.min
              ? formatCommerceMoney(product.priceRange.min)
              : null;

            return (
              <article key={product.id} className="group min-w-0 border-b border-premium-beige/70 pb-12">
                <div className="overflow-hidden rounded-[1.75rem]">
                  <ChairVisual product={product} />
                </div>
                <div className="pt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink sm:text-3xl">
                      Modell {product.stackingChair?.modelCode}
                    </h3>
                    {fromPrice ? (
                      <p className="text-base font-semibold tabular-nums text-premium-forest">ab {fromPrice}</p>
                    ) : null}
                  </div>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-premium-muted">{product.shortDescription}</p>
                  <dl className="mt-5 grid gap-3 border-y border-premium-beige/65 py-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-premium-ink">Polsterung</dt>
                      <dd className="mt-1 text-premium-muted">drei Ausführungen</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-premium-ink">Reihenverbindung</dt>
                      <dd className="mt-1 text-premium-muted">mit oder ohne</dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link href={`/produkte/stapelstuehle/${product.handle}`} className="btn-primary px-6 py-2.5 text-sm">
                      Modell ansehen
                    </Link>
                    <span className="text-xs leading-5 text-premium-subtle">
                      Preis mengenabhängig; Staffelgrenzen in Klärung
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ChairComparison
        models={products.map((product) => ({
          handle: product.handle,
          modelCode: product.stackingChair?.modelCode ?? product.title,
          fromPrice: product.priceRange.min,
        }))}
      />

      <section aria-labelledby="upholstery-guide-heading" className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="section-eyebrow">Kaufberatung</p>
          <h2 id="upholstery-guide-heading" className="section-title mt-4">Welche Polsterung passt zu Ihrem Einsatz?</h2>
          <p className="mt-5 text-sm leading-7 text-premium-muted">
            Drei klare Entscheidungen ersetzen unübersichtliche Variantenlisten. Stoffgruppe und Reihenverbindung wählen Sie anschließend direkt am Modell.
          </p>
        </div>
        <div className="divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {[
            ["Ungepolstert", "Eine sachliche Option für robuste, flexible Nutzung und häufiges Umstellen."],
            ["Sitzpolster", "Mehr Sitzkomfort für längere Nutzungsphasen bei weiterhin flexibler Bestuhlung."],
            ["Sitz- und Rückenpolster", "Die komfortorientierte Ausführung für länger dauernde Veranstaltungen."],
          ].map(([title, text], index) => (
            <article key={title} className="grid gap-3 py-6 sm:grid-cols-[3rem_.7fr_1.3fr] sm:items-start sm:gap-6">
              <span className="font-display text-2xl text-premium-sand" aria-hidden>0{index + 1}</span>
              <h3 className="font-semibold text-premium-ink">{title}</h3>
              <p className="text-sm leading-7 text-premium-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-premium-ink text-white lg:grid-cols-2" aria-labelledby="row-connector-heading">
        <ProductVisual
          src="/images/curated/Stapelstühle/stuhlverbinder.webp"
          alt="Reihenverbinder zwischen zwei Stuhlgestellen"
          sizes="(min-width: 1024px) 50vw, 100vw"
          aspectRatio="4 / 3"
          imageInset="6%"
          backgroundTone="#0D1712"
          surface="#0D1712"
          className="min-h-[330px]"
        />
        <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-14">
          <p className="section-eyebrow text-premium-sand">Reihenbestuhlung</p>
          <h2 id="row-connector-heading" className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-white sm:text-4xl">Mit oder ohne Reihenverbindung?</h2>
          <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
            Eine Reihenverbindung kann Stühle bei geordneter Reihenbestuhlung zusammenführen. Welche Ausführung zum Raum und zum Ablauf passt, wird projektbezogen abgestimmt; pauschale brandschutzrechtliche Aussagen treffen wir nicht.
          </p>
          <Link href="/raeume-planung/raumplanung" className="btn-on-dark mt-7 self-start">Bestuhlungsplanung ansehen</Link>
        </div>
      </section>

      <section className="grid gap-8 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16" aria-labelledby="room-planning-heading">
        <div>
          <p className="section-eyebrow">Raumkompetenz</p>
          <h2 id="room-planning-heading" className="section-title mt-4">Nicht nur den Stuhl planen – den ganzen Raum.</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-premium-muted">
            Bestuhlungspläne, schwierige Geometrien, Säulen, Tischanordnungen, Lagerflächen und Transportwege gehören zusammen. Dalemans unterstützt mit 2D- und 3D-Planung für Räume, die sich im Alltag schnell verändern müssen.
          </p>
          <Link href="/raeume-planung/raumplanung" className="btn-primary mt-7">Raumplanung ansehen</Link>
        </div>
        <ul className="grid gap-3 border-l border-premium-beige/80 pl-6 text-sm leading-7 text-premium-muted sm:grid-cols-2 lg:grid-cols-1">
          {[
            "Bestuhlungs- und Stellpläne",
            "Tischanordnungen und Laufwege",
            "Lagerung und Transport",
            "2D-/3D-Planung für schwierige Räume",
          ].map((item) => <li key={item} className="flex gap-3"><span aria-hidden className="text-premium-bronze">—</span>{item}</li>)}
        </ul>
      </section>

      <section className="grid gap-8 rounded-[2rem] bg-premium-warm/75 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-12" aria-labelledby="sample-heading">
        <div>
          <p className="section-eyebrow">Vor größerer Bestellung ausprobieren</p>
          <h2 id="sample-heading" className="section-title-functional mt-4">Musterstuhl persönlich anfragen.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Ein Musterstuhl hilft, Sitzgefühl, Wirkung im Raum und die gewünschte Ausführung vor einer größeren Bestellung gemeinsam zu prüfen.</p>
        </div>
        <Link href="/kontakt?anliegen=Musterstuhl&kategorie=Stapelst%C3%BChle" className="btn-primary shrink-0">Musterstuhl anfragen</Link>
      </section>

      <section aria-labelledby="category-faq-heading" className="mx-auto w-full max-w-4xl">
        <div className="text-center">
          <p className="section-eyebrow">Häufige Fragen</p>
          <h2 id="category-faq-heading" className="mx-auto mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">Orientierung vor der Modellauswahl.</h2>
        </div>
        <div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {stackingChairCategoryFaq.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                {item.question}<span className="text-premium-bronze transition group-open:rotate-45" aria-hidden>＋</span>
              </summary>
              <p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
