import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { categoryPlaceholders } from "@/lib/category-placeholders";
import { getProductCategoryById } from "@/lib/product-categories";
import { getProductsByCategory, type ProductCategoryId } from "@/lib/products";
import { absoluteUrl, siteName } from "@/lib/seo";
import ProductImageGallery, { ImageRail } from "@/components/ProductImageGallery";
import { accessoryGroups, chairGroups, materialImages, tableGroups } from "@/lib/category-media";

interface ProductCategoryOverviewProps {
  categoryId: ProductCategoryId;
}

const categoryDecisionHelp: Record<
  ProductCategoryId,
  {
    suitable: string[];
    decision: string[];
    faq: { question: string; answer: string }[];
  }
> = {
  stapelstuehle: {
    suitable: [
      "Gemeinden und Kirchen mit Reihenbestuhlung",
      "Vereine, Seminarräume und Mehrzwecksäle mit häufigem Umbau",
      "Kommunale Räume, in denen robuste Serienbestuhlung gefragt ist",
    ],
    decision: [
      "Stapelverhalten, Gestellqualität und Bodenschutz früh klären",
      "Reihenverbinder, Buchablage und Transportwagen direkt mitdenken",
      "Sitzkomfort nach typischer Nutzungsdauer auswählen",
    ],
    faq: [
      {
        question: "Welche Stapelstühle eignen sich für Gemeinden?",
        answer:
          "Für Gemeinden eignen sich robuste Stapelstühle mit gutem Stapelverhalten, stabiler Stahlrohrkonstruktion und passendem Zubehör wie Reihenverbindern, Buchablagen und Gleitern.",
      },
      {
        question: "Was ist bei Kirchenstühlen oder Gemeindestühlen wichtig?",
        answer:
          "Wichtig sind ein ruhiges Gesamtbild, zuverlässige Reihenbildung, angenehmer Sitzkomfort und eine Lager- oder Transportlösung, die Ehrenamt und Hausmeisterteam im Alltag entlastet.",
      },
    ],
  },
  klapptische: {
    suitable: [
      "Gemeindecafés, Seminarräume, Vereinsheime und Säle",
      "Räume mit Buffet, Gruppenarbeit, Feiern oder wechselnden Tischformen",
      "Projekte mit Sondermaß, Trapezform oder vorhandenen Beständen",
    ],
    decision: [
      "Maße nach Nutzung und Handling wählen, nicht nur nach maximaler Fläche",
      "Oberfläche, Kante und Gestell auf häufiges Auf- und Abbauen abstimmen",
      "Transportwagen und Lagerfläche passend zum Tischmaß planen",
    ],
    faq: [
      {
        question: "Welche Klapptische sind für Gemeinden sinnvoll?",
        answer:
          "Sinnvoll sind stabile Klapptische mit widerstandsfähiger Oberfläche, robuster Kante und einem Format, das sich von wenigen Personen gut bewegen, lagern und kombinieren lässt.",
      },
      {
        question: "Sind Klapptische im Sondermaß möglich?",
        answer:
          "Ja. Klapptische können je nach Projekt in Sondermaß, Sonderform oder mit angepasster Transportlogik geplant werden. Dafür sind Raummaß, gewünschte Nutzung und Lagerweg hilfreich.",
      },
    ],
  },
  "gemeindestuehle-bankettmoebel": {
    suitable: [
      "Gemeindesäle, Bankette, Feierstunden und repräsentative Veranstaltungen",
      "Räume, in denen Komfort und ein einheitliches Bild wichtig sind",
      "Ergänzungsbestuhlung für Foyer, Café oder Sonderbelegung",
    ],
    decision: [
      "Optik und Komfort mit Stapelbarkeit oder Klappbarkeit abgleichen",
      "Reihenabstände, Wege und typische Veranstaltungsdauer berücksichtigen",
      "Reservebestände und Zusatzbestuhlung realistisch einplanen",
    ],
    faq: [
      {
        question: "Was unterscheidet Gemeindestühle von einfachen Saalstühlen?",
        answer:
          "Gemeindestühle müssen neben Stabilität und Stapelbarkeit oft auch Reihenwirkung, Komfort, Zubehör und eine würdige Atmosphäre für Gottesdienst, Feiern und Begegnung verbinden.",
      },
      {
        question: "Welche Stühle passen zu Bankett und Gemeindesaal?",
        answer:
          "Geeignet sind Modelle, die bei längerer Nutzung bequem bleiben, in Reihen ordentlich wirken und sich nach der Veranstaltung gut stapeln, transportieren oder ergänzen lassen.",
      },
    ],
  },
  "transportwagen-zubehoer": {
    suitable: [
      "Hausmeisterteams, Ehrenamt und Veranstaltungslogistik",
      "Gemeinden, Säle und Kommunen mit häufigem Auf- und Abbau",
      "Bestände, die bodenschonend, geordnet und schneller bewegt werden sollen",
    ],
    decision: [
      "Transportwagen passend zu Stuhltyp, Tischmaß und Lagerweg wählen",
      "Reihenverbinder, Gleiter und Buchablagen auf vorhandene Modelle abstimmen",
      "Zubehör als Teil der Ausstattung kalkulieren, nicht als Nachgedanke",
    ],
    faq: [
      {
        question: "Wann lohnt sich ein Transportwagen für Stühle und Tische?",
        answer:
          "Ein Transportwagen kann regelmäßige Umbauten, Lagerwege und den geordneten Umgang mit der Ausstattung erleichtern. Welche Ausführung geeignet ist, hängt von Möbeln, Wegen und Lagerraum ab.",
      },
      {
        question: "Kann Zubehör zu vorhandenen Stühlen nachgerüstet werden?",
        answer:
          "Ob Reihenverbinder, Gleiter oder Buchablagen zu vorhandenen Stühlen passen, prüfen wir anhand von Modell, Fotos, Maßen und Gestellform.",
      },
    ],
  },
};

export default function ProductCategoryOverview({
  categoryId,
}: ProductCategoryOverviewProps) {
  const category = getProductCategoryById(categoryId);

  if (!category) {
    return null;
  }

  const categoryProducts = getProductsByCategory(category.id);
  const isAccessories = category.id === "transportwagen-zubehoer";
  const productGroups = isAccessories
    ? [
        {
          id: "transportwagen",
          eyebrow: "A. Transportwagen",
          title: "Transportwagen",
          lead: "Stühle und Tische leichter bewegen, schnelle Umbauten unterstützen und Ausstattung geordnet lagern.",
          products: categoryProducts.filter((product) => product.overviewGroup === "transport"),
        },
        {
          id: "stuhlzubehoer",
          eyebrow: "B. Zubehör für Stühle",
          title: "Praktische Ergänzungen für vorhandene Stühle",
          lead: "Buchablagen, Reihenverbinder, Schreibtablare sowie Gleiter und Stopfen werden anhand des vorhandenen Stuhls zugeordnet.",
          products: categoryProducts.filter((product) => product.overviewGroup === "chair-accessories"),
        },
        {
          id: "tischzubehoer",
          eyebrow: "C. Zubehör für Tische",
          title: "Tischfüße, Gestellteile und Kleinteile",
          lead: "Für die sichere Auswahl prüfen wir Einbauort, Gestellform, Fotos und Maße.",
          products: categoryProducts.filter((product) => product.overviewGroup === "table-accessories"),
        },
        {
          id: "ersatzteile",
          eyebrow: "D. Ersatzteile und Nachbestellung",
          title: "Verschleißteile gezielt ersetzen",
          lead: "Ersatzteile und Kleinteile ordnen wir persönlich zu – ohne pauschale Aussage zur Kompatibilität.",
          products: categoryProducts.filter((product) => product.overviewGroup === "spares"),
        },
      ]
    : [];
  const placeholder = categoryPlaceholders[category.id];
  const decisionHelp = categoryDecisionHelp[category.id];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`/produkte/kategorien/${category.id}#products`),
        name: `${category.name} von ${siteName}`,
        description: category.description,
        url: absoluteUrl(`/produkte/kategorien/${category.id}`),
        itemListElement: categoryProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.title,
          url: absoluteUrl(`/produkte/${product.slug}`),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(`/produkte/kategorien/${category.id}#faq`),
        mainEntity: decisionHelp.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />

      <CinematicPageHero
        eyebrow={category.name}
        title={isAccessories ? "Transportwagen, Zubehör und Ersatzteile" : `${category.name} für Gemeinden, Säle und flexible Räume`}
        lead={category.description}
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: category.name },
        ]}
        mediaAriaLabel={placeholder.ariaLabel}
        mood={placeholder.mood}
        actions={
          <>
            <Link href={`/kontakt?kategorie=${encodeURIComponent(category.name)}`} className="btn-hero-primary text-center">
              {isAccessories ? "Passendes Ersatzteil anfragen" : "Beratung anfragen"}
            </Link>
            <Link
              href="/produkte"
              className="btn-hero-secondary text-center"
            >
              {isAccessories ? "Zubehör entdecken" : "Alle Kategorien"}
            </Link>
          </>
        }
        visual={
          <Image
            src={category.image}
            alt={
              category.id === "klapptische"
                ? "Rechteckiger Klapptisch mit heller Tischplatte und Metallkufen"
                : isAccessories
                  ? "Stuhltransportwagen mit gestapelten Holzschalenstühlen"
                : `${category.name} für Gemeinden und Säle`
            }
            width={720}
            height={460}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className={
              category.id === "klapptische" || isAccessories
                ? "h-[360px] w-full bg-premium-cream/40 object-contain sm:h-[440px] md:h-[520px]"
                : "min-h-[220px] w-full object-cover sm:min-h-[260px] md:min-h-[280px]"
            }
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Überblick"
          title="Für wen geeignet, worauf achten, welche Modelle passen?"
          lead="Kompakte Orientierung zu Merkmalen, Einsatzbereichen und Anfrageweg."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-3 lg:gap-6">
          <article className="premium-card premium-card-hover p-7 md:p-8">
            <p className="section-eyebrow text-[0.65rem]">Umfang</p>
            <p className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] text-premium-ink">
              {categoryProducts.length}
            </p>
            <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
              Modelle mit Detailseite, Einsatzgebieten und direkter Anfrage.
            </p>
          </article>

          <article className="premium-card premium-card-hover rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm to-premium-canvas/80 p-7 md:p-8">
            <p className="section-eyebrow text-[0.65rem]">Vorteile</p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
              {category.highlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card premium-card-hover rounded-4xl bg-premium-ink p-7 text-premium-canvas md:p-8">
            <p className="section-eyebrow text-[0.65rem] text-premium-sand">
              Einsatzbereiche
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-white/75">
              {category.useCases.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Entscheidungshilfe</p>
            <h2 className="section-title mt-5 text-balance">
              Passt diese Kategorie zu Ihrem Raum?
            </h2>
            <p className="section-lead mt-6">
              Für Gemeinden, Vereine, Seminarräume und kommunale Einrichtungen
              zählt nicht nur das einzelne Produkt. Entscheidend sind Nutzung,
              Lagerung, Transport und die Wirkung im Raum.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/kontakt?kategorie=${encodeURIComponent(category.name)}`} className="btn-primary text-center">
                Raum ausstatten lassen
              </Link>
              <a href="tel:+499342915353" className="btn-secondary text-center">
                Direkt anrufen
              </a>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="premium-card p-7 md:p-8">
              <p className="section-eyebrow text-[0.65rem]">
                Besonders geeignet für
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
                {decisionHelp.suitable.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="premium-card p-7 md:p-8">
              <p className="section-eyebrow text-[0.65rem]">
                Vor der Anfrage klären
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
                {decisionHelp.decision.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing" id={isAccessories ? "produkte" : undefined}>
        <SectionHeader
          eyebrow={isAccessories ? "Produkte und Lösungen" : "Modelle"}
          title={isAccessories ? "Transportwagen und Zubehör im Überblick" : "Produkte in dieser Kategorie"}
          lead={isAccessories ? "Klar gegliedert nach Transport, Stuhlzubehör, Tischzubehör und Ersatzteilen." : "Alle Modelle mit Bild, Einsatzbereichen, Vorteilen und direktem Kontakt zur Beratung."}
          href="/kontakt"
          linkLabel="Beratung zur Auswahl"
          align="editorial"
        />

        {isAccessories ? (
          <div className="section-grid-top space-y-16">
            {productGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-28">
                <p className="section-eyebrow">{group.eyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-medium text-premium-ink md:text-3xl">{group.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-premium-muted">{group.lead}</p>
                <div className="mt-7 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {group.products.map((product) => <ProductCard key={product.slug} product={product} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {categoryProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        )}
      </HomeSection>

      {category.id === "stapelstuehle" ? (
        <>
          <HomeSection variant="elevated">
            <SectionHeader eyebrow="Modell- und Detailvielfalt" title="Stühle aus mehreren Blickwinkeln" lead="Gesamtansichten und Details helfen, Form, Material und praktische Ergänzungen früh im Projekt einzuordnen." align="editorial" />
            <div className="section-grid-top"><ProductImageGallery groups={chairGroups} /></div>
          </HomeSection>
          <HomeSection>
            <SectionHeader eyebrow="Bemusterung" title="Farben und Materialien passend zum Raum" lead="Stoffe, Holzoberflächen und Gestellfarben beeinflussen nicht nur die Optik, sondern auch die Wirkung des gesamten Raumes. Wir unterstützen Sie bei einer Auswahl, die zur Nutzung, Architektur und bestehenden Ausstattung passt." align="editorial" />
            <div className="section-grid-top"><ImageRail images={materialImages} /></div>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-premium-muted">Je nach Modell stehen unterschiedliche Stoffe, Farben, Holzoberflächen und Gestellausführungen zur Auswahl. Wir beraten Sie persönlich zu einer passenden Zusammenstellung.</p>
          </HomeSection>
        </>
      ) : null}

      {category.id === "klapptische" ? (
        <HomeSection variant="elevated">
          <SectionHeader eyebrow="Formen und Konstruktion" title="Flexible Tische für unterschiedliche Raumkonzepte" lead="Die Galerie zeigt Tischformen, Gestelle und Details für schnelles Umstellen, robuste Nutzung und eine möglichst kompakte Lagerung." align="editorial" />
          <div className="section-grid-top"><ProductImageGallery groups={tableGroups} /></div>
        </HomeSection>
      ) : null}

      {category.id === "transportwagen-zubehoer" ? (
        <>
          <HomeSection variant="elevated">
            <SectionHeader eyebrow="Zubehör im Detail" title="Ersatzteile und Ergänzungen anschaulich zugeordnet" lead="Von der Buchablage bis zum Gestellstopfen: Bilder erleichtern die erste Zuordnung. Für eine verlässliche Auswahl prüfen wir anschließend Modell, Maße und Einsatz." align="editorial" />
            <div className="section-grid-top"><ProductImageGallery groups={accessoryGroups} /></div>
          </HomeSection>
          <HomeSection>
            <SectionHeader eyebrow="Transport und Lagerung" title="Vom genutzten Raum zurück ins Lager" lead="Ein verständlicher Ablauf für Ehrenamt, Hausmeister- und Veranstaltungsteams — ohne unnötige Handgriffe." align="editorial" />
            <ol className="section-grid-top grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {["Möbel im Raum nutzen", "Tische zusammenstellen und Stühle stapeln", "Bestand mit dem passenden Wagen transportieren", "Geordnet und platzsparend lagern"].map((step, index) => <li key={step} className="premium-card p-6"><span className="section-eyebrow">0{index + 1}</span><p className="mt-3 font-display text-xl text-premium-ink">{step}</p></li>)}
            </ol>
          </HomeSection>
          <HomeSection variant="elevated">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
              <div>
                <p className="section-eyebrow">Ersatzteilanfrage</p>
                <h2 className="section-title mt-5">Sie suchen ein bestimmtes Ersatzteil?</h2>
                <p className="section-lead mt-6">Senden Sie uns möglichst ein Foto des vorhandenen Stuhls oder Tisches sowie Bilder und Maße des benötigten Teils. So können wir die passende Ausführung besser zuordnen.</p>
                <Link href="/kontakt?anliegen=Ersatzteilanfrage" className="btn-primary mt-8 inline-flex">Ersatzteil anfragen</Link>
              </div>
              <ul className="premium-card space-y-3 p-7 text-sm leading-7 text-premium-muted md:p-8">
                {["Foto des vollständigen Produkts", "Foto des defekten oder fehlenden Teils", "Maße", "vorhandene Modellbezeichnung", "ungefähres Kaufjahr", "benötigte Stückzahl"].map((item) => <li key={item} className="flex gap-2.5"><span className="text-premium-sand" aria-hidden>—</span>{item}</li>)}
              </ul>
            </div>
          </HomeSection>
        </>
      ) : null}

      <HomeSection>
        <SectionHeader
          eyebrow="Häufige Fragen"
          title={`Kurz geklärt: ${category.name}`}
          lead="Antworten auf typische Fragen, bevor Sie konkrete Stückzahlen oder Maße anfragen."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-2">
          {decisionHelp.faq.map((item) => (
            <article key={item.question} className="premium-card p-7 md:p-8">
              <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
                {item.question}
              </h2>
              <p className="mt-4 text-sm leading-[1.8] text-premium-muted">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Beratung"
        title={`Planen Sie mit ${category.name}?`}
        lead="Wir helfen bei Raumgröße, Stückzahlen, Reihenbestuhlung, Stapelung, Lagerung, Transportwagen, Budget und Pflege."
        primaryHref={`/kontakt?kategorie=${encodeURIComponent(category.name)}`}
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte"
        secondaryLabel="Produkte ansehen"
      />
    </div>
  );
}
