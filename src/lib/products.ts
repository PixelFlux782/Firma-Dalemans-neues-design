export type ProductCategoryId =
  | "stapelstuehle"
  | "klapptische"
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
  overviewGroup?: "transport" | "chair-accessories" | "table-accessories" | "spares";
  shortDescription: string;
  description: string;
  highlights: string[];
  suitableFor: string[];
  details?: string[];
  variants?: string[];
  note?: string;
}

export const products: Product[] = [
  {
    title: "Stapelstuhl Mod. 1021c",
    slug: "stapelstuhl-mod-1021c",
    categoryId: "stapelstuehle",
    categoryName: "Stapelstühle",
    image: asset("/images/curated/Stapelstühle/1021c.webp"),
    shortDescription:
      "Bewährter Stapelstuhl für Gemeinden, Säle und Veranstaltungsräume mit hoher Beanspruchung.",
    description:
      "Der Stapelstuhl Mod. 1021c steht bei Dalemans für eine langlebige und praxiserprobte Lösung im täglichen Einsatz. Das Modell ist auf häufiges Stellen, Stapeln und Umräumen ausgelegt und eignet sich für Räume, in denen Zuverlässigkeit, Ordnung und ein gepflegtes Erscheinungsbild gleichermaßen wichtig sind.",
    highlights: [
      "robuste Stahlrohrkonstruktion für den dauerhaften Einsatz",
      "platzsparend stapelbar und leicht im Handling",
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
      "Der Stapelstuhl 1010i ist auf effiziente Bestuhlung in flexibel genutzten Räumen ausgelegt. Das Modell eignet sich besonders für Einrichtungen, die große Stückzahlen zuverlässig vorhalten und bei Bedarf schnell auf- und abbauen möchten.",
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
      "Der Stapelstuhl 1010a ist eine klare, verlässliche Lösung für den täglichen Einsatz. Er unterstützt Einrichtungen, die eine unkomplizierte Bestuhlung für wiederkehrende Veranstaltungen, Schulungen oder Gemeindearbeit suchen.",
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
      "Das Modell 1010b ist auf einen verlässlichen Veranstaltungsalltag ausgelegt. Es unterstützt Räume, in denen Bestuhlung regelmäßig aufgebaut, umgestellt, gelagert und erneut eingesetzt wird.",
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
      "Der Bistrostuhl G4101 ergänzt klassische Saal- und Reihenbestuhlung um eine leichtere, offenere Sitzlösung. Er eignet sich besonders für Bereiche, in denen Gespräche, Begegnung und eine einladende Atmosphäre im Vordergrund stehen.",
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
      "Der Stapelstuhl E1000 richtet sich an Einrichtungen, die eine verlässliche und unkomplizierte Lösung für regelmäßige Bestuhlung suchen. Das Modell passt in unterschiedliche Raumkonzepte und lässt sich gut organisieren und lagern.",
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
      "Der Kantinenstuhl E1089 eignet sich für Räume, in denen gegessen, gesprochen, gearbeitet oder betreut wird. Das Modell verbindet nutzerfreundlichen Sitzkomfort mit einer robusten Konstruktion für den laufenden Betrieb.",
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
      "Der Klappstuhl LS193 ist eine praktische Lösung, wenn kurzfristig zusätzliche Sitzplätze benötigt werden. Er lässt sich platzsparend lagern und bei Bedarf schnell bereitstellen.",
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
      "Der Klappstuhl LS190 unterstützt Räume, in denen mal kompakte Lagerung und mal schnelle Vollbestuhlung gefragt ist. Gerade bei Sonderveranstaltungen und Projektformaten spielt das Modell seine Stärken aus.",
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
      "Der Klappstuhl LS189 eignet sich überall dort, wo Sitzplätze regelmäßig ergänzt, zurückgebaut oder mobil eingesetzt werden. Er ergänzt feste Bestuhlungen besonders sinnvoll in multifunktionalen Räumen.",
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
      "Das Modell LS bas 1 ist eine praktische Wahl, wenn eine unkomplizierte und wirtschaftliche Reservebestuhlung gesucht wird. Es lässt sich einfach lagern, vorhalten und bei Bedarf schnell einsetzen.",
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
      "Der Klapptisch 310c ist für wechselnde Nutzungen in Vereinsheimen, Seminarräumen, Kirchen, Gemeinden sowie Sport- und Stadthallen vorgesehen.",
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
      "Ausführung und Komponenten werden projektbezogen abgestimmt",
      "Oberflächen und Kanten werden passend zur Beanspruchung ausgewählt",
      "Kantenausführung wird passend zur geplanten Nutzung abgestimmt",
    ],
    variants: [
      "in verschiedenen Tischmaßen planbar",
      "Gestellvarianten werden je nach Aufstellungsart beraten",
      "für Reihenaufstellungen und Einzelaufstellungen passend auswählbar",
    ],
    note:
      "Kompakte Tischformate lassen sich komfortabel handhaben und in Blockstellungen gut kombinieren. Konkrete Maße stimmen wir mit Raum und Nutzung ab.",
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
      "Der Trapezklapptisch 310c basiert in Ausführung und Plattenkonstruktion weitgehend auf dem Modell 310c und erweitert dessen Möglichkeiten um eine besonders variable Stellform. Die Trapezvariante eröffnet eine große Vielfalt an Aufstellungen für Unterricht, Gruppenarbeit oder Veranstaltungen.",
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
      "Gestellausführung wird projektbezogen abgestimmt",
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
    image: asset("/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp"),
    imageAlt: "Rechteckiger Klapptisch mit heller Tischplatte und Metallkufen",
    shortDescription:
      "Funktionaler Seminartisch für Unterricht, Besprechung und Schulung.",
    description:
      "Der Seminar-Klapptisch ist eine bewusst reduzierte Lösung für Seminar- und Besprechungsräume. Ausführung und Eignung werden passend zur geplanten Nutzung beraten.",
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
      "Kanten- und Plattenausführung werden projektbezogen abgestimmt",
      "Klappgestell passend zur geplanten Nutzung",
      "für geordnete Reihen, U-Formen und Blockstellungen geeignet",
    ],
  },
  {
    title: "Bistrotisch",
    slug: "bistrotisch",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset("/images/curated/Tische/Klapptisch_Stapeltisch_steh3erB_02.webp"),
    imageAlt: "Drei runde Bistrotische mit Säulengestell",
    shortDescription:
      "Kompakte Tischlösung für Cafébereiche, Begegnungszonen und Stehempfänge.",
    description:
      "Der Bistrotisch schafft kommunikative Nebenflächen in Foyers, Gemeindecafés und Aufenthaltsbereichen. Verfügbare Ausführungen und Maße klären wir in der Beratung.",
    highlights: [
      "kompakte Lösung für offene Begegnungsbereiche",
      "Säulengestell mit rundem Standfuß",
      "Ausführung und Oberfläche werden projektbezogen abgestimmt",
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
      "Der Tischtransportwagen unterstützt geordnete Abläufe bei Lagerung und Saalumbauten. Passende Abmessungen werden anhand der verwendeten Tische und Transportwege geplant.",
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
      "Der Stuhltransportwagen erleichtert das Bewegen größerer Bestandsmengen. Die Eignung wird anhand von Stuhltyp, Gestell und Transportweg geprüft.",
    highlights: [
      "Eignung wird anhand des vorhandenen Stuhltyps geprüft",
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
    image: asset("/images/curated/Zubehör/zubehör-filzgleiter.webp"),
    imageAlt: "Filzgleiter für ein Stuhlgestell",
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
      "Form und Schaftlänge werden am Bestand geprüft",
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
      "Verbindungslösung für geordnete Reihenbestuhlung, deren Eignung am vorhandenen Stuhl geprüft wird.",
    description:
      "Der Reihenverbinder kann für Stahlrohrstühle ohne serienmäßige Reihenverbindung geprüft werden. Entscheidend sind Gestellform und Abmessungen des vorhandenen Bestands.",
    highlights: [
      "Eignung für vorhandene Stühle wird individuell geprüft",
      "bewährte Lösung für geordnete Reihenbestuhlung",
      "stabil genug für den regelmäßigen Einsatz",
    ],
    suitableFor: [
      "Kirchen",
      "Säle",
      "Konferenzen",
      "Veranstaltungsräume",
    ],
    details: [
      "Eignung abhängig von Gestellform und Durchmesser",
      "Anzahl und Position werden anhand der Bestuhlung geklärt",
      "gewünschter Stuhlabstand wird bei der Auswahl berücksichtigt",
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
    image: asset("/images/curated/Tische/Stapeltischgestelle-rund-und-vierkant.webp"),
    imageAlt: "Runde und vierkantige Tischfüße als Gestellteile",
    overviewGroup: "table-accessories",
    shortDescription: "Tischfüße, Gestellteile und passende Kleinteile für vorhandene Ausstattung.",
    description: "Für Tischgestelle lassen sich Füße, Stopfen und weitere Bauteile häufig gezielt anfragen. Die Zuordnung erfolgt anhand des vollständigen Tisches, des Einbauorts und der vorhandenen Maße.",
    highlights: ["Gestellbereich im Zusammenhang sichtbar", "Zuordnung anhand von Form, Fotos und Maßen"],
    suitableFor: ["Klapptische", "Bestandspflege", "Instandsetzung"],
    details: ["Gestellform und Einbauort dokumentieren", "Maße und vorhandene Produktangaben mitsenden"],
  },
  {
    title: "Ersatzteile und Kleinteile",
    slug: "ersatzteile-kleinteile",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/images/curated/Zubehör/zubehör-stopfen.webp"),
    imageAlt: "Kunststoffstopfen für ein Metallrohrgestell",
    overviewGroup: "spares",
    shortDescription: "Verschleißteile und kleine Ergänzungen anhand des vorhandenen Produkts zuordnen lassen.",
    description: "Viele Verschleißteile können ersetzt werden. Senden Sie uns dafür Fotos des vollständigen Produkts und des benötigten Teils sowie Maße, Modellangaben, ungefähres Kaufjahr und Stückzahl.",
    highlights: ["persönliche Zuordnung statt pauschaler Kompatibilität", "Fotos und Maße erleichtern die Auswahl"],
    suitableFor: ["Nachbestellung", "Werterhalt", "Bestandspflege"],
    details: ["Foto des vollständigen Stuhls oder Tisches", "Foto und Maße des defekten oder fehlenden Teils", "Modellbezeichnung, Kaufjahr und Stückzahl soweit bekannt"],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categoryId: ProductCategoryId) {
  return products.filter((product) => product.categoryId === categoryId);
}

