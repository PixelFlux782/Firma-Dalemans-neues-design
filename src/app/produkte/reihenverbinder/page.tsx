import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import RowConnectorInquiry from "@/components/RowConnectorInquiry";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { getProductByHandle, getProductsByCollection } from "@/lib/commerce/service";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const path = "/produkte/reihenverbinder";

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
  const plastic = await getProductByHandle("reihenverbinder-kunststoff");
  const connectors = [
    {
      id: "kunststoff", title: plastic?.title ?? "Reihenverbinder aus Kunststoff",
      eyebrow: "Für vorhandene Bestände", execution: "Zum Nachrüsten – nach Maß- und Gestellprüfung",
      image: "/neue bilder/Zubehör/reihenverbinder-kunststoff.png",
      alt: "Schwarze Reihenverbinder aus Kunststoff zur Verbindung benachbarter Stuhlgestelle",
      description: "Das separat erhältliche Zubehör verbindet geeignete Stahlrohrstühle. Ob eine Nachrüstung passt, hängt von Stuhlmodell, Gestellform, Rohrmaß und gewünschtem Stuhlabstand ab. Eine universelle Kompatibilität besteht nicht.",
      specifications: plastic?.specifications ?? [],
      note: "Vor dem Einsatz ist die sichere Verbindung am konkreten Stuhlmodell zu prüfen.",
    },
    {
      id: "metall", title: "Fest montierte Metall-Reihenverbinder",
      eyebrow: "Bei der Stuhlauswahl", execution: "Fest am Stuhl montiert",
      image: "/neue bilder/Stapelstühle/reihenverbinder/1010dd2-optimiert.webp",
      alt: "Geöffnete Metall-Reihenverbinder an zwei Stapelstühlen vor dem Einhaken",
      description: "Unsere bevorzugte Lösung für regelmäßig genutzte Reihenbestuhlungen: Planen Sie die fest montierte Reihenverbindung möglichst direkt bei der Bestellung neuer Stapelstühle ein.",
      specifications: [
        { name: "Material", value: "Metall" },
        { name: "Montage", value: "Fest am Stuhl" },
        { name: "Ausstattungsvariante", value: "Mit Reihenverbindung" },
      ],
      note: "Bei passenden Stapelstuhlmodellen als Ausstattungsoption verfügbar. Die Verfügbarkeit richtet sich nach den Variantendaten des jeweiligen Modells.",
    },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": absoluteUrl(`${path}#webpage`), url: absoluteUrl(path), name: "Reihenverbinder für Stühle: integriert oder nachrüstbar", description: "Beratung zu zwei Arten der Reihenverbindung für Stühle." },
      { "@type": "ItemList", "@id": absoluteUrl(`${path}#options`), name: "Lösungen für Reihenbestuhlung", itemListElement: chairs.map(chair => `/produkte/stapelstuehle/${chair.handle}`).map((url, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(url) })) },
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
      {connectors.map(connector => <article key={connector.id} className="premium-card flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-premium-beige">
        <div className="relative aspect-[4/3] bg-premium-warm">
          <Image src={encodeURI(connector.image)} alt={connector.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-contain p-6 sm:p-9" />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-9">
          <p className="section-eyebrow">{connector.eyebrow}</p>
          <h2 className="section-title-functional mt-4">{connector.title}</h2>
          <p className="mt-5 text-sm leading-7 text-premium-muted">{connector.description}</p>
          <dl className="mt-6 divide-y divide-premium-beige border-y border-premium-beige text-sm">
            {connector.specifications.map(spec => <div key={spec.name} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 py-3"><dt className="text-premium-muted">{spec.name}</dt><dd className="font-medium text-premium-ink">{spec.value}</dd></div>)}
          </dl>
          <p className="mt-5 text-sm leading-7 text-premium-muted">{connector.note}</p>
          <RowConnectorInquiry id={connector.id} product={connector.title} execution={connector.execution} specifications={connector.specifications} />
        </div>
      </article>)}
    </section>
    {chairs.length ? <section aria-labelledby="chair-options"><p className="section-eyebrow">Stuhlvarianten</p><h2 id="chair-options" className="section-title mt-4">Stapelstühle mit Reihenverbindung</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">Diese Modelle führen eine Variante „Mit Reihenverbindung“ in den aktuellen Produktdaten. Ausführung und Menge lassen sich auf der jeweiligen Modellseite wählen.</p><div className="mt-7 flex flex-wrap gap-3">{chairs.map(chair => <Link key={chair.handle} href={`/produkte/stapelstuehle/${chair.handle}?reihe=ja`} className="btn-secondary">{chair.title}</Link>)}</div></section> : null}
    <section className="border-t border-premium-beige pt-10"><p className="section-eyebrow">Auswahlhilfe</p><h2 className="section-title-functional mt-4">Bestand und Raum gemeinsam prüfen</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-premium-muted">Für bestehende Stühle helfen Modellangabe, Fotos des Gestells, Rohrmaße und ein gewünschter Stuhlabstand. Bei neuen Stühlen kann die Reihenverbindung direkt in der jeweiligen Konfiguration berücksichtigt werden.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/wissen/reihenverbinder-fuer-stapelstuehle" className="btn-primary">Ratgeber lesen</Link></div></section>
  </div>;
}
