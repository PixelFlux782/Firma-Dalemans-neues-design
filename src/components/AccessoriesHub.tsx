import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";
import { StructuredData } from "@/components/StructuredData";
import { getProductCategoryById } from "@/lib/product-categories";
import { absoluteUrl } from "@/lib/seo";

const path = "/produkte/kategorien/transportwagen-zubehoer";
const areas = [
  { title: "Gleiter & Bodenschutz", text: "Filz- und Gestellgleiter passend zu Rohrform, Maß und Boden auswählen.", href: "/produkte/sortiment/gleiter-bodenschutz", links: [{ label: "Gleiter-Finder", href: "/produkte/gleiter-finder" }] },
  { title: "Reihenverbinder & Nachrüstung", text: "Bestehende Bestuhlung verbinden und sinnvoll ergänzen.", href: "/produkte/sortiment/reihenverbinder-nachruestung", links: [{ label: "Reihenverbinder", href: "/produkte/artikel/reihenverbinder-kunststoff" }] },
  { title: "Transport & Lagerung", text: "Stühle und Tische geordnet bewegen und lagern.", href: "/produkte/sortiment/transport-lagerung", links: [{ label: "Stuhltransportwagen", href: "/produkte/artikel/stuhltransportwagen" }, { label: "Tischtransportwagen", href: "/produkte/artikel/tischtransportwagen" }] },
  { title: "Buchablagen", text: "Praktische Ablage für geeignete Stahlrohrstühle nachrüsten.", href: "/produkte/artikel/buchablage-nachruesten", links: [{ label: "Nachrüstung ansehen", href: "/produkte/sortiment/reihenverbinder-nachruestung" }] },
  { title: "Ersatzteile", text: "Verschleißteile anhand von Modell, Fotos und Maßen zuordnen lassen.", href: "/produkte/ersatzteile-kleinteile", links: [{ label: "Beratung anfragen", href: "/kontakt?anliegen=Ersatzteilanfrage" }] },
  { title: "Weitere Zubehörteile", text: "Schreibtablare, Tischfüße und Gestellteile für bestehende Ausstattung prüfen.", href: "/produkte/schreibtablare", links: [{ label: "Tischfüße & Gestellteile", href: "/produkte/tischfuesse-gestellteile" }] },
] as const;

export default function AccessoriesHub() {
  const category = getProductCategoryById("transportwagen-zubehoer");
  if (!category) return null;
  return <div className="page-stack">
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`${path}#bereiche`), name: category.name, itemListElement: areas.map((area, index) => ({ "@type": "ListItem", position: index + 1, name: area.title, url: absoluteUrl(area.href) })) }} />
    <section className="grid overflow-hidden rounded-[2.5rem] border border-premium-beige/70 bg-white/55 shadow-premium lg:grid-cols-[.95fr_1.05fr]">
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
        <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Transportwagen, Zubehör und Ersatzteile" }]} currentPath={path} />
        <p className="section-eyebrow mt-10">Zubehör-Hauptkategorie</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-premium-ink sm:text-5xl">Transportwagen, Zubehör und Ersatzteile</h1>
        <p className="section-lead mt-6">{category.description}</p>
        <Link href="#bereiche" className="mt-8 text-sm font-semibold text-premium-forest underline-offset-4 hover:underline">Unterbereiche entdecken ↓</Link>
      </div>
      <ProductVisual src={category.image} alt="Stuhltransportwagen mit gestapelten Stühlen" priority sizes="(min-width: 1024px) 52vw, 100vw" aspectRatio="5 / 4" imageInset="5%" backgroundTone="canvas" className="min-h-[320px] lg:min-h-[570px]" />
    </section>
    <section id="bereiche" className="scroll-mt-28" aria-labelledby="accessory-areas">
      <p className="section-eyebrow">Zubehörbereiche</p><h2 id="accessory-areas" className="section-title mt-3">Passende Ergänzungen finden</h2>
      <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:grid-cols-3">{areas.map((area) => <article key={area.title} className="premium-card flex flex-col p-7"><h3 className="font-display text-2xl text-premium-ink">{area.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">{area.text}</p><Link href={area.href} className="mt-5 font-medium text-premium-forest underline-offset-4 hover:underline">Bereich ansehen →</Link><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{area.links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-premium-muted underline-offset-4 hover:underline">{link.label}</Link>)}</div></article>)}</div>
    </section>
    <section className="rounded-[2rem] bg-premium-warm/70 p-7 sm:p-10"><p className="section-eyebrow">Auswahlhilfe</p><h2 className="section-title-functional mt-3">Zubehör zum Bestand passend auswählen</h2><p className="mt-4 max-w-3xl leading-7 text-premium-muted">Für eine sichere Zuordnung helfen Fotos des vollständigen Produkts und des benötigten Teils, Maße, Modellbezeichnung, ungefähres Kaufjahr und Stückzahl. Bei Transportwagen sind zusätzlich Stapelmaß, Wege und Lagerort wichtig.</p><Link href="/kontakt?anliegen=Ersatzteilanfrage" className="btn-primary mt-6">Zubehör anfragen</Link></section>
  </div>;
}
