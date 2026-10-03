import { getProductBySlug, type Product } from "@/lib/products";
import type { CommerceProduct } from "@/lib/commerce/types";
import type { ProductDetailData } from "@/components/product-detail/ProductDetailPage";

const contact = (product: string, concern = "Produktberatung") => `/kontakt?anliegen=${encodeURIComponent(concern)}&produkt=${encodeURIComponent(product)}#anfrage`;
const roomHelp = (name: string): ProductDetailData["help"] => ({
  eyebrow: "Raum- und Bestuhlungsplanung", title: "Das Produkt im ganzen Raum planen.",
  text: "Stellpläne, Tischanordnungen, Wege sowie Lagerung und Transport gemeinsam betrachten.",
  href: `/raeume-planung/raumplanung?produkt=${encodeURIComponent(name)}`, label: "Raumplanung ansehen",
  secondaryHref: "/raumplaner", secondaryLabel: "3D-Raumplaner ausprobieren",
});

export function legacyDetailData(product: Product): ProductDetailData {
  const categoryHref = `/produkte/kategorien/${product.categoryId}`;
  const isTable = product.categoryId === "klapptische";
  const isGlider = product.slug === "stuhlgleiter" || product.slug === "ersatzteile-kleinteile";
  const isAccessory = product.categoryId === "transportwagen-zubehoer";
  return {
    path: `/produkte/${product.slug}`, category: product.categoryName, categoryHref,
    name: product.title, shortDescription: product.shortDescription, description: product.description,
    highlights: product.highlights, useCases: product.suitableFor, variants: product.variants,
    help: isTable ? roomHelp(product.title) : isGlider ? {
      eyebrow: "Zuordnung & Messhilfe", title: "Passende Ausführung ermitteln.",
      text: product.details?.join(" ") ?? product.shortDescription,
      href: "/produkte/gleiter-finder", label: "Gleiter-Finder starten",
    } : isAccessory ? {
      eyebrow: "Kompatibilität & Anwendung", title: "Passung vor der Bestellung prüfen.",
      text: product.details?.join(" ") ?? product.shortDescription,
      href: contact(product.title, "Kompatibilität"), label: "Kompatibilität prüfen",
    } : undefined,
    consultation: { eyebrow: "Persönliche Beratung", title: `${product.title} passend auswählen.`,
      text: product.note ?? product.shortDescription, href: contact(product.title, "Angebot"), label: "Angebot anfragen" },
    continuation: { title: product.categoryName, text: "Weitere Produkte und passende Ausführungen entdecken.", href: categoryHref, label: "Zur Kategorie" },
  };
}

export function commerceDetailData(product: CommerceProduct, category: string, categoryHref: string, path: string): ProductDetailData {
  const editorialSlug: Record<string, string> = {
    "klapptisch-310c": "klapptisch-310c",
    "trapez-klapptisch-310c": "trapezklapptisch-310c",
    "seminarklapptisch-210c": "seminar-klapptisch",
    tischtransportwagen: "tischtransportwagen",
    stuhltransportwagen: "stuhltransportwagen",
    "buchablage-nachruesten": "buchablage",
  };
  const editorial = editorialSlug[product.handle] ? getProductBySlug(editorialSlug[product.handle]) : undefined;
  const chair = Boolean(product.stackingChair);
  const table = product.collectionHandles.includes("klapptische");
  const glider = product.variants.some(variant => variant.finderAttributes);
  const developmentFinder = product.variants.some(variant => variant.finderAttributes?.dataStatus === "development");
  const help: ProductDetailData["help"] = chair || table ? roomHelp(product.title) : glider ? {
    eyebrow: "Gleiter-Finder & Messhilfe", title: "Welche Ausführung passt zum Gestell?",
    text: product.measureGuide.join(" ") || "Rohrform, Außenmaß und Boden vor der Auswahl prüfen.",
    href: "/produkte/gleiter-finder", label: "Gleiter-Finder starten",
  } : product.compatibility.length || product.measureGuide.length ? {
    eyebrow: "Kompatibilität & Anwendung", title: "Passung vor der Bestellung prüfen.",
    text: [...product.compatibility, ...product.measureGuide].join(" "),
    href: contact(product.title, "Kompatibilität"), label: "Kompatibilität prüfen",
  } : undefined;
  const optionGroups = new Map<string, Set<string>>();
  for (const variant of product.variants) for (const option of variant.selectedOptions) {
    const values = optionGroups.get(option.name) ?? new Set<string>(); values.add(option.value); optionGroups.set(option.name, values);
  }
  const variants = chair ? product.stackingChair?.editorialStatus === "reference" ? [
    "Ungepolstert – ohne zusätzliche Stoffgruppe.",
    "Sitzpolster – Stoffgruppe 2, 3 oder 4 separat wählen.",
    "Sitz- und Rückenpolster – Stoffgruppe 2, 3 oder 4 separat wählen.",
  ] : [] : [...optionGroups].filter(([, values]) => values.size > 1).map(([name, values]) => `${name}: ${[...values].join(", ")}`);
  return {
    path, category, categoryHref, name: chair ? `Modell ${product.stackingChair?.modelCode}` : product.title,
    shortDescription: product.shortDescription,
    description: editorial ? `${product.description} ${editorial.description}` : product.description,
    highlights: chair ? ["stapelbar", "Polsterarten wählbar", ...(product.variants.some(variant => variant.selectedOptions.some(option => option.name === "Reihenverbindung" && option.value === "Mit Reihenverbindung")) ? ["Reihenverbindung erhältlich"] : [])] : editorial ? editorial.highlights : developmentFinder ? [] : [...product.compatibility, ...product.suitableFor].slice(0, 3),
    compatibility: developmentFinder ? [] : product.compatibility,
    useCases: developmentFinder ? [] : [...new Set([...product.suitableFor, ...(editorial?.suitableFor ?? [])])], variants, specifications: developmentFinder ? [] : product.specifications,
    editorialNotes: editorial ? [...(product.handle === "seminarklapptisch-210c" ? (editorial.details ?? []).slice(2) : editorial.details ?? []), ...(editorial.note ? [editorial.note] : [])] : undefined,
    help, downloads: product.downloads, faq: product.faq,
    consultation: { eyebrow: chair ? "Musterstuhl & Beratung" : "Persönliche Beratung",
      title: chair ? "Ausführung vor größerer Bestellung persönlich prüfen." : "Ausführung und Einsatz persönlich klären.",
      text: product.consultationNote ?? product.shortDescription,
      href: contact(product.title, chair ? "Musterstuhl" : "Produktberatung"),
      label: chair ? "Musterstuhl anfragen" : "Persönlich beraten lassen" },
    continuation: { title: category, text: "Weitere Modelle und Ergänzungen ansehen.", href: categoryHref, label: "Zur Übersicht" },
  };
}
