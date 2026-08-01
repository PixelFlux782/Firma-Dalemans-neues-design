export type SpecialOfferStatus = "active" | "reserved" | "sold" | "draft";

export interface SpecialOffer {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  condition?: "Lagerware" | "Restbestand" | "B-Ware" | "Musterstück" | "Ausstellungsstück" | "Einzelstück" | "Auslaufmodell";
  availability?: string;
  quantity?: number;
  regularPrice?: number;
  salePrice?: number;
  priceNote?: string;
  images: string[];
  features?: string[];
  defects?: string[];
  isFeatured?: boolean;
  status: SpecialOfferStatus;
  contactSubject: string;
}

// Nur Einträge mit status "active" werden veröffentlicht. Preise, Mengen und
// Zustände erst nach interner Bestätigung eintragen; Bilder allein sind kein Beleg.
export const specialOffers: SpecialOffer[] = [];

export const activeSpecialOffers = specialOffers.filter(
  (offer) => offer.status === "active",
);
