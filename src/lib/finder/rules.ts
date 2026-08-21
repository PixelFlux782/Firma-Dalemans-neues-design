import type {
  CommerceFinderFloorType,
  CommerceFinderFrameShape,
  CommerceFinderItemType,
} from "@/lib/commerce/types";
import type { FinderDimensions } from "@/lib/finder/types";

export const itemTypeLabels: Record<CommerceFinderItemType, string> = {
  chair: "Stuhl",
  table: "Tisch",
};

export const frameShapeLabels: Record<CommerceFinderFrameShape, string> = {
  round: "Rundrohr",
  square: "Vierkantrohr",
  rectangular: "Rechteckrohr",
  oval: "Ovalrohr",
  cantilever: "Freischwinger / Sonderform",
};

export const floorTypeLabels: Record<CommerceFinderFloorType, string> = {
  parquet: "Parkett",
  laminate: "Laminat",
  vinyl: "Vinyl",
  tile_stone: "Fliesen / Stein",
  carpet: "Teppich",
  mixed: "Mehrere Böden",
};

export function requiredDimensionKeys(
  frameShape: CommerceFinderFrameShape,
): Array<keyof FinderDimensions> {
  return frameShape === "round" ? ["diameter"] : ["width", "height"];
}

export function hasCompleteDimensions(
  frameShape: CommerceFinderFrameShape,
  dimensions: FinderDimensions,
) {
  return requiredDimensionKeys(frameShape).every((key) => {
    const value = dimensions[key];
    return typeof value === "number" && Number.isFinite(value);
  });
}

