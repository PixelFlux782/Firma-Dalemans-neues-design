export interface SupportSearchEntry {
  id: string;
  title: string;
  url: string;
  description: string;
  keywords: string[];
  aliases: string[];
  featuredWhenEmpty?: boolean;
}

export const supportSearchEntries: SupportSearchEntry[] = [
  {
    id: "accessories-hub",
    title: "Transportwagen, Zubehör und Ersatzteile",
    url: "/produkte/kategorien/transportwagen-zubehoer",
    description: "Hauptkategorie für Gleiter, Reihenverbinder, Buchablagen, Transportwagen und Ersatzteile.",
    keywords: ["Zubehör", "Ersatzteile", "Transportwagen", "Buchablagen", "Nachrüstung"],
    aliases: ["Zubehör-Hauptkategorie", "Ersatzteile finden"],
  },
  {
    id: "glider-finder",
    title: "Gleiter-Finder",
    url: "/produkte/gleiter-finder",
    description: "Passende Gleiter anhand von Gestellform, Außenmaß und Boden eingrenzen.",
    keywords: ["Stuhl messen", "Rohrmaß", "Außenmaß", "passender Gleiter"],
    aliases: ["welcher Gleiter", "Gleiter finden", "passender Gleiter", "Stuhl messen"],
    featuredWhenEmpty: true,
  },
  {
    id: "shop-overview",
    title: "Produkte entdecken",
    url: "/produkte",
    description: "Zubehör, Ersatzteile und Nachrüstung in Ruhe ansehen.",
    keywords: ["Shop", "Produkte", "Sortiment", "Zubehör"],
    aliases: [],
    featuredWhenEmpty: true,
  },
  {
    id: "personal-consultation",
    title: "Persönliche Beratung",
    url: "/kontakt?anliegen=Shop-Beratung",
    description: "Foto und Maße senden – Dalemans hilft bei einer unsicheren Zuordnung persönlich weiter.",
    keywords: ["Hilfe", "Beratung", "Kontakt", "Foto senden", "unsicher"],
    aliases: ["persönlich fragen", "Hilfe bei Auswahl"],
    featuredWhenEmpty: true,
  },
];
