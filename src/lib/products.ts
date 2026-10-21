export type ProductCategoryId =
  | "stapelstuehle"
  | "klapptische"
  | "bistrotische"
  | "gemeindestuehle-bankettmoebel"
  | "transportwagen-zubehoer";

const asset = (path: string) => encodeURI(path);

export interface Product {
  title: string;
  slug: string;
  categoryId: ProductCategoryId;
  categoryName: string;
  image: string;
  imageAlt?: string;
  additionalImages?: { image: string; imageAlt: string }[];
  overviewGroup?: "transport" | "chair-accessories" | "table-accessories" | "spares";
  shortDescription: string;
  description: string;
  highlights: string[];
  suitableFor: string[];
  details?: string[];
  variants?: string[];
  note?: string;
}

// Keep withdrawn products in the source catalog so they can be reviewed and
// reactivated later without exposing their pages, images, or links publicly.
const productCatalog: Product[] = [
  {
    title: "Stapelstuhl Mod. 1021c",
    slug: "stapelstuhl-mod-1021c",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/1021c.webp"),
    shortDescription:
      "Bewährter Stapelstuhl für Gemeinden, Säle und Veranstaltungsräume mit hoher Beanspruchung.",
    description:
      "Unser Stapelstuhl Mod. 1021c ist eine langlebige und praxiserprobte Lösung für den täglichen Einsatz. Er ist auf häufiges Stellen, Stapeln und Umräumen ausgelegt und eignet sich für Räume, in denen Zuverlässigkeit, Ordnung und ein gepflegtes Erscheinungsbild gleichermaßen wichtig sind.",
    highlights: [
      "robuste Stahlrohrkonstruktion für den dauerhaften Einsatz",
      "platzsparend stapelbar und leicht zu handhaben",
      "solide Lösung für stark genutzte Gemeinderäume und Säle",
    ],
    suitableFor: [
      "Gemeinden",
      "Kirchenräume",
      "Mehrzwecksäle",
      "Seminarräume",
    ],
    details: [
      "geschweißtes Gestell statt einfacher Lötverbindungen",
      "für den intensiven Alltag in Gemeinde- und Veranstaltungsräumen ausgelegt",
      "gut kombinierbar mit Reihenverbindern, Buchablagen und Stuhlgleitern",
    ],
    variants: [
      "mit Reihenverbindung planbar",
      "mit passendem Zubehör ergänzbar",
      "in abgestimmten Ausführungen für Reihen- und Flächenbestuhlung",
    ],
    note:
      "Bei häufig genutzten Bestuhlungen sollten Gestell, Sitzschale und Verbindungspunkte gemeinsam geprüft werden.",
  },
  {
    title: 'Stapelstuhl Mod. 1021c "Bünde"',
    slug: "stapelstuhl-mod-1021c-buende",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.jpg",
    ),
    shortDescription:
      "Repräsentative Variante für geordnete Reihenbestuhlung in Gemeindesälen und Veranstaltungsräumen.",
    description:
      'Die Ausführung "Bünde" verbindet die praktischen Eigenschaften eines Stapelstuhls mit einem ruhigeren, wertigeren Auftritt. Das Modell eignet sich überall dort, wo neben Funktion auch ein stimmiges Gesamtbild für Gottesdienste, Feiern und festliche Veranstaltungen gefragt ist.',
    highlights: [
      "ansprechender Auftritt für Gemeinderäume und Festveranstaltungen",
      "stabil im täglichen Einsatz und bei häufigen Umstellungen",
      "für geordnete Reihenbestuhlung sehr gut geeignet",
    ],
    suitableFor: [
      "Gemeindesäle",
      "Kirchenräume",
      "Feierstunden",
      "Bankettbereiche",
    ],
    details: [
      "nutzt die bewährte Alltagstauglichkeit eines Stapelstuhls",
      "wirkt in Reihenaufstellungen ruhig und geordnet",
      "passend für Räume, in denen Funktion und Atmosphäre zusammenkommen sollen",
    ],
    variants: [
      "mit Reihenverbindern kombinierbar",
      "als abgestimmte Bestuhlung für größere Säle planbar",
    ],
  },
  {
    title: "Stapelstuhl 1010i",
    slug: "stapelstuhl-1010i",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/1021a.webp"),
    shortDescription:
      "Wirtschaftlicher Stapelstuhl für hohe Stückzahlen und schnelle Saalumbauten.",
    description:
      "Unser Stapelstuhl 1010i ist für größere Bestuhlungen in flexibel genutzten Räumen ausgelegt. Er lässt sich platzsparend lagern und bei Bedarf schnell auf- und abbauen.",
    highlights: [
      "solide Lösung für größere Bestuhlungen",
      "platzsparende Lagerung durch gute Stapelbarkeit",
      "praktisch für häufig wechselnde Raumkonzepte",
    ],
    suitableFor: [
      "Mehrzweckhallen",
      "Vereinsheime",
      "Schulungsräume",
      "Gemeinden",
    ],
    details: [
      "auf Alltagstauglichkeit und zuverlässige Nutzung ausgelegt",
      "gut geeignet für Räume mit wechselnder Teilnehmerzahl",
      "sinnvolle Wahl bei wirtschaftlich geplanter Serienbestuhlung",
    ],
  },
  {
    title: "Stapelstuhl 1010a",
    slug: "stapelstuhl-1010a",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/1021b.webp"),
    shortDescription:
      "Klassischer Stapelstuhl für Räume, in denen Funktionalität und Verfügbarkeit im Vordergrund stehen.",
    description:
      "Unser Stapelstuhl 1010a ist eine unkomplizierte, verlässliche Lösung für wiederkehrende Veranstaltungen, Schulungen und Gemeindearbeit.",
    highlights: [
      "solide Basisausstattung für flexible Raumkonzepte",
      "leicht in bestehende Bestuhlungen integrierbar",
      "praxisgerecht für den regelmäßigen Einsatz",
    ],
    suitableFor: [
      "Gemeinderäume",
      "Vereinsheime",
      "Schulungsbereiche",
      "Vortragsräume",
    ],
    details: [
      "für einfache und zuverlässige Nutzung konzipiert",
      "gut geeignet für Räume mit häufiger Umstellung",
      "wirtschaftliche Lösung für den laufenden Betrieb",
    ],
  },
  {
    title: "Stapelstuhl 1010b",
    slug: "stapelstuhl-1010b",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/1021.webp"),
    shortDescription:
      "Robuste Bestuhlung für Veranstaltungsräume mit häufig wechselnden Nutzungsformen.",
    description:
      "Unser Modell 1010b ist für Räume gedacht, in denen die Bestuhlung regelmäßig aufgebaut, umgestellt und wieder eingelagert wird.",
    highlights: [
      "stapelbar und schnell wieder einsatzbereit",
      "robuste Bauweise für häufigen Gebrauch",
      "passend für vielseitige Veranstaltungsformate",
    ],
    suitableFor: [
      "Gemeindesäle",
      "Veranstaltungen",
      "Schulungen",
      "Versammlungsräume",
    ],
    details: [
      "praxisnah für wiederkehrende Umbauten",
      "unterstützt geordnete und flexible Saalnutzung",
      "sinnvoll für wechselnde Bestuhlungsdichten",
    ],
  },
  {
    title: "Bistrostuhl G4101",
    slug: "bistrostuhl-g4101",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset("/pictures/Produkte/Stühle/G-4101-e1424373810164.jpg"),
    shortDescription:
      "Freundliche Sitzlösung für Cafébereiche, Foyers und kommunikative Aufenthaltszonen.",
    description:
      "Mit dem Bistrostuhl G4101 ergänzen Sie klassische Saal- und Reihenbestuhlung um eine leichtere Sitzlösung für Gespräche und Begegnung.",
    highlights: [
      "freundliche Wirkung in Aufenthalts- und Bistrobereichen",
      "gut kombinierbar mit Bistrotischen und Nebenflächen",
      "sinnvolle Ergänzung zur Hauptbestuhlung",
    ],
    suitableFor: [
      "Foyers",
      "Gemeindecafés",
      "Bistroflächen",
      "Aufenthaltsräume",
    ],
    details: [
      "für informellere Bereiche mit Besucherbetrieb geeignet",
      "unterstützt lockere Begegnungszonen im Gebäude",
      "ergänzt repräsentative und funktionale Bestuhlungskonzepte",
    ],
  },
  {
    title: "Stapelstuhl E1000",
    slug: "stapelstuhl-e1000",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/ovales-griffloch.webp"),
    shortDescription:
      "Zweckmäßiges Modell für belastbare Reihen- und Flächenbestuhlung im Alltag.",
    description:
      "Unser Stapelstuhl E1000 ist eine verlässliche, unkomplizierte Lösung für regelmäßige Reihen- und Flächenbestuhlung. Er passt in unterschiedliche Raumkonzepte und lässt sich geordnet lagern.",
    highlights: [
      "verlässliche Lösung für größere Stückzahlen",
      "einfach im Handling und in der Lagerung",
      "geeignet für langfristige Nutzung",
    ],
    suitableFor: [
      "Saalbestuhlung",
      "Gemeinden",
      "Seminarräume",
      "Versammlungen",
    ],
    details: [
      "klar auf Alltagstauglichkeit ausgerichtet",
      "unterstützt geordnete Reihen- und Flächenbestuhlung",
      "gut für Räume mit wiederkehrender Nutzung",
    ],
  },
  {
    title: "Kantinenstuhl E1089",
    slug: "kantinenstuhl-e1089",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stahlrohr_Formholz_E1089s_02.jpg",
    ),
    shortDescription:
      "Praktischer Stuhl für Essbereiche, Gruppenräume und Mehrzwecknutzung.",
    description:
      "Unser Kantinenstuhl E1089 passt in Räume, in denen Menschen essen, sprechen oder arbeiten. Er verbindet angenehmes Sitzen mit einer robusten Konstruktion für den regelmäßigen Einsatz.",
    highlights: [
      "angenehm bei längeren Sitzzeiten",
      "pflegeleicht und robust im Betrieb",
      "passend für Speise- und Aufenthaltsbereiche",
    ],
    suitableFor: [
      "Speiseräume",
      "Gemeindecafés",
      "Pausenbereiche",
      "Sozialräume",
    ],
    details: [
      "für regelmäßig genutzte Gemeinschaftsbereiche geeignet",
      "unterstützt eine freundliche und praktische Raumausstattung",
      "sinnvoll für Mehrzweckbereiche mit Ess- und Gesprächssituationen",
    ],
  },
  {
    title: "Klappstuhl LS193",
    slug: "klappstuhl-ls193",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset("/pictures/Produkte/Stühle/Klappstuhl_Buchenholz_s193_02.jpg"),
    shortDescription:
      "Klappstuhl für flexible Zusatzbestuhlung und schnelle Raumwechsel.",
    description:
      "Unser Klappstuhl LS193 schafft schnell zusätzliche Sitzplätze und lässt sich bei Nichtgebrauch platzsparend lagern.",
    highlights: [
      "platzsparend klappbar",
      "als Ergänzungsbestuhlung einsetzbar",
      "ideal als Ergänzungs- und Reservebestuhlung",
    ],
    suitableFor: [
      "Vortragsräume",
      "Gemeindefeste",
      "Zusatzbestuhlung",
      "temporäre Veranstaltungen",
    ],
    details: [
      "sinnvoll für Räume mit unregelmäßiger Auslastung",
      "erleichtert die schnelle Erweiterung vorhandener Bestuhlung",
      "gut als Reserve für saisonale oder einmalige Einsätze",
    ],
  },
  {
    title: "Klappstuhl LS190",
    slug: "klappstuhl-ls190",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset("/pictures/Produkte/Stühle/Klappstuhl_Buchenholz_s190_02.jpg"),
    shortDescription:
      "Verlässlicher Klappstuhl für Veranstaltungen mit wechselnder Teilnehmerzahl.",
    description:
      "Unser Klappstuhl LS190 eignet sich als Zusatzbestuhlung für Sonderveranstaltungen und wechselnde Teilnehmerzahlen. Er lässt sich kompakt lagern und schnell bereitstellen.",
    highlights: [
      "gut für temporäre Bestuhlungen",
      "effizient im Auf- und Abbau",
      "flexibel für unterschiedliche Nutzungsdichten",
    ],
    suitableFor: [
      "Konferenzen",
      "Sonderveranstaltungen",
      "Eventbereiche",
      "Projektformate",
    ],
    details: [
      "sinnvoll für schnell wechselnde Veranstaltungssettings",
      "lässt sich wirtschaftlich als Zusatzkapazität vorhalten",
      "unterstützt geordnete Abläufe bei wechselnder Teilnehmerzahl",
    ],
  },
  {
    title: "Klappstuhl LS189",
    slug: "klappstuhl-ls189",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset("/pictures/Produkte/Stühle/Klappstuhl_Buchenholz_s189c_02.jpg"),
    shortDescription:
      "Kompakte Bestuhlungslösung für temporäre oder mobile Einsätze.",
    description:
      "Unser Klappstuhl LS189 ergänzt feste Bestuhlungen in multifunktionalen Räumen. Er ist schnell einsatzbereit und lässt sich bei Nichtgebrauch platzsparend lagern.",
    highlights: [
      "schnell einsatzbereit",
      "platzsparend bei Nichtgebrauch",
      "praktisch für Zusatz- und Reservebestände",
    ],
    suitableFor: [
      "Gemeindehäuser",
      "Tagungsräume",
      "mobile Einsätze",
      "temporäre Veranstaltungen",
    ],
    details: [
      "für flexible Nutzungssituationen konzipiert",
      "unterstützt Räume mit wechselndem Platzbedarf",
      "gut für ergänzende Bestuhlungsreserven",
    ],
  },
  {
    title: "Klappstuhl LS bas 1",
    slug: "klappstuhl-ls-bas-1",
    categoryId: "gemeindestuehle-bankettmoebel",
    categoryName: "Gemeindestühle & Bankettmöbel",
    image: asset("/pictures/Produkte/Stühle/Klappstuhl_Buchenholz_bas1_02.jpg"),
    shortDescription:
      "Schlichte Klappstuhl-Variante für wirtschaftliche Zusatzbestuhlung.",
    description:
      "Unser Modell LS bas 1 ist eine unkomplizierte Reservebestuhlung, die sich einfach lagern und bei Bedarf schnell einsetzen lässt.",
    highlights: [
      "wirtschaftlich für ergänzende Sitzplätze",
      "einfach zu lagern und bereitzustellen",
      "gut für wechselnde Veranstaltungsformate",
    ],
    suitableFor: [
      "Reservebestände",
      "Gemeindefeste",
      "Seminare",
      "temporäre Zusatzflächen",
    ],
    details: [
      "für planbare Zusatzkapazitäten geeignet",
      "sinnvoll bei gelegentlichen Spitzenbelegungen",
      "unterstützt flexible Raumbelegung ohne aufwendige Lagerung",
    ],
  },
  {
    title: "Klapptisch 310c",
    slug: "klapptisch-310c",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset("/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp"),
    imageAlt: "Rechteckiger Klapptisch mit heller Tischplatte und Metallkufen",
    shortDescription:
      "Rechteckiger Klapptisch für flexible Aufstellungen in Mehrzweckräumen.",
    description:
      "Unser Klapptisch 310c ist für wechselnde Nutzungen in Vereinsheimen, Seminarräumen, Kirchen sowie Sport- und Stadthallen ausgelegt.",
    highlights: [
      "klappbar für Räume mit wechselnder Nutzung",
      "Oberflächen passend zur geplanten Alltagsnutzung",
      "platzsparend lagerbar bei häufigen Umstellungen",
    ],
    suitableFor: [
      "Vereinsheime",
      "Seminarräume",
      "Kirchen und Gemeinden",
      "Sport- und Stadthallen",
    ],
    details: [
      "Prinzipiell kann jede Zwischengröße gefertigt werden. Es gilt dann der Preis der nächst höheren Größe.",
      "Für Reihenaufstellungen empfehlen wir in der Regel K1 oder K2; für Einzelaufstellungen und regelmäßig genutzte Stirnseiten K3 oder K4.",
      "Oberflächen und Kanten wählen wir passend zur Beanspruchung aus.",
    ],
    variants: [
      "in verschiedenen Tischmaßen planbar",
      "Gestellvarianten wählen wir passend zur Aufstellungsart aus",
      "für Reihenaufstellungen und Einzelaufstellungen passend auswählbar",
    ],
    note:
      "Bei einem 2:1-Maß entsprechen zwei Tischbreiten genau einer Tischlänge. Dadurch lassen sich Tische bündig und ohne Versatz zu rechtwinkligen Blöcken kombinieren.",
  },
  {
    title: "Trapezklapptisch 310c",
    slug: "trapezklapptisch-310c",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset(
      "/images/curated/Tische/Trapezklapptisch_Klapptische_trapez_klappbar.webp",
    ),
    imageAlt: "Klappbarer Trapeztisch mit heller Tischplatte und Metallgestell",
    shortDescription:
      "Variable Tischform für Halbkreise, Gruppeninseln und kommunikative Raumlayouts.",
    description:
      "Unser Trapezklapptisch 310c basiert bei Ausführung und Plattenkonstruktion weitgehend auf dem Modell 310c. Seine Form ermöglicht viele Aufstellungen für Unterricht, Gruppenarbeit und Veranstaltungen.",
    highlights: [
      "sehr vielseitige Stellmöglichkeiten",
      "gut für kommunikative und flexible Raumkonzepte",
      "klappbare Ausführung für flexible Raumkonzepte",
    ],
    suitableFor: [
      "Workshops",
      "Schulungen",
      "Gruppenarbeit",
      "variable Veranstaltungsräume",
    ],
    details: [
      "Plattenkonstruktion weitgehend wie beim Modell 310c",
      "ermöglicht Halbkreise, Inseln und offene Gruppenformen",
      "die Gestellausführung stimmen wir auf Ihr Projekt ab",
    ],
    variants: [
      "mit unterschiedlichen Aufstellungsbildern planbar",
      "als Ergänzung zu rechteckigen Tischformaten kombinierbar",
    ],
  },
  {
    title: "Seminar-Klapptisch",
    slug: "seminar-klapptisch",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset("/neue bilder/Tische/t210.png"),
    imageAlt: "Seminar-Klapptisch Modell T210",
    shortDescription:
      "Funktionaler Seminartisch für Unterricht, Besprechung und Schulung.",
    description:
      "Unser Seminar-Klapptisch ist eine bewusst reduzierte Lösung für Seminar- und Besprechungsräume. Ausführung und Eignung stimmen wir auf Ihre Nutzung ab.",
    highlights: [
      "klappbare Lösung für Seminarbereiche",
      "für flexible Aufstellungen planbar",
      "platzsparend lagerbar",
    ],
    suitableFor: [
      "Seminarräume",
      "Hotels",
      "Unterricht",
      "Besprechungen",
    ],
    details: [
      "Kanten- und Plattenausführung stimmen wir auf Ihr Projekt ab",
      "Klappgestell passend zur geplanten Nutzung",
      "für geordnete Reihen, U-Formen und Blockstellungen geeignet",
    ],
  },
  {
    title: "Bistrotisch",
    slug: "bistrotisch",
    categoryId: "bistrotische",
    categoryName: "Bistrotische",
    image: asset("/images/curated/Tische/Klapptisch_Stapeltisch_steh3erB_02.webp"),
    imageAlt: "Drei runde Bistrotische mit Säulengestell",
    shortDescription:
      "Kompakte Tischlösung für Cafébereiche, Begegnungszonen und Stehempfänge.",
    description:
      "Der Bistrotisch schafft kommunikative Nebenflächen in Foyers, Gemeindecafés und Aufenthaltsbereichen. Verfügbare Ausführungen und Maße klären wir in der Beratung.",
    highlights: [
      "kompakte Lösung für offene Begegnungsbereiche",
      "Säulengestell mit rundem Standfuß",
      "Ausführung und Oberfläche stimmen wir auf Ihr Projekt ab",
    ],
    suitableFor: [
      "Foyers",
      "Gemeindecafés",
      "Stehempfänge",
      "Bistrobereiche",
    ],
    details: [
      "Standsäule und Fuß passend zum gewünschten Einsatz",
      "Tischplatte in projektbezogen abgestimmter Ausführung",
      "Umleimer in verschiedenen Dekoren und Farben möglich",
    ],
    variants: [
      "verschiedene Höhen auf Anfrage",
      "Oberflächendekore aus dem Klapptischprogramm",
      "Sonderlösungen zum Beispiel in Alu-Riffelblech oder Metall",
    ],
  },
  {
    title: "Tischtransportwagen",
    slug: "tischtransportwagen",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Zubehör/Tischtransportwagen_02.webp"),
    imageAlt: "Transportwagen für zusammengeklappte Tische",
    overviewGroup: "transport",
    shortDescription:
      "Robuste Transporthilfe für Tische, passend auf das jeweilige Tischmaß abgestimmt.",
    description:
      "Unser Tischtransportwagen erleichtert Lagerung und Saalumbauten. Seine Abmessungen planen wir passend zu Ihren Tischen und Transportwegen.",
    highlights: [
      "Ausführung passend zu Tischmaß und Transportweg planbar",
      "für geordnete Lager- und Transportabläufe",
      "solide Lösung für den innerbetrieblichen Transport",
    ],
    suitableFor: [
      "Lager",
      "Hausmeisterteams",
      "Saalumbauten",
      "Veranstaltungslogistik",
    ],
    details: [
      "Auflagefläche passend zum Tischmaß geplant",
      "dadurch guter Schrammschutz für wertvolle Tischplatten",
      "Haltebügel und Lenkrollen beidseitig sind auf Wunsch möglich",
    ],
    variants: [
      "an unterschiedliche Tischgrößen anpassbar",
      "mit zusätzlichen Haltebügeln planbar",
      "mit Lenkrollen je nach Bedarf ausstattbar",
    ],
  },
  {
    title: "Stuhltransportwagen",
    slug: "stuhltransportwagen",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Zubehör/Stapelstuhl_Stuhltransportwagen_02.webp"),
    imageAlt: "Stuhltransportwagen mit gestapelten Holzschalenstühlen",
    overviewGroup: "transport",
    shortDescription:
      "Durchdachte Transportlösung für Stühle verschiedener Bauarten und Gestellbreiten.",
    description:
      "Unser Stuhltransportwagen erleichtert das Bewegen größerer Stuhlmengen. Ob er passt, prüfen wir anhand von Stuhltyp, Gestell und Transportweg.",
    highlights: [
      "Eignung prüfen wir anhand des vorhandenen Stuhltyps",
      "erleichtert Auf- und Abbauprozesse spürbar",
      "robust für wiederholte Nutzung im Alltag",
    ],
    suitableFor: [
      "Lagerung",
      "Bestuhlungswechsel",
      "Hausmeisterservice",
      "Veranstaltungslogistik",
    ],
    details: [
      "solide Konstruktion für regelmäßige Materialbewegung",
      "unterstützt schnelle Umbauten in Sälen und Gemeinderäumen",
      "sinnvoll für geordnete Lager- und Transportabläufe",
    ],
  },
  {
    title: "Stuhlgleiter",
    slug: "stuhlgleiter",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/neue bilder/Zubehör/stopfen-sortiment.png"),
    imageAlt: "Sortiment verschiedener Möbelgleiter und Gestellstopfen",
    overviewGroup: "chair-accessories",
    shortDescription:
      "Gleiter und Gestellstopfen für den langfristigen Erhalt vorhandener Stühle.",
    description:
      "Passende Stuhlgleiter können Böden schützen. Welche Ausführung geeignet ist, hängt von Gestell, Boden und Nutzung ab.",
    highlights: [
      "Ausführung passend zu Boden und Nutzung auswählen",
      "Zuordnung anhand von Gestellform und Maßen",
      "Filz- und Kunststoffvarianten persönlich anfragen",
    ],
    suitableFor: [
      "Holzböden",
      "Gemeindesäle",
      "Mehrzweckräume",
      "empfindliche Bodenflächen",
    ],
    details: [
      "passende Ausführung abhängig von Rohrform und Maßen",
      "Standfuß passend zum Gestell",
      "Form und Schaftlänge prüfen wir an Ihrem Bestand",
    ],
    variants: [
      "weitere Größen und Typen auf Anfrage",
    ],
  },
  {
    title: "Reihenverbinder",
    slug: "reihenverbinder",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Stapelstühle/stuhlverbinder.webp"),
    imageAlt: "Reihenverbinder zwischen zwei Stuhlgestellen",
    overviewGroup: "chair-accessories",
    shortDescription:
      "Integrierte Reihenverbindungen und nachrüstbare Kunststoff-Reihenverbinder im Vergleich.",
    description:
      "Für neue Stapelstühle kann eine feste Reihenverbindung als Ausstattungsvariante verfügbar sein. Für geeignete vorhandene Stahlrohrstühle kommen Kunststoff-Reihenverbinder zum Nachrüsten infrage. Die passende Lösung hängt vom Stuhlmodell, Gestell und gewünschten Abstand ab.",
    highlights: [
      "Stuhlvariante und Nachrüstprodukt unterscheiden",
      "Eignung für vorhandene Stühle individuell prüfen",
      "Reihenabstand bei der Auswahl berücksichtigen",
    ],
    suitableFor: [
      "Kirchen",
      "Säle",
      "Konferenzen",
      "Veranstaltungsräume",
    ],
    details: [
      "Eignung abhängig von Gestellform und Durchmesser",
      "Anzahl und Position klären wir anhand Ihrer Bestuhlung",
      "den gewünschten Stuhlabstand berücksichtigen wir bei der Auswahl",
    ],
    note:
      "Die Lösung kann für vorhandene Bestände ohne serienmäßige Reihenverbindung geprüft werden.",
  },
  {
    title: "Buchablage",
    slug: "buchablage",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Zubehör/zubehör-buchablage-an-stuhl.webp"),
    imageAlt: "Buchablage unter der Sitzfläche eines Stapelstuhls",
    overviewGroup: "chair-accessories",
    shortDescription:
      "Klappbare Buchablage für Stahlrohrstühle, ohne die Stapelbarkeit zu verlieren.",
    description:
      "Die Buchablage bleibt nach dem Einsetzen am Stuhl und klappt beim Stapeln selbstständig weg. Damit verbindet sie praktischen Nutzen im Gottesdienst- oder Gemeindeeinsatz mit einem der wichtigsten Vorteile von Stapelstühlen: der kompakten Lagerung.",
    highlights: [
      "bleibt beim Stapeln am Stuhl",
      "klappt selbstständig weg und wieder in Endstellung",
      "schränkt die Bewegungsfreiheit der Füße nicht ein",
    ],
    suitableFor: [
      "Kirchenstühle",
      "Gemeindesäle",
      "Andachtsräume",
      "Gottesdienstbereiche",
    ],
    details: [
      "Ablagekörbe müssen beim Stapeln nicht mehr herausgenommen werden",
      "liegt beim Stapeln auf den Sitzpolstern des unteren Stuhls auf",
      "stabile Ausführung aus gepulvertem Stahlblech",
    ],
    variants: [
      "wirtschaftlich auch nur in jedem zweiten Stuhl einsetzbar",
    ],
  },
  {
    title: "Schreibtablare",
    slug: "schreibtablare",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Zubehör/schreibtablart-mit-stuhl-seite.webp"),
    imageAlt: "Schreibtablar seitlich an einem Stapelstuhl",
    additionalImages: [
      {
        image: asset("/neue bilder/Zubehör/schreibtablart-mit-stuhl-vorne.png"),
        imageAlt: "Stapelstuhl mit montiertem Schreibtablar von vorne",
      },
      {
        image: asset("/neue bilder/Zubehör/schreibtablart-von-unten.png"),
        imageAlt: "Schreibtablar mit Gestell und Befestigung von unten",
      },
      {
        image: asset("/neue bilder/Zubehör/schreibtablart.png"),
        imageAlt: "Holz-Schreibtablar mit eingelassener Stiftablage",
      },
    ],
    overviewGroup: "chair-accessories",
    shortDescription: "Schreibflächen am Stuhl für Vortrag, Seminar und konzentriertes Arbeiten.",
    description: "Schreibtablare ergänzen geeignete Stühle um eine kompakte Schreibfläche. Ob Befestigung und Ausführung zu einem vorhandenen Modell passen, prüfen wir anhand von Fotos, Maßen und Produktangaben.",
    highlights: ["montierte Gesamtansicht statt isoliertem Kleinteil", "Befestigung wird am vorhandenen Stuhl geprüft"],
    suitableFor: ["Seminare", "Vorträge", "Schulungen"],
    details: ["Einbauort und Befestigung müssen zum Gestell passen", "Ausführung wird produktbezogen zugeordnet"],
  },
  {
    title: "Tischfüße und Gestellteile",
    slug: "tischfuesse-gestellteile",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K1-optimiert.webp"),
    imageAlt: "Klapptisch-Gestell K1 mit zurückgesetzten vertikalen Rundrohren für Reihenaufstellungen",
    additionalImages: [
      { image: asset("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K2-optimiert.webp"), imageAlt: "Klapptisch-Gestell K2 mit zurückgesetzten vertikalen Vierkantrohren für Reihenaufstellungen" },
      { image: asset("/neue bilder/Gestelle/Gestelltypen/T_Klapptisch_Gestell_K3_Standard-optimiert.webp"), imageAlt: "Klapptisch-Gestell K3 mit außenliegenden Beinen für mehr Beinfreiheit an den Stirnseiten" },
      { image: asset("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K5-optimiert.webp"), imageAlt: "Klapptisch-Gestell K5 als weitere Gestellvariante" },
      { image: asset("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K9-optimiert.webp"), imageAlt: "Klapptisch-Gestell K9 als weitere Gestellvariante" },
      { image: asset("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K10-optimiert.webp"), imageAlt: "Klapptisch-Gestell K10 als weitere Gestellvariante" },
    ],
    overviewGroup: "table-accessories",
    shortDescription: "Gestelltypen für Reihenaufstellungen, Einzelaufstellungen und regelmäßig genutzte Stirnseiten.",
    description: "Welches Tischgestell wir empfehlen, richtet sich vor allem nach der geplanten Nutzung, der Aufstellung und dem gewählten Tischmodell. Wir prüfen die passende und verfügbare Ausführung für Ihr Projekt.",
    highlights: ["K1 oder K2 für lange Reihen", "K3 oder K4 für häufig genutzte Stirnseiten", "modellbezogene Prüfung durch uns"],
    suitableFor: ["Klapptische", "Konferenzen und Seminare", "Veranstaltungsräume"],
    details: ["Aufstellungsart und Stirnseitennutzung angeben", "Tischmodell und gewünschte Gestellform gemeinsam prüfen"],
    note: "K3 und K4 sind ohne Aufpreis erhältlich. Die gewünschte Ausführung kann bei der Bestellung angegeben werden.",
  },
];

export const products = productCatalog.filter(
  (product) => product.categoryId !== "gemeindestuehle-bankettmoebel"
    && product.categoryId !== "stapelstuehle",
);

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categoryId: ProductCategoryId) {
  return products.filter((product) => product.categoryId === categoryId);
}

