import type {
  CommerceFinderAttributes,
  CommerceFinderDataStatus,
  CommerceFinderFloorMatch,
  CommerceFinderFloorType,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import { calculateFinderQuantity } from "@/lib/finder/quantity";
import {
  floorTypeLabels,
  frameShapeLabels,
  hasCompleteDimensions,
  itemTypeLabels,
  requiredDimensionKeys,
} from "@/lib/finder/rules";
import type { FinderDimensions, FinderInput, FinderMatch, FinderResult } from "@/lib/finder/types";

interface Candidate {
  product: CommerceProduct;
  variant: CommerceProductVariant;
  attributes: CommerceFinderAttributes;
}

export type FinderDataPolicy = "development_and_verified" | "verified_only";

export interface RecommendGlidersOptions {
  dataPolicy?: FinderDataPolicy;
}

function allCandidates(products: CommerceProduct[]): Candidate[] {
  return products.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.finderAttributes
        ? [{ product, variant, attributes: variant.finderAttributes }]
        : [],
    ),
  );
}

function dimensionsMatch(
  dimensions: FinderDimensions,
  attributes: CommerceFinderAttributes,
) {
  return requiredDimensionKeys(attributes.frameShape).every((key) => {
    const value = dimensions[key];
    const range = attributes.dimensionRanges[key];
    return (
      typeof value === "number" &&
      range !== undefined &&
      value >= range.min &&
      value <= range.max
    );
  });
}

function dimensionReason(dimensions: FinderDimensions, attributes: CommerceFinderAttributes) {
  if (attributes.frameShape === "round") {
    return `Der gemessene Außendurchmesser von ${dimensions.diameter} mm liegt im hinterlegten Maßbereich.`;
  }
  return `Die gemessenen Außenmaße ${dimensions.width} × ${dimensions.height} mm liegen im hinterlegten Maßbereich.`;
}

function floorReason(
  match: Exclude<CommerceFinderFloorMatch, "unsuitable">,
  floorType: CommerceFinderFloorType,
) {
  return match === "preferred"
    ? `Die Gleitfläche ist für ${floorTypeLabels[floorType]} bevorzugt hinterlegt.`
    : `Die Gleitfläche ist mit ${floorTypeLabels[floorType]} kompatibel hinterlegt.`;
}

function toMatch(candidate: Candidate, input: FinderInput): FinderMatch {
  const itemType = input.itemType!;
  const floorType = input.floorType as CommerceFinderFloorType;
  const floorMatch = candidate.attributes.floorSuitability[floorType];
  const glidersPerItem = candidate.attributes.glidersPerItem[itemType]!;
  if (floorMatch === "unsuitable") {
    throw new Error("Ungeeignete Bodenkombination darf nicht als Treffer ausgegeben werden.");
  }
  return {
    product: candidate.product,
    variant: candidate.variant,
    floorMatch,
    quantity: calculateFinderQuantity({
      itemCount: input.itemCount!,
      glidersPerItem,
      reserveEnabled: input.reserveEnabled,
      packSize: candidate.attributes.packSize,
    }),
    reasons: [
      `${itemTypeLabels[itemType]} und ${frameShapeLabels[candidate.attributes.frameShape]} sind für diese Ausführung hinterlegt.`,
      dimensionReason(input.dimensions, candidate.attributes),
      floorReason(floorMatch, floorType),
    ],
  };
}

function allowedByPolicy(
  dataStatus: CommerceFinderDataStatus,
  dataPolicy: FinderDataPolicy,
) {
  return dataPolicy === "development_and_verified" || dataStatus === "verified";
}

export function recommendGliders(
  products: CommerceProduct[],
  input: FinderInput,
  options: RecommendGlidersOptions = {},
): FinderResult {
  if (
    !input.itemType ||
    !input.frameShape ||
    input.frameShape === "unknown" ||
    !input.floorType ||
    input.floorType === "unknown" ||
    input.itemCount === null ||
    !Number.isInteger(input.itemCount) ||
    input.itemCount < 1
  ) {
    return {
      status: "uncertain",
      confidence: "insufficient",
      matches: [],
      message: "Das lässt sich anhand der Angaben noch nicht sicher bestimmen.",
    };
  }

  if (!hasCompleteDimensions(input.frameShape, input.dimensions)) {
    return {
      status: "uncertain",
      confidence: "insufficient",
      matches: [],
      message: "Das Maß fehlt oder ist noch nicht vollständig.",
    };
  }

  const dataPolicy = options.dataPolicy ?? "development_and_verified";
  const shapeCandidates = allCandidates(products).filter(
    ({ attributes }) =>
      allowedByPolicy(attributes.dataStatus, dataPolicy) &&
      attributes.itemTypes.includes(input.itemType!) &&
      attributes.glidersPerItem[input.itemType!] !== undefined &&
      attributes.frameShape === input.frameShape,
  );
  const dimensionCandidates = shapeCandidates.filter(({ attributes }) =>
    dimensionsMatch(input.dimensions, attributes),
  );
  const floorType = input.floorType as CommerceFinderFloorType;
  const preferredCandidates = dimensionCandidates.filter(
    ({ attributes }) => attributes.floorSuitability[floorType] === "preferred",
  );
  const compatibleCandidates = preferredCandidates.length > 0
    ? preferredCandidates
    : dimensionCandidates.filter(
      ({ attributes }) => attributes.floorSuitability[floorType] === "compatible",
    );

  if (compatibleCandidates.length === 0) {
    return {
      status: "no_match",
      confidence: "none",
      matches: [],
      message:
        "Für diese Kombination haben wir aktuell keine eindeutige Shop-Lösung.",
    };
  }

  const matches = compatibleCandidates.map((candidate) => toMatch(candidate, input));
  if (matches.length === 1) {
    return {
      status: "unique",
      confidence: "clear",
      matches: [matches[0]],
      message: "Diese Ausführung passt nach den aktuell hinterlegten Regeln eindeutig.",
    };
  }

  return {
    status: "multiple",
    confidence: "review",
    matches,
    message: matches.length === 2
      ? "Dieses Maß liegt im Übergangsbereich. Zwei Varianten kommen infrage."
      : `Dieses Maß liegt im Übergangsbereich. ${matches.length} Varianten kommen infrage.`,
  };
}
