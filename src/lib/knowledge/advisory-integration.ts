import { guideArticles } from "@/lib/knowledge/guides";
import type { GuideArticle } from "@/lib/knowledge/types";
import type { ProductCategoryId } from "@/lib/products";

export type GuideSlug = (typeof guideArticles)[number]["slug"];

export interface GuideProductIntegration {
  guideSlug: GuideSlug;
  collectionHandles: readonly string[];
  productHandles: readonly string[];
  legacyCategoryIds: readonly ProductCategoryId[];
  productContext: string;
  roomPlanner?: {
    title: string;
    description: string;
  };
  consultation: {
    concern: string;
    description: string;
  };
}

/**
 * Editorial bridge between advice and the existing catalog. Handles and
 * collections refer to existing commerce records; this never creates variants
 * or derives product characteristics.
 */
export const guideProductIntegrations: readonly GuideProductIntegration[] = [
  {
    guideSlug: "stapelstuehle-richtig-auswaehlen",
    collectionHandles: ["stapelstuehle"],
    productHandles: ["coburg", "nuernberg", "1021"],
    legacyCategoryIds: ["stapelstuehle"],
    productContext: "Auswahlhilfe zu Nutzung, Komfort, Polsterung und Reihenverbindung.",
    roomPlanner: {
      title: "Stuhlwahl im Raum weiterdenken",
      description: "Eine mögliche Aufstellung und den ungefähren Bedarf unverbindlich im Raumplaner vorbereiten.",
    },
    consultation: {
      concern: "Stapelstuhl-Auswahl",
      description: "Wenn Nutzung, Sitzdauer oder Ausstattung noch nicht eindeutig sind, grenzen wir die passende Ausführung persönlich ein.",
    },
  },
  {
    guideSlug: "reihenverbinder-fuer-stapelstuehle",
    collectionHandles: ["reihenverbinder-nachruestung"],
    productHandles: ["reihenverbinder-kunststoff"],
    legacyCategoryIds: [],
    productContext: "Hinweise zur Modellprüfung, Nachrüstung und Einordnung einer Reihenaufstellung.",
    roomPlanner: {
      title: "Reihenaufstellung vorbereiten",
      description: "Reihen, Wege und Ausgänge als Planungsentwurf anlegen; die Prüfung durch zuständige Fachstellen bleibt erforderlich.",
    },
    consultation: {
      concern: "Reihenverbinder",
      description: "Die Kompatibilität einer Nachrüstlösung muss am konkreten Stuhl und Gestell geprüft werden.",
    },
  },
  {
    guideSlug: "transport-lagerung-pflege",
    collectionHandles: ["transport-lagerung", "gleiter-bodenschutz"],
    productHandles: ["stuhltransportwagen", "tischtransportwagen", "filzgleiter-mit-stift"],
    legacyCategoryIds: ["transportwagen-zubehoer"],
    productContext: "Praxiswissen zu Transport, Lagerung, Pflege und dem Erhalt vorhandener Möbel.",
    consultation: {
      concern: "Transport und Ersatzteile",
      description: "Wagen, Gleiter und Ersatzteile werden anhand von Modell, Maßen, Bestand und Transportweg zugeordnet.",
    },
  },
  {
    guideSlug: "stoffe-und-bezuege",
    collectionHandles: ["stapelstuehle"],
    productHandles: ["1021", "coburg", "nuernberg"],
    legacyCategoryIds: ["stapelstuehle"],
    productContext: "Orientierung zu Stoffgruppen, Pflege, Mustern und konkret nachzuweisenden Eigenschaften.",
    consultation: {
      concern: "Stoffmuster",
      description: "Farbe, Haptik und geforderte Nachweise lassen sich erst an der konkreten Stoffvariante zuverlässig prüfen.",
    },
  },
  {
    guideSlug: "klapptische-richtig-waehlen",
    collectionHandles: ["klapptische"],
    productHandles: ["klapptisch-310c", "seminarklapptisch-210c", "trapez-klapptisch-310c"],
    legacyCategoryIds: ["klapptische"],
    productContext: "Auswahlhilfe zu Tischmaßen, Aufstellungen, Gestellen und Lagerung.",
    roomPlanner: {
      title: "Tischaufstellung im Raum erproben",
      description: "Tischgruppen und Bestuhlung als unverbindlichen Entwurf im Raumplaner zusammenstellen.",
    },
    consultation: {
      concern: "Klapptisch-Auswahl",
      description: "Wenn Maß, Gestell oder Oberfläche noch offen sind, stimmen wir die verfügbare Ausführung auf Raum und Nutzung ab.",
    },
  },
  {
    guideSlug: "tischplatten-und-kanten",
    collectionHandles: ["klapptische"],
    productHandles: ["klapptisch-310c", "seminarklapptisch-210c", "trapez-klapptisch-310c"],
    legacyCategoryIds: ["klapptische"],
    productContext: "Sachliche Entscheidungshilfe zu Oberflächen, Kanten, Mustern und Pflege.",
    consultation: {
      concern: "Tischoberfläche und Kante",
      description: "Dekor, Kante und Sonderausführung sollten am konkreten Modell und möglichst mit einem echten Muster geklärt werden.",
    },
  },
];

export interface RelatedGuideLink {
  slug: GuideSlug;
  title: string;
  description: string;
  href: string;
}

export function getGuideIntegration(slug: string): GuideProductIntegration | undefined {
  return guideProductIntegrations.find((integration) => integration.guideSlug === slug);
}

export function getRelatedGuidesForProduct(input: {
  handle?: string;
  collectionHandles?: readonly string[];
  legacyCategoryId?: ProductCategoryId;
}): RelatedGuideLink[] {
  const matches = guideProductIntegrations.filter((integration) =>
    (input.handle && integration.productHandles.includes(input.handle)) ||
    input.collectionHandles?.some((handle) => integration.collectionHandles.includes(handle)) ||
    (input.legacyCategoryId && integration.legacyCategoryIds.includes(input.legacyCategoryId))
  );

  return matches.flatMap((integration) => {
    const article = guideArticles.find((guide) => guide.slug === integration.guideSlug) as GuideArticle | undefined;
    return article ? [{
      slug: integration.guideSlug,
      title: article.title,
      description: integration.productContext,
      href: `/wissen/${article.slug}`,
    }] : [];
  });
}
