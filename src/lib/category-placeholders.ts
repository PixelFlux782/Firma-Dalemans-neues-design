import type { ProductCategoryId } from "@/lib/products";
import type { CinematicMood } from "@/components/CinematicMediaPlaceholder";

export const categoryPlaceholders: Record<
  ProductCategoryId,
  { ariaLabel: string; mood: CinematicMood }
> = {
  stapelstuehle: {
    ariaLabel: "Stapelstühle — atmosphärische Raumkomposition",
    mood: "warm-hall",
  },
  klapptische: {
    ariaLabel: "Klapptische — flexible Raumflächen",
    mood: "stone-arch",
  },
  "gemeindestuehle-bankettmoebel": {
    ariaLabel: "Gemeindestühle — festliche Raumatmosphäre",
    mood: "bronze-glow",
  },
  "transportwagen-zubehoer": {
    ariaLabel: "Transportwagen und Zubehör — organisierte Veranstaltungslogistik",
    mood: "espresso-lounge",
  },
};
