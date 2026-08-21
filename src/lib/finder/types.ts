import type {
  CommerceFinderFloorMatch,
  CommerceFinderFloorType,
  CommerceFinderFrameShape,
  CommerceFinderItemType,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";

export type FinderFrameShape = CommerceFinderFrameShape | "unknown";
export type FinderFloorType = CommerceFinderFloorType | "unknown";

export interface FinderDimensions {
  diameter?: number;
  width?: number;
  height?: number;
}

export interface FinderInput {
  itemType: CommerceFinderItemType | null;
  frameShape: FinderFrameShape | null;
  dimensions: FinderDimensions;
  floorType: FinderFloorType | null;
  itemCount: number | null;
  reserveEnabled: boolean;
}

export interface FinderQuantityResult {
  itemCount: number;
  glidersPerItem: number;
  requiredPieces: number;
  reservePercent: number;
  reservePieces: number;
  recommendedPieces: number;
  packSize: number | null;
  packCount: number | null;
  orderPieces: number;
}

export interface FinderMatch {
  product: CommerceProduct;
  variant: CommerceProductVariant;
  floorMatch: Exclude<CommerceFinderFloorMatch, "unsuitable">;
  quantity: FinderQuantityResult;
  reasons: string[];
}

export type FinderResult =
  | {
      status: "unique";
      confidence: "clear";
      matches: [FinderMatch];
      message: string;
    }
  | {
      status: "multiple";
      confidence: "review";
      matches: FinderMatch[];
      message: string;
    }
  | {
      status: "uncertain";
      confidence: "insufficient";
      matches: [];
      message: string;
    }
  | {
      status: "no_match";
      confidence: "none";
      matches: [];
      message: string;
    };
