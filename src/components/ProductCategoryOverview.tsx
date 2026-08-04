import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductCatalog from "@/components/ProductCatalog";
import ProductImageGallery from "@/components/ProductImageGallery";
import { StructuredData } from "@/components/StructuredData";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import StackingChairsCategory from "@/components/StackingChairsCategory";
import { tableGroups } from "@/lib/category-media";
import { getProductCategoryById } from "@/lib/product-categories";
import { getProductsByCategory, type ProductCategoryId } from "@/lib/products";
import { absoluteUrl, siteName } from "@/lib/seo";

interface Props { categoryId: ProductCategoryId }

const guidance: Record<ProductCategoryId, { suitable: string[]; decision: string[]; faq: { question: string; answer: string }[] }> = {
  stapelstuehle: {
    suitable: ["Gemeinden und Kirchen mit Reihenbestuhlung", "Seminarräume und Mehrzwecksäle mit häufigem Umbau", "Kommunale Räume mit robuster Serienbestuhlung"],
    decision: ["Stapelverhalten und Gestellqualität", "Bodenschutz und Transportweg", "Reihenverbinder, Buchablage und Sitzkomfort"],
    faq: [
      { question: "Welche Stapelstühle eignen sich für Gemeinden?", answer: "Robuste Modelle mit gutem Stapelverhalten, stabiler Konstruktion und passendem Zubehör erleichtern wechselnde Bestuhlungen." },
      { question: "Was ist bei Kirchen- und Gemeindestühlen wichtig?", answer: "Ein ruhiges Gesamtbild, zuverlässige Reihenbildung, Sitzkomfort sowie eine praktikable Lager- und Transportlösung." },
    ],
  },
  klapptische: {
    suitable: ["Gemeindecafés, Seminarräume und Vereinssäle", "Buffet, Gruppenarbeit und Feiern", "Projekte mit Sondermaß oder vorhandenen Beständen"],
    decision: ["Maße passend zu Nutzung und Handling", "Oberfläche, Kante und Gestell", "Transportwagen, Lagerfläche und Laufwege"],
    faq: [
      { question: "Welche Klapptische sind für Gemeinden sinnvoll?", answer: "Sinnvoll sind stabile Tische mit widerstandsfähiger Oberfläche und einem Format, das sich gut bewegen, lagern und kombinieren lässt." },
      { question: "Sind Klapptische im Sondermaß möglich?", answer: "Je nach Projekt sind Sondermaß und Sonderform möglich. Raummaß, Nutzung und Lagerweg helfen bei der Einordnung." },
    ],
  },
  "gemeindestuehle-bankettmoebel": {
    suitable: ["Gemeindesäle, Bankette und Feierstunden", "Räume mit Anspruch an Komfort und Gesamtbild", "Ergänzungsbestuhlung für Foyer oder Sonderbelegung"],
    decision: ["Optik und Komfort", "Stapel- oder Klappbarkeit", "Reihenabstände, Wege und Reservebestand"],
    faq: [
      { question: "Was unterscheidet Gemeindestühle von einfachen Saalstühlen?", answer: "Sie verbinden Stabilität und Handhabung mit Reihenwirkung, Komfort, Zubehör und einer passenden Atmosphäre." },
      { question: "Welche Stühle passen zu Bankett und Gemeindesaal?", answer: "Modelle, die bei längerer Nutzung bequem bleiben, in Reihen ordentlich wirken und sich gut lagern oder transportieren lassen." },
    ],
  },
  "transportwagen-zubehoer": {
    suitable: ["Gemeinden, Säle und Kommunen", "Hausmeister- und Veranstaltungsteams", "Bestände mit häufigen Umbauten"],
    decision: ["Foto des vollständigen Produkts", "Detailfoto des gesuchten oder defekten Teils", "Maße und Modellbezeichnung", "Ungefähres Kaufjahr", "Benötigte Stückzahl"],
    faq: [
      { question: "Wann lohnt sich ein Transportwagen?", answer: "Ein passender Wagen erleichtert regelmäßige Umbauten, Lagerwege und den geordneten Umgang mit Stühlen oder Tischen." },
      { question: "Kann Zubehör zu vorhandenen Stühlen nachgerüstet werden?", answer: "Das prüfen wir anhand von Modell, Fotos, Maßen und Gestellform. Eine pauschale Kompatibilitätszusage ist nicht sinnvoll." },
    ],
  },
};

export default function ProductCategoryOverview({ categoryId }: Props) {
  const category = getProductCategoryById(categoryId);
  if (!category) return null;
  const products = getProductsByCategory(categoryId);
  const isAccessories = categoryId === "transportwagen-zubehoer";
  const info = guidance[categoryId];
  const filters = isAccessories ? [
    { id: "all", label: "Alle" }, { id: "transport", label: "Transportwagen" },
    { id: "chair-accessories", label: "Stuhlzubehör" }, { id: "table-accessories", label: "Tischzubehör" },
    { id: "spares", label: "Ersatzteile" },
  ] : [{ id: "all", label: "Alle Produkte" }];
  const title = isAccessories ? "Transportwagen, Zubehör & Ersatzteile" : category.name;
  const lead = isAccessories ? "Praktische Lösungen für Transport, Lagerung, Reihenbestuhlung und den langfristigen Erhalt Ihrer Ausstattung." : category.intro;
  const data = { "@context": "https://schema.org", "@graph": [
    { "@type": "ItemList", "@id": absoluteUrl(`/produkte/kategorien/${category.id}#products`), name: `${category.name} von ${siteName}`, description: category.description, url: absoluteUrl(`/produkte/kategorien/${category.id}`), itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.title, url: absoluteUrl(`/produkte/${product.slug}`) })) },
    { "@type": "FAQPage", "@id": absoluteUrl(`/produkte/kategorien/${category.id}#faq`), mainEntity: info.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ] };

  if (categoryId === "stapelstuehle") {
    return <>
      <StructuredData data={data} />
      <StackingChairsCategory heroImage={category.image} products={products} />
    </>;
  }

  return <div className="flex min-w-0 flex-col gap-14 md:gap-20">
    <StructuredData data={data} />
    <section>
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: category.name }]} />
          <p className="section-eyebrow mt-7">Produktkategorie · {products.length} Produkte</p>
          <h1 className="mt-3 max-w-[18ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-premium-muted">{lead}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/kontakt?${isAccessories ? "anliegen=Ersatzteilanfrage" : `kategorie=${encodeURIComponent(category.name)}`}`} className="btn-primary px-6 py-3">{isAccessories ? "Ersatzteil anfragen" : "Beratung zur Auswahl"}</Link>
            <a href="tel:+499342915353" className="btn-secondary px-6 py-3">Beratung</a>
          </div>
        </div>
        <ProductVisual src={category.image} alt={`${category.name} im Einsatz`} priority sizes="(min-width: 1024px) 42vw, 100vw" aspectRatio="4 / 3" imageInset={isAccessories ? "6%" : "5%"} backgroundTone="canvas" className="min-h-72 lg:min-h-[390px]" />
      </div>
    </section>

    <section id="products" aria-labelledby="products-title" className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="section-eyebrow">Sortiment</p><h2 id="products-title" className="mt-2 font-display text-3xl font-medium text-premium-ink">Produkte entdecken</h2></div>
        <Link href={`/kontakt?kategorie=${encodeURIComponent(category.name)}`} className="text-sm font-medium text-premium-forest underline-offset-4 hover:underline">Beratung zur Auswahl →</Link>
      </div>
      <ProductCatalog products={products} filters={filters} />
    </section>

    <HomeSection variant="elevated">
      <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <div><p className="section-eyebrow">Auswahlhilfe</p><h2 className="section-title-functional mt-4">Vor der Anfrage kurz klären</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Mit diesen Angaben können wir Ausführung und Eignung gezielter einordnen.</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div><h3 className="font-medium text-premium-ink">Hilfreiche Angaben</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-premium-muted">{info.decision.map((item) => <li key={item}>— {item}</li>)}</ul></div>
          <div><h3 className="font-medium text-premium-ink">Besonders geeignet für</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-premium-muted">{info.suitable.map((item) => <li key={item}>— {item}</li>)}</ul></div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-2 border-t border-premium-beige pt-6 text-sm text-premium-charcoal">{category.highlights.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-white px-4 py-2">{item}</span>)}</div>
    </HomeSection>

    {categoryId === "klapptische" ? <HomeSection><SectionHeader eyebrow="Anwendung und Konstruktion" title="Tischformen für unterschiedliche Raumkonzepte" lead="Ergänzende Ansichten zeigen Formen und technische Prinzipien, ohne die Produkte ein zweites Mal vollständig zu präsentieren." align="editorial" /><div className="section-grid-top"><ProductImageGallery groups={tableGroups} /></div></HomeSection> : null}

    <HomeSection id="faq"><SectionHeader eyebrow="Häufige Fragen" title={`Kurz geklärt: ${category.name}`} lead="Antworten auf typische Fragen vor der konkreten Anfrage." align="editorial" /><div className="section-grid-top grid gap-5 md:grid-cols-2">{info.faq.map((item) => <article key={item.question} className="premium-card p-7"><h2 className="font-display text-xl font-medium text-premium-ink">{item.question}</h2><p className="mt-4 text-sm leading-7 text-premium-muted">{item.answer}</p></article>)}</div></HomeSection>
    <PremiumCtaSection eyebrow="Persönliche Beratung" title={`Passende ${category.name} auswählen`} lead="Wir klären Ausführung, Stückzahl, Raumwirkung, Lagerung und Transport persönlich mit Ihnen." primaryHref={`/kontakt?kategorie=${encodeURIComponent(category.name)}`} primaryLabel={isAccessories ? "Ersatzteil anfragen" : "Beratung zur Auswahl"} secondaryHref="tel:+499342915353" secondaryLabel="Direkt anrufen" />
  </div>;
}
