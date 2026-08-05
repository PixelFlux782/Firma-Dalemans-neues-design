import type { Metadata } from "next";
import StackingChairsCategory from "@/components/StackingChairsCategory";
import { buildMetadata } from "@/lib/seo";

const heroImage = "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png";

export const metadata: Metadata = buildMetadata({
  title: "Rednerpulte",
  description: "Übersicht der Rednerpulte von Dalemans für Gottesdienste, Vorträge und Veranstaltungen.",
  path: "/produkte/rednerpulte",
  image: heroImage,
});

const models = [
  {
    title: "Rednerpult Typ A",
    slug: "rednerpult-typ-a",
    image: heroImage,
    imageAlt: "Rednerpult Typ A aus transparentem Acrylglas",
    shortDescription: "Ein transparentes Acrylglas-Rednerpult mit klarer Linienführung für Gottesdienste, Vorträge und Veranstaltungen.",
    highlights: [
      "transparente und zurückhaltende Raumwirkung",
      "großzügige Ablage für Manuskript und Unterlagen",
      "geeignet für Kirchen, Gemeinden und Veranstaltungsräume",
    ],
  },
  {
    title: "Rednerpult Typ E",
    slug: "rednerpult-typ-e",
    image: "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE.png",
    imageAlt: "Rednerpult Typ E aus transparentem Acrylglas",
    shortDescription: "Eine eigenständige Acrylglas-Ausführung für einen modernen, offenen Auftritt im Raum.",
    highlights: [
      "klare Formensprache aus transparentem Acrylglas",
      "funktionale Ablage für Rede und Präsentation",
      "für Vorträge, Gottesdienste und feierliche Anlässe",
    ],
  },
];

export default function RednerpultePage() {
  return <StackingChairsCategory heroImage={heroImage} products={models} variant="lecterns" />;
}
