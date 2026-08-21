import type { FinderQuantityResult } from "@/lib/finder/types";

export const DEFAULT_RESERVE_PERCENT = 5;

export function calculateRequiredPieces(itemCount: number, glidersPerItem: number) {
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new RangeError("Die Anzahl muss eine positive ganze Zahl sein.");
  }
  if (!Number.isInteger(glidersPerItem) || glidersPerItem < 1) {
    throw new RangeError("Die Gleiterzahl pro Möbel muss eine positive ganze Zahl sein.");
  }
  return itemCount * glidersPerItem;
}

export function calculateReservePieces(
  requiredPieces: number,
  enabled: boolean,
  reservePercent = DEFAULT_RESERVE_PERCENT,
) {
  if (!enabled) return 0;
  if (requiredPieces < 0 || reservePercent < 0) {
    throw new RangeError("Menge und Reserve dürfen nicht negativ sein.");
  }
  return Math.ceil(requiredPieces * (reservePercent / 100));
}

export function roundToPackSize(pieces: number, packSize: number | null) {
  if (packSize === null) {
    return { packCount: null, orderPieces: pieces };
  }
  if (!Number.isInteger(packSize) || packSize < 1) {
    throw new RangeError("Die Packungsgröße muss eine positive ganze Zahl sein.");
  }
  const packCount = Math.ceil(pieces / packSize);
  return { packCount, orderPieces: packCount * packSize };
}

export function calculateFinderQuantity({
  itemCount,
  glidersPerItem,
  reserveEnabled,
  packSize,
  reservePercent = DEFAULT_RESERVE_PERCENT,
}: {
  itemCount: number;
  glidersPerItem: number;
  reserveEnabled: boolean;
  packSize: number | null;
  reservePercent?: number;
}): FinderQuantityResult {
  const requiredPieces = calculateRequiredPieces(itemCount, glidersPerItem);
  const reservePieces = calculateReservePieces(
    requiredPieces,
    reserveEnabled,
    reservePercent,
  );
  const recommendedPieces = requiredPieces + reservePieces;
  const order = roundToPackSize(recommendedPieces, packSize);

  return {
    itemCount,
    glidersPerItem,
    requiredPieces,
    reservePercent: reserveEnabled ? reservePercent : 0,
    reservePieces,
    recommendedPieces,
    packSize,
    packCount: order.packCount,
    orderPieces: order.orderPieces,
  };
}

