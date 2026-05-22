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
    image: asset("/pictures/Produkte/Stühle/1021c-01.jpg"),
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
      "Auf der Originalseite wird die Bedeutung hochwertiger Gestelle und sauber verarbeiteter Sitzschalen besonders hervorgehoben. Gerade bei häufig genutzten Bestuhlungen zahlt sich diese Qualität langfristig aus.",
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
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stahlrohr_Kunststoffschale_1010ir_02.jpg",
    ),
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
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stahlrohr_Kunststoffschale_1010a_02.jpg",
    ),
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
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stahlrohr_Kunststoffschale_1010b_02.jpg",
    ),
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
    image: asset("/pictures/Produkte/Stühle/1021c-06.jpg"),
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
      "schnell verfügbar bei Sonderbelegung",
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
    image: asset("/pictures/Produkte/Tische/Klapptisch_Stapeltisch_t310ccolor_02.jpg"),
    shortDescription:
      "Bewährter Klapptisch für Bewirtung, Gruppenarbeit und vielseitige Veranstaltungsflächen.",
    description:
      "Der Klapptisch 310c ist laut Originalseite seit Jahrzehnten ein bewährtes Modell mit einem sehr starken Preis-Leistungs-Verhältnis. Funktion und Design haben sich in Vereinsheimen, Seminarräumen, Kirchen, Gemeinden sowie in Sport- und Stadthallen durchgesetzt. Die Tische stammen aus deutscher Fertigung und sind auf dauerhafte Nutzung ausgelegt.",
    highlights: [
      "bewährte Konstruktion für langjährigen Einsatz",
      "Platten mit HPL-Oberfläche für robuste Alltagsnutzung",
      "schnell auf- und abgebaut bei häufigen Umstellungen",
    ],
    suitableFor: [
      "Vereinsheime",
      "Seminarräume",
      "Kirchen und Gemeinden",
      "Sport- und Stadthallen",
    ],
    details: [
      "ausschließlich Komponenten aus deutscher Fertigung",
      "HPL-Oberflächen sind besonders widerstandsfähig gegen Kratzer, Abrieb und Stöße",
      "echte Holzkanten sorgen für Langlebigkeit, saubere Optik und robuste Kantenqualität",
    ],
    variants: [
      "in verschiedenen Tischmaßen planbar",
      "Gestellvarianten K1 bis K4 je nach Aufstellungsart",
      "für Reihenaufstellungen und Einzelaufstellungen passend auswählbar",
    ],
    note:
      "Auf der Informationsseite empfiehlt Dalemans besonders kompakte Maße wie 140 x 70 cm, weil sie sich komfortabel handhaben und in Blockstellungen sehr gut kombinieren lassen.",
  },
  {
    title: "Trapezklapptisch 310c",
    slug: "trapezklapptisch-310c",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset(
      "/pictures/Produkte/Tische/Trapezklapptisch_Klapptische_trapez_klappbar.jpg",
    ),
    shortDescription:
      "Variable Tischform für Halbkreise, Gruppeninseln und kommunikative Raumlayouts.",
    description:
      "Der Trapezklapptisch 310c basiert in Ausführung und Plattenkonstruktion weitgehend auf dem Modell 310c und erweitert dessen Möglichkeiten um eine besonders variable Stellform. Die Trapezvariante eröffnet eine große Vielfalt an Aufstellungen für Unterricht, Gruppenarbeit oder Veranstaltungen.",
    highlights: [
      "sehr vielseitige Stellmöglichkeiten",
      "gut für kommunikative und flexible Raumkonzepte",
      "eine besondere Dalemans-Lösung auch mit Klappgestell realisierbar",
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
      "auf Wunsch auch mit Klappgestell ohne seitlich hervorstehende Gestellteile",
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
    image: asset("/pictures/Produkte/Tische/CompTischRef_0819_anonym.jpg"),
    shortDescription:
      "Funktionaler Seminartisch für Unterricht, Besprechung und Schulung.",
    description:
      "Der Seminar-Klapptisch ist laut Originalseite ein seit langem bewährter Kompromiss aus Funktion, Preis und einfacher Konstruktion. Das Design beschränkt sich bewusst auf das Nötigste, um eine wirtschaftliche und dennoch stabile Lösung für Seminar- und Besprechungsräume zu bieten.",
    highlights: [
      "preislich attraktive Lösung für Seminarbereiche",
      "identisches Klappgestell wie beim Modell 310c",
      "ideal für Räume mit wiederkehrender Schulungsnutzung",
    ],
    suitableFor: [
      "Seminarräume",
      "Hotels",
      "Unterricht",
      "Besprechungen",
    ],
    details: [
      "der aufwendige Umleimer entfällt zugunsten eines günstigen Preises",
      "robustes Klappgestell aus dem bewährten 310c-Programm",
      "für geordnete Reihen, U-Formen und Blockstellungen geeignet",
    ],
  },
  {
    title: "Bistrotisch",
    slug: "bistrotisch",
    categoryId: "klapptische",
    categoryName: "Klapptische",
    image: asset("/pictures/Produkte/Tische/Klapptisch.png"),
    shortDescription:
      "Kompakte Tischlösung für Cafébereiche, Begegnungszonen und Stehempfänge.",
    description:
      "Der Bistrotisch schafft kommunikative Nebenflächen in Foyers, Gemeindecafés und Aufenthaltsbereichen. Laut Originalseite sind Steh- und Bistrotische in Höhen von 74 cm und 111 cm erhältlich und für eine solide, standfeste Nutzung ausgelegt.",
    highlights: [
      "kompakte Lösung für offene Begegnungsbereiche",
      "massive Standsäule und stabiler Fuß für hohe Standfestigkeit",
      "Dekore passend zum Klapptischprogramm wählbar",
    ],
    suitableFor: [
      "Foyers",
      "Gemeindecafés",
      "Stehempfänge",
      "Bistrobereiche",
    ],
    details: [
      "80-mm-Standsäule und 8-mm-Fuß aus massivem Stahl, gepulvert",
      "Tischplatte standardmäßig in Holz mit 25 oder 28 mm Stärke",
      "Umleimer in verschiedenen Dekoren und Farben möglich",
    ],
    variants: [
      "Höhen 74 cm und 111 cm",
      "Oberflächendekore aus dem Klapptischprogramm",
      "Sonderlösungen zum Beispiel in Alu-Riffelblech oder Metall",
    ],
  },
  {
    title: "Tischtransportwagen",
    slug: "tischtransportwagen",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/pictures/Produkte/Zubehör/Tischtransportwagen_02.jpg"),
    shortDescription:
      "Robuste Transporthilfe für Tische, passend auf das jeweilige Tischmaß abgestimmt.",
    description:
      "Der Tischtransportwagen ist laut Originalseite solide gebaut und für das Gewicht von etwa zehn Tischen ausgelegt. Jeder Wagen wird passend zur jeweiligen Tischgröße gefertigt und unterstützt sichere, materialschonende Abläufe bei Lagerung und Saalumbauten.",
    highlights: [
      "für das Gewicht von etwa zehn Tischen ausgelegt",
      "passend zur Tischgröße gefertigt",
      "solide Lösung für den innerbetrieblichen Transport",
    ],
    suitableFor: [
      "Lager",
      "Hausmeisterteams",
      "Saalumbauten",
      "Veranstaltungslogistik",
    ],
    details: [
      "Rohspan-Auflageplatte umlaufend etwa 1 cm größer als das Tischmaß",
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
    image: asset("/pictures/Produkte/Zubehör/Stapelstuhl_Stuhltransportwagen_02.jpg"),
    shortDescription:
      "Durchdachte Transportlösung für Stühle verschiedener Bauarten und Gestellbreiten.",
    description:
      "Der Stuhltransportwagen erleichtert das Bewegen größerer Bestandsmengen deutlich. Auf der Originalseite wird er als solide und durchdachte Konstruktion beschrieben, die sich für praktisch jeden Stuhltyp bis zu einer Gestellbreite von 60 cm eignet.",
    highlights: [
      "für viele Stuhltypen bis 60 cm Gestellbreite geeignet",
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
    image: asset("/pictures/Über uns/Zubehor-04.jpg"),
    shortDescription:
      "Bodenschonende Kunststoffgleiter für Stahlrohrstühle wie Mod. 1021 und ähnliche Modelle.",
    description:
      "Die Stuhlgleiter sind auf bodenschonende Nutzung und eine optimale Kraftverteilung ausgelegt. Laut Originalseite sorgt die Abschrägung für eine möglichst vollflächige Auflage auf dem Boden und damit für einen besseren Schutz empfindlicher Flächen.",
    highlights: [
      "besonders bodenschonend durch abgeschrägte Form",
      "optimale Kraftverteilung auf eine größere Auflagefläche",
      "geeignet für Stahlrohrstühle Mod. 1021 und ähnliche Modelle",
    ],
    suitableFor: [
      "Holzböden",
      "Gemeindesäle",
      "Mehrzweckräume",
      "empfindliche Bodenflächen",
    ],
    details: [
      "für Rohrdurchmesser 20 mm beschrieben",
      "Standfußhöhe etwa 10 mm",
      "Schaftlänge etwa 19 mm, Schräge ca. 12 bis 15 Grad",
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
    image: asset("/pictures/Über uns/Zubehor-11.jpg"),
    shortDescription:
      "Nachrüstlösung für geordnete und stabile Reihenbestuhlung mit vorhandenen Stahlrohrstühlen.",
    description:
      "Der Reihenverbinder ist für Stahlrohrstühle mit 20 bis 25 mm Gestelldurchmesser gedacht, wenn keine serienmäßige Reihenverbindung vorhanden ist. Damit lassen sich vorhandene Bestände zuverlässig für Gottesdienste, Vorträge und Veranstaltungen in Reihen organisieren.",
    highlights: [
      "zur Nachrüstung bestehender Stahlrohrstühle geeignet",
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
      "für Gestelldurchmesser von 20 bis 25 mm vorgesehen",
      "idealerweise zwei Verbinder pro Stuhlpaar, vorne und hinten",
      "zwischen den Stühlen entsteht ein Abstand von etwa 4 bis 12 cm",
    ],
    note:
      "Auf der Originalseite wird diese Lösung ausdrücklich als bewährt und stabil beschrieben, besonders für vorhandene Bestände ohne serienmäßige Reihenverbindung.",
  },
  {
    title: "Buchablage",
    slug: "buchablage",
    categoryId: "transportwagen-zubehoer",
    categoryName: "Transportwagen & Zubehör",
    image: asset("/pictures/Über uns/Zubehor-06.jpg"),
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
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categoryId: ProductCategoryId) {
  return products.filter((product) => product.categoryId === categoryId);
}

