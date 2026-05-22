import type { ProductCategoryId } from "@/lib/products";

export const categoryPlaceholders: Record<
  ProductCategoryId,
  { label: string; todo: string }
> = {
  stapelstuehle: {
    label: "Stapelstühle — Raum für Begegnung",
    todo: "TODO: Premium-Bild für Stapelstühle",
  },
  klapptische: {
    label: "Klapptische — flexible Flächen",
    todo: "TODO: Premium-Bild für Klapptische",
  },
  "gemeindestuehle-bankettmoebel": {
    label: "Gemeindestühle — festliche Atmosphäre",
    todo: "TODO: Premium-Bild für Gemeindestühle",
  },
  "transportwagen-zubehoer": {
    label: "Lounge & Café — einladende Bereiche",
    todo: "TODO: Premium-Bild für Lounge/Café Bereich",
  },
};
