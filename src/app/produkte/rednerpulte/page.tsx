import type { Metadata } from "next";
import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import HomeSection from "@/components/home/HomeSection";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Rednerpulte",
  description: "Übersicht der Rednerpulte von DLMNS für Gottesdienste, Vorträge und Veranstaltungen.",
  path: "/produkte/rednerpulte",
  image: "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png",
});

const models = [
  { name: "Rednerpult Typ A", image: "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png" },
  { name: "Rednerpult Typ E", image: "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE.png" },
] as const;

export default function RednerpultePage() {
  return (
    <div className="page-stack">
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Rednerpulte" }]} />
      <HomeSection>
        <p className="section-eyebrow">Produktübersicht</p>
        <h1 className="section-title mt-5">Rednerpulte</h1>
        <p className="section-lead mt-6 max-w-2xl">Klare und funktionale Lösungen für Gottesdienste, Vorträge und Veranstaltungen.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {models.map((model) => (
            <article key={model.name}>
              <ProductVisual src={model.image} alt={`${model.name} aus Acrylglas`} sizes="(min-width: 768px) 50vw, 100vw" aspectRatio="4 / 5" imageInset="5%" backgroundTone="canvas" fadeStrength="medium" />
              <h2 className="mt-5 font-display text-2xl font-medium text-premium-ink">{model.name}</h2>
              <p className="mt-3 text-sm leading-7 text-premium-muted">Weitere Produktinformationen werden ergänzt.</p>
            </article>
          ))}
        </div>
        <Link href="/kontakt?anliegen=Rednerpulte" className="btn-primary mt-10 inline-flex">Rednerpult anfragen</Link>
      </HomeSection>
    </div>
  );
}
