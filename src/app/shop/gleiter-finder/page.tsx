import type { Metadata } from "next";
import GliderFinder from "@/components/finder/GliderFinder";
import { StructuredData } from "@/components/StructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { CommerceFinderItemType } from "@/lib/commerce/types";
import type { FinderFloorType, FinderFrameShape, FinderInput } from "@/lib/finder/types";
import { getProducts } from "@/lib/commerce/service";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gleiter-Finder für Stühle und Tische",
  description:
    "Gleiter anhand von Gestellform, Außenmaß, Boden und benötigter Menge eingrenzen – mit persönlicher Hilfe bei unklarer Zuordnung.",
  path: "/shop/gleiter-finder",
  keywords: ["Gleiter finden", "Stuhlgleiter", "Rohrmaß", "Bodenschutz"],
});

interface FinderPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const itemTypes: CommerceFinderItemType[] = ["chair", "table"];
const frameShapes: FinderFrameShape[] = [
  "round",
  "square",
  "rectangular",
  "oval",
  "cantilever",
  "unknown",
];
const floorTypes: FinderFloorType[] = [
  "parquet",
  "laminate",
  "vinyl",
  "tile_stone",
  "carpet",
  "mixed",
  "unknown",
];

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function enumValue<T extends string>(value: string | undefined, allowed: T[]) {
  return value && allowed.includes(value as T) ? (value as T) : null;
}

function numberValue(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function initialFinderState(params: Record<string, string | string[] | undefined>): FinderInput {
  return {
    itemType: enumValue(one(params.art), itemTypes),
    frameShape: enumValue(one(params.form), frameShapes),
    dimensions: {
      diameter: numberValue(one(params.d)),
      width: numberValue(one(params.b)),
      height: numberValue(one(params.h)),
    },
    floorType: enumValue(one(params.boden), floorTypes),
    itemCount: numberValue(one(params.anzahl)) ?? null,
    reserveEnabled: one(params.reserve) !== "0",
  };
}

function initialFinderStep(value: string | undefined) {
  if (value === "ergebnis") return 6;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 0;
}

export default async function GliderFinderPage({ searchParams }: FinderPageProps) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);
  const finderProducts = products.filter((product) =>
    product.variants.some((variant) => variant.finderAttributes !== null),
  );
  const initialInput = initialFinderState(params);
  const initialStep = initialFinderStep(one(params.schritt));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DLMNS Gleiter-Finder",
    url: absoluteUrl("/shop/gleiter-finder"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: metadata.description,
  };

  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />
      <div>
        <Breadcrumbs
          items={[
            { label: "Start", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: "Gleiter-Finder" },
          ]}
          currentPath="/shop/gleiter-finder"
        />
        <div className="mt-8">
          <GliderFinder
            products={finderProducts}
            initialInput={initialInput}
            initialStep={initialStep}
          />
        </div>
      </div>
    </div>
  );
}
