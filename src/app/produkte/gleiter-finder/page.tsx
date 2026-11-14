import StandardGliderFinder from "@/components/finder/StandardGliderFinder";
import { getProductsByCollection } from "@/lib/commerce/service";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Gleiter-Finder", description: "Standardgleiter anhand bestätigter Eigenschaften zuordnen und Sondergleiter mit technischen Angaben anfragen.", path: "/produkte/gleiter-finder" });

export default async function GliderFinderPage() {
  const products = await getProductsByCollection("gleiter-bodenschutz");
  return <div className="page-stack"><header><p className="section-eyebrow">Gleiter & Bodenschutz</p><h1 className="section-title">Gleiter-Finder</h1><p className="mt-4">Vorhandene Ausführung prüfen oder Sondergleiter mit Ihren technischen Angaben anfragen.</p></header><StandardGliderFinder products={products} /></div>;
}
