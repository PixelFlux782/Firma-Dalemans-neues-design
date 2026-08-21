import type {
  CommerceFinderAttributes,
  CommerceFinderFloorMatch,
  CommerceFinderFloorType,
} from "@/lib/commerce/types";

/**
 * These values are simulated development fixtures.
 * Do not use as verified Dalemans product data.
 */

export interface DevelopmentFinderVariantFixture {
  id: string;
  sku: string;
  title: string;
  attributes: CommerceFinderAttributes;
}

export interface DevelopmentFinderProductFixture {
  handle: string;
  title: string;
  glidingSurfaceLabel: "Filz" | "Kunststoff";
  variants: DevelopmentFinderVariantFixture[];
}

const allFloors: CommerceFinderFloorType[] = [
  "parquet",
  "laminate",
  "vinyl",
  "tile_stone",
  "carpet",
  "mixed",
];

function floors(
  preferred: CommerceFinderFloorType[],
  compatible: CommerceFinderFloorType[] = [],
): Record<CommerceFinderFloorType, CommerceFinderFloorMatch> {
  return Object.fromEntries(
    allFloors.map((floor) => [
      floor,
      preferred.includes(floor)
        ? "preferred"
        : compatible.includes(floor)
          ? "compatible"
          : "unsuitable",
    ]),
  ) as Record<CommerceFinderFloorType, CommerceFinderFloorMatch>;
}

const feltHardFloors = floors(
  ["parquet", "laminate", "vinyl"],
  ["tile_stone", "mixed"],
);
const plasticFloors = floors(
  ["tile_stone", "carpet"],
  ["laminate", "mixed"],
);
const cantileverFloors = floors(
  ["parquet", "laminate", "vinyl"],
  ["mixed"],
);

function roundVariant({
  id,
  sku,
  nominal,
  min,
  max,
  glidingSurface,
  floorSuitability,
  packSize,
  itemType = "chair",
}: {
  id: string;
  sku: string;
  nominal: number;
  min: number;
  max: number;
  glidingSurface: "felt" | "plastic";
  floorSuitability: Record<CommerceFinderFloorType, CommerceFinderFloorMatch>;
  packSize: number;
  itemType?: "chair" | "table";
}): DevelopmentFinderVariantFixture {
  return {
    id,
    sku,
    title: `Rundrohr ${nominal} mm`,
    attributes: {
      itemTypes: [itemType],
      frameShape: "round",
      mountingType: "internal_insert",
      nominalDimensions: { diameter: nominal },
      dimensionRanges: { diameter: { min, max } },
      floorSuitability,
      glidingSurface,
      glidersPerItem: { [itemType]: 4 },
      packSize,
      dataStatus: "development",
    },
  };
}

function twoDimensionalVariant({
  id,
  sku,
  title,
  frameShape,
  nominalWidth,
  nominalHeight,
  widthRange,
  heightRange,
  glidingSurface,
  floorSuitability,
  packSize,
  glidersPerItem = 4,
  mountingType = "internal_insert",
}: {
  id: string;
  sku: string;
  title: string;
  frameShape: "square" | "rectangular" | "oval" | "cantilever";
  nominalWidth: number;
  nominalHeight: number;
  widthRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  glidingSurface: "felt" | "plastic";
  floorSuitability: Record<CommerceFinderFloorType, CommerceFinderFloorMatch>;
  packSize: number;
  glidersPerItem?: number;
  mountingType?: "internal_insert" | "runner";
}): DevelopmentFinderVariantFixture {
  return {
    id,
    sku,
    title,
    attributes: {
      itemTypes: ["chair"],
      frameShape,
      mountingType,
      nominalDimensions: { width: nominalWidth, height: nominalHeight },
      dimensionRanges: { width: widthRange, height: heightRange },
      floorSuitability,
      glidingSurface,
      glidersPerItem: { chair: glidersPerItem },
      packSize,
      dataStatus: "development",
    },
  };
}

export const developmentFinderFixtures: DevelopmentFinderProductFixture[] = [
  {
    handle: "filzgleiter-fuer-rundrohr",
    title: "Filzgleiter für Rundrohr",
    glidingSurfaceLabel: "Filz",
    variants: [
      roundVariant({ id: "rf-18", sku: "DEV-RF-18", nominal: 18, min: 17.5, max: 18.8, glidingSurface: "felt", floorSuitability: feltHardFloors, packSize: 20 }),
      roundVariant({ id: "rf-20", sku: "DEV-RF-20", nominal: 20, min: 18.7, max: 20.4, glidingSurface: "felt", floorSuitability: feltHardFloors, packSize: 20 }),
      roundVariant({ id: "rf-22", sku: "DEV-RF-22", nominal: 22, min: 21.4, max: 22.6, glidingSurface: "felt", floorSuitability: feltHardFloors, packSize: 20 }),
    ],
  },
  {
    handle: "kunststoffgleiter-fuer-rundrohr",
    title: "Kunststoffgleiter für Rundrohr",
    glidingSurfaceLabel: "Kunststoff",
    variants: [
      roundVariant({ id: "rk-18", sku: "DEV-RK-18", nominal: 18, min: 17.5, max: 18.6, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 50 }),
      roundVariant({ id: "rk-20", sku: "DEV-RK-20", nominal: 20, min: 18.8, max: 20.5, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 50 }),
      roundVariant({ id: "rk-22", sku: "DEV-RK-22", nominal: 22, min: 21.5, max: 22.7, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 50 }),
    ],
  },
  {
    handle: "gleiter-fuer-vierkantrohr",
    title: "Gleiter für Vierkantrohr",
    glidingSurfaceLabel: "Kunststoff",
    variants: [
      twoDimensionalVariant({ id: "sq-20", sku: "DEV-SQ-20", title: "Vierkantrohr 20 × 20 mm", frameShape: "square", nominalWidth: 20, nominalHeight: 20, widthRange: { min: 19.4, max: 20.6 }, heightRange: { min: 19.4, max: 20.6 }, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 25 }),
      // Additional overlap fixture: 20.5–20.6 mm deliberately creates a second multiple-match boundary.
      twoDimensionalVariant({ id: "sq-21", sku: "DEV-SQ-21", title: "Vierkantrohr 21 × 21 mm", frameShape: "square", nominalWidth: 21, nominalHeight: 21, widthRange: { min: 20.5, max: 21.6 }, heightRange: { min: 20.5, max: 21.6 }, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 25 }),
      twoDimensionalVariant({ id: "sq-25", sku: "DEV-SQ-25", title: "Vierkantrohr 25 × 25 mm", frameShape: "square", nominalWidth: 25, nominalHeight: 25, widthRange: { min: 24.4, max: 25.6 }, heightRange: { min: 24.4, max: 25.6 }, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 25 }),
    ],
  },
  {
    handle: "gleiter-fuer-rechteckrohr",
    title: "Gleiter für Rechteckrohr",
    glidingSurfaceLabel: "Kunststoff",
    variants: [
      twoDimensionalVariant({ id: "rec-30-15", sku: "DEV-REC-30-15", title: "Rechteckrohr 30 × 15 mm", frameShape: "rectangular", nominalWidth: 30, nominalHeight: 15, widthRange: { min: 29.4, max: 30.6 }, heightRange: { min: 14.4, max: 15.6 }, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 25 }),
      twoDimensionalVariant({ id: "rec-40-20", sku: "DEV-REC-40-20", title: "Rechteckrohr 40 × 20 mm", frameShape: "rectangular", nominalWidth: 40, nominalHeight: 20, widthRange: { min: 39.4, max: 40.6 }, heightRange: { min: 19.4, max: 20.6 }, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 25 }),
    ],
  },
  {
    handle: "gleiter-fuer-ovalrohr",
    title: "Gleiter für Ovalrohr",
    glidingSurfaceLabel: "Filz",
    variants: [
      twoDimensionalVariant({ id: "ov-30-15", sku: "DEV-OV-30-15", title: "Ovalrohr 30 × 15 mm", frameShape: "oval", nominalWidth: 30, nominalHeight: 15, widthRange: { min: 29.3, max: 30.7 }, heightRange: { min: 14.3, max: 15.7 }, glidingSurface: "felt", floorSuitability: feltHardFloors, packSize: 20 }),
    ],
  },
  {
    handle: "bodengleiter-fuer-freischwinger",
    title: "Bodengleiter für Freischwinger",
    glidingSurfaceLabel: "Filz",
    variants: [
      twoDimensionalVariant({ id: "can-30-15", sku: "DEV-CAN-30-15", title: "Freischwinger 30 × 15 mm", frameShape: "cantilever", nominalWidth: 30, nominalHeight: 15, widthRange: { min: 29.3, max: 30.7 }, heightRange: { min: 14.3, max: 15.7 }, glidingSurface: "felt", floorSuitability: cantileverFloors, packSize: 10, glidersPerItem: 2, mountingType: "runner" }),
      twoDimensionalVariant({ id: "can-35-15", sku: "DEV-CAN-35-15", title: "Freischwinger 35 × 15 mm", frameShape: "cantilever", nominalWidth: 35, nominalHeight: 15, widthRange: { min: 34.3, max: 35.7 }, heightRange: { min: 14.3, max: 15.7 }, glidingSurface: "felt", floorSuitability: cantileverFloors, packSize: 10, glidersPerItem: 2, mountingType: "runner" }),
    ],
  },
  {
    handle: "tischgleiter-fuer-rundrohr",
    title: "Tischgleiter für Rundrohr",
    glidingSurfaceLabel: "Kunststoff",
    variants: [
      roundVariant({ id: "tr-30", sku: "DEV-TR-30", nominal: 30, min: 29.2, max: 30.8, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 10, itemType: "table" }),
      roundVariant({ id: "tr-40", sku: "DEV-TR-40", nominal: 40, min: 39.2, max: 40.8, glidingSurface: "plastic", floorSuitability: plasticFloors, packSize: 10, itemType: "table" }),
    ],
  },
];
