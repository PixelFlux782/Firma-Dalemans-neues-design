import type { FabricCard } from "@/lib/knowledge/types";
import publicCards from "@/lib/knowledge/fabric-cards.public.json";

/**
 * Single WP02 hand-off point for public fabric-card downloads.
 * Keep vendor source locations outside this public dataset. A verified shared PDF
 * may be assigned to more than one group through the same publicUrl.
 */
export const fabricCards = publicCards as readonly FabricCard[];

export function hasVerifiedFabricCard(card: FabricCard) {
  return card.status === "available" && Boolean(card.publicUrl && card.lastVerifiedAt);
}
