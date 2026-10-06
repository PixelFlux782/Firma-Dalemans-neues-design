import Link from "next/link";
import CategoryHero from "@/components/products/CategoryHero";
import { StructuredData } from "@/components/StructuredData";
import { getProductCategoryById } from "@/lib/product-categories";
import { absoluteUrl } from "@/lib/seo";

const path = "/produkte/kategorien/transportwagen-zubehoer";
const areas = [
  { title: "Gleiter & Bodenschutz", text: "Filz- und Gestellgleiter passend zu Rohrform, Maß und Boden auswählen.", href: "/produkte/sortiment/gleiter-bodenschutz", links: [{ label: "Gleiter-Finder", href: "/produkte/gleiter-finder" }] },
  { title: "Reihenverbinder & Nachrüstung", text: "Bestehende Bestuhlung verbinden und sinnvoll ergänzen.", href: "/produkte/sortiment/reihenverbinder-nachruestung", links: [{ label: "Reihenverbinder", href: "/produkte/artikel/reihenverbinder-kunststoff" }] },
  { title: "Transport & Lagerung", text: "Stühle und Tische geordnet bewegen und lagern.", href: "/produkte/sortiment/transport-lagerung", links: [{ label: "Stuhltransportwagen", href: "/produkte/artikel/stuhltransportwagen" }, { label: "Tischtransportwagen", href: "/produkte/artikel/tischtransportwagen" }] },
  { title: "Buchablagen", text: "Praktische Ablage für geeignete Stahlrohrstühle nachrüsten.", href: "/produkte/artikel/buchablage-nachruesten", links: [{ label: "Nachrüstung ansehen", href: "/produkte/sortiment/reihenverbinder-nachruestung" }] },
  { title: "Weitere Zubehörteile", text: "Schreibtablare, Tischfüße und Gestellteile für bestehende Ausstattung prüfen.", href: "/produkte/schreibtablare", links: [{ label: "Tischfüße & Gestellteile", href: "/produkte/tischfuesse-gestellteile" }] },
] as const;

export default function AccessoriesHub() {
  const category = getProductCategoryById("transportwagen-zubehoer");
  if (!category) return null;
  return <div className="page-stack">
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`${path}#bereiche`), name: category.name, itemListElement: areas.map((area, index) => ({ "@type": "ListItem", position: index + 1, name: area.title, url: absoluteUrl(area.href) })) }} />
    <CategoryHero data={{
      slug: path,
      breadcrumbItems: [{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Zubehör" }],
      eyebrow: "Zubehör · Transport · Ersatzteile",
      title: "Zubehör für einen verlässlichen Alltag.",
      description: category.description,
      primaryCta: { label: "Bereiche entdecken", href: "#bereiche" },
      secondaryCta: { label: "Zubehör anfragen", href: "/kontakt?anliegen=Ersatzteilanfrage" },
      metaLine: "Kompatibilität persönlich geprüft · Ersatzteile und Nachrüstung · Hilfe bei der Zuordnung",
      image: { src: category.image, alt: "Stuhltransportwagen mit gestapelten Stühlen", inset: "5%", backgroundTone: "#f1ece1" },
    }} />
    <section id="bereiche" className="scroll-mt-28" aria-labelledby="accessory-areas">
      <p className="section-eyebrow">Zubehörbereiche</p><h2 id="accessory-areas" className="section-title mt-3">Passende Ergänzungen finden</h2>
      <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:grid-cols-3">{areas.map((area) => <article key={area.title} className="premium-card flex flex-col p-7"><h3 className="font-display text-2xl text-premium-ink">{area.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">{area.text}</p><Link href={area.href} className="mt-5 font-medium text-premium-forest underline-offset-4 hover:underline">Bereich ansehen →</Link><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{area.links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-premium-muted underline-offset-4 hover:underline">{link.label}</Link>)}</div></article>)}</div>
    </section>
    <section className="rounded-[2rem] bg-premium-warm/70 p-7 sm:p-10"><p className="section-eyebrow">Auswahlhilfe</p><h2 className="section-title-functional mt-3">Zubehör zum Bestand passend auswählen</h2><p className="mt-4 max-w-3xl leading-7 text-premium-muted">Für eine sichere Zuordnung helfen Fotos des vollständigen Produkts und des benötigten Teils, Maße, Modellbezeichnung, ungefähres Kaufjahr und Stückzahl. Bei Transportwagen sind zusätzlich Stapelmaß, Wege und Lagerort wichtig.</p><Link href="/kontakt?anliegen=Ersatzteilanfrage" className="btn-primary mt-6">Zubehör anfragen</Link></section>
  </div>;
}
