import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { getProductsByCollection } from "@/lib/commerce/service";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const path = "/produkte/reihenverbinder";
const retrofitPath = "/produkte/artikel/reihenverbinder-kunststoff";

export const metadata: Metadata = buildMetadata({
  title: "Reihenverbinder für Stühle: integriert oder nachrüstbar",
  description: "Reihenverbindungen für Stapelstühle vergleichen: fest am Stuhl verfügbare Ausstattungsoptionen und Kunststoff-Reihenverbinder zum Nachrüsten.",
  path,
  keywords: ["Reihenverbinder", "Reihenbestuhlung", "Stapelstuhl Reihenverbindung", "Reihenverbinder nachrüsten"],
});

export default async function RowConnectorsGuide() {
  const chairs = (await getProductsByCollection("stapelstuehle")).filter(product =>
    product.stackingChair && product.variants.some(variant =>
      variant.selectedOptions.some(option => option.name === "Reihenverbindung" && option.value === "Mit Reihenverbindung")));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": absoluteUrl(`${path}#webpage`), url: absoluteUrl(path), name: "Reihenverbinder für Stühle: integriert oder nachrüstbar", description: "Beratung zu zwei Arten der Reihenverbindung für Stühle." },
      { "@type": "ItemList", "@id": absoluteUrl(`${path}#options`), name: "Lösungen für Reihenbestuhlung", itemListElement: [retrofitPath, ...chairs.map(chair => `/produkte/stapelstuehle/${chair.handle}`)].map((url, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(url) })) },
    ],
  };

  return <div className="page-stack">
    <StructuredData data={structuredData} />
    <section>
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Reihenverbinder" }]} currentPath={path} />
      <p className="section-eyebrow mt-10">Reihenbestuhlung planen</p>
      <h1 className="section-title mt-4 max-w-4xl">Welche Reihenverbindung passt zu Ihren Stühlen?</h1>
      <p className="section-lead mt-6 max-w-3xl">Für geordnete Stuhlreihen gibt es zwei unterschiedliche Lösungen: eine am Stuhl verfügbare Ausstattungsvariante und einen Kunststoff-Reihenverbinder zum Nachrüsten geeigneter Bestände. Die passende Wahl hängt vom Stuhlmodell, Gestell und gewünschten Abstand ab.</p>
    </section>
    <section className="grid gap-7 md:grid-cols-2" aria-label="Arten der Reihenverbindung">
      <article className="rounded-[2rem] border border-premium-beige p-7 sm:p-9">
        <p className="section-eyebrow">Bei der Stuhlauswahl</p>
        <h2 className="section-title-functional mt-4">Fest am Stuhl verfügbare Reihenverbindung</h2>
        <p className="mt-5 text-sm leading-7 text-premium-muted">Bei passenden Stapelstuhlmodellen ist die Reihenverbindung eine Ausstattungsoption des Stuhls. Wählen Sie auf der Modellseite die Variante „Mit Reihenverbindung“. Die Verfügbarkeit wird für jedes Modell anhand der vorhandenen Variantendaten angezeigt.</p>
        <Link href="/produkte/stapelstuehle" className="btn-secondary mt-7">Stapelstühle vergleichen</Link>
      </article>
      <article className="rounded-[2rem] border border-premium-beige p-7 sm:p-9">
        <p className="section-eyebrow">Für vorhandene Bestände</p>
        <h2 className="section-title-functional mt-4">Kunststoff-Reihenverbinder zum Nachrüsten</h2>
        <p className="mt-5 text-sm leading-7 text-premium-muted">Das eigenständige Zubehör verbindet geeignete Stahlrohrstühle. Vor der Auswahl prüfen wir Gestellform, Rohrmaß und den gewünschten Abstand zwischen den Stühlen. Eine allgemeine Passzusage für jeden Stuhl ist nicht möglich.</p>
        <Link href={retrofitPath} className="btn-primary mt-7">Nachrüstprodukt ansehen</Link>
      </article>
    </section>
    {chairs.length ? <section aria-labelledby="chair-options"><p className="section-eyebrow">Stuhlvarianten</p><h2 id="chair-options" className="section-title mt-4">Modelle mit belegter Reihenverbindungsoption</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">Diese Modelle führen eine Variante „Mit Reihenverbindung“ in den aktuellen Produktdaten. Ausführung und Menge lassen sich auf der jeweiligen Modellseite wählen.</p><div className="mt-7 flex flex-wrap gap-3">{chairs.map(chair => <Link key={chair.handle} href={`/produkte/stapelstuehle/${chair.handle}?reihe=ja`} className="btn-secondary">{chair.title}</Link>)}</div></section> : null}
    <section className="border-t border-premium-beige pt-10"><p className="section-eyebrow">Auswahlhilfe</p><h2 className="section-title-functional mt-4">Bestand und Raum gemeinsam prüfen</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">Für bestehende Stühle helfen Modellangabe, Fotos des Gestells, Rohrmaße und ein gewünschter Stuhlabstand. Bei neuen Stühlen kann die Reihenverbindung direkt in der jeweiligen Konfiguration berücksichtigt werden.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/wissen/reihenverbinder-fuer-stapelstuehle" className="btn-primary">Ratgeber lesen</Link><Link href="/kontakt?anliegen=Reihenbestuhlung" className="btn-secondary">Reihenbestuhlung beraten lassen</Link></div></section>
  </div>;
}
