export interface StandardFinderInput {
  frame: string;
  dimensions: string;
  floor: string;
  quantity: number;
  model: string;
  mounting: string;
  angle: string;
  height: string;
  notes: string;
}

// Exact, confirmed properties only. A shared diameter alone proves no fit.
export function standardGliderMatch(input: StandardFinderInput) {
  if (input.model === "1021" && input.dimensions === "20" && input.mounting === "joint" && input.floor === "hard") {
    return { sku: "A1021FG", reason: "Modell 1021 mit 20-mm-Gestell und Filzgelenkgleiter für empfindliche Hartböden." };
  }
  if (input.model === "310" && input.mounting === "rivet") {
    return { sku: "ZGGF30", reason: "Klapptisch Modell 310, Blindniete 4,0 × 10,0 AL/ST. Alte Niete ausbohren und neue setzen. Modell 310c ist hiermit nicht bestätigt." };
  }
  if (input.frame === "steel" && input.dimensions === "20" && input.angle === "12" && input.height === "10" && input.mounting === "standard") {
    return { sku: "GSTGL", reason: "Stahlrohr 20 mm, Abschrägung 12°, Gleiterhöhe 10 mm, transparent. Die Eignung für Ihren Boden prüfen wir persönlich." };
  }
  return null;
}

export function finderInquiryMessage(input: StandardFinderInput, product?: { title: string; sku: string }) {
  const labels: Record<string, string> = { steel: "Stahlrohr", unknown: "Unbekannt", hard: "Empfindlicher Hartboden (Parkett / Laminat)", tile: "Fliesen / Stein", carpet: "Teppichboden", standard: "Kunststoffgleiter Standard", joint: "Filzgelenkgleiter", rivet: "Blindniete 4,0 × 10,0 AL/ST", nail: "Nagel / Dorn zum Einschlagen" };
  return [
    product ? `Produkt: ${product.title}\nArtikelnummer: ${product.sku}` : "Sondergleiter auf Anfrage",
    `Gestellform: ${labels[input.frame] ?? input.frame}`, `Rohrmaße (mm): ${input.dimensions || "noch zu klären"}`,
    `Bodenart: ${labels[input.floor] ?? input.floor}`, `Benötigte Anzahl: ${input.quantity} Stück`,
    "Verkaufseinheit Standardartikel: Garnitur (4 Stück); Sondergleiter: persönlich zu klären",
    `Möbelmodell: ${input.model || "unbekannt"}`, `Befestigung: ${labels[input.mounting] ?? input.mounting}`,
    `Abschrägung: ${input.angle || "unbekannt"} Grad`, `Gleiterhöhe: ${input.height || "unbekannt"} mm`,
    `Weitere Hinweise: ${input.notes || "keine"}`,
  ].join("\n");
}
