export interface GalleryImage {
  src: string;
  alt: string;
}

export interface GalleryGroup {
  title: string;
  text: string;
  images: GalleryImage[];
}

export interface ProductOverviewCard {
  title: string;
  category: string;
  text: string;
  image: GalleryImage;
  href: string;
  featured?: boolean;
}

const media = (folder: string, file: string, alt: string): GalleryImage => ({
  src: encodeURI(`/images/curated/${folder}/${file.replace(/\.png$/i, ".webp")}`),
  alt,
});

export const productOverviewHero = media(
  "Stapelstühle",
  "Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.png",
  "Mehrere gepolsterte Stapelstühle mit Stahlrohrgestell",
);

export const productOverviewCategories: ProductOverviewCard[] = [
  { title: "Stapelstühle", category: "Kernsortiment", text: "Für Räume, die regelmäßig neu bestuhlt, umgebaut und geordnet gelagert werden.", image: media("Stapelstühle", "1021.png", "Gepolsterter Stapelstuhl mit schwarzem Stahlrohrgestell"), href: "/produkte/kategorien/stapelstuehle", featured: true },
  { title: "Klapptische", category: "Kernsortiment", text: "Flexible Tischflächen für wechselnde Raumaufteilungen und Nutzungen.", image: media("Tische", "Klapptisch_Stapeltisch_t310ccolor_02.png", "Klappbarer Tisch mit heller Tischplatte"), href: "/produkte/kategorien/klapptische", featured: true },
  { title: "Zubehör", category: "Ergänzungen", text: "Buchablagen, Reihenverbinder und weitere Ergänzungen passend zum Produkt prüfen.", image: media("Zubehör", "zubehör-buchablage-an-stuhl.png", "Buchablage unter einem gepolsterten Stapelstuhl"), href: "/produkte/kategorien/transportwagen-zubehoer" },
  { title: "Transport & Lagerung", category: "Abläufe", text: "Wagen für verständliche Wege zwischen Raumnutzung, Umbau und Lager.", image: media("Zubehör", "Stapelstuhl_Stuhltransportwagen_02.png", "Stuhltransportwagen mit gestapelten Stühlen"), href: "/produkte/kategorien/transportwagen-zubehoer" },
  { title: "Sonderlösungen", category: "Individuelle Planung", text: "Besondere Tischformen und Konstruktionen für Anforderungen abseits des Standards.", image: media("Sonderlösungen", "runder-tisch.png", "Runder Tisch als individuelle Sonderlösung"), href: "/sonderloesungen" },
  { title: "Sonderposten", category: "Wechselnde Beispiele", text: "Einblicke in mögliche Einzelstücke und Restbestände – ohne Verfügbarkeitszusage.", image: media("Sonderposten", "kunstoffschalenstuhl-restposten.png", "Kunststoffschalenstuhl als Beispiel für mögliche Sonderposten"), href: "/sonderposten" },
];

export const productOverviewSolutions: ProductOverviewCard[] = [
  { title: "Gepolsterter Stapelstuhl", category: "Stapelstühle", text: "Eine gepolsterte Ausführung für flexible Reihen- und Flächenbestuhlung.", image: media("Stapelstühle", "Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.png", "Mehrere gepolsterte Stapelstühle mit blauem Bezug"), href: "/produkte/kategorien/stapelstuehle" },
  { title: "Holzschalen-Stapelstuhl", category: "Stapelstühle", text: "Eine klar unterscheidbare Sitzlösung mit Holzschale und Sitzpolster.", image: media("Stapelstühle", "1021c.png", "Holzschalen-Stapelstuhl mit Sitzpolster"), href: "/produkte/kategorien/stapelstuehle" },
  { title: "Klapptisch für Mehrzweckräume", category: "Klapptische", text: "Ein vollständiger Tisch für wechselnde Aufstellungen im Raum.", image: media("Tische", "Klapptisch_Stapeltisch_t310ccolor_02.png", "Klappbarer Tisch mit heller Tischplatte und Metallgestell"), href: "/produkte/kategorien/klapptische" },
  { title: "Stuhltransportwagen", category: "Transport & Lagerung", text: "Eine Transportlösung mit klar erkennbarem Einsatzzweck.", image: media("Zubehör", "Stapelstuhl_Stuhltransportwagen_02.png", "Stuhltransportwagen mit gestapelten Holzschalenstühlen"), href: "/produkte/stuhltransportwagen" },
  { title: "Buchablage für Stapelstühle", category: "Zubehör", text: "Eine Ablage im eingebauten Zustand; die Eignung wird produktbezogen geprüft.", image: media("Zubehör", "zubehör-buchablage-an-stuhl.png", "Buchablage unter einem gepolsterten Stapelstuhl"), href: "/produkte/buchablage" },
  { title: "Individuelle Tischlösung", category: "Sonderlösungen", text: "Eine besondere Tischform als Beispiel für projektbezogene Planung.", image: media("Sonderlösungen", "runder-tisch.png", "Runder Tisch als individuelle Sonderlösung"), href: "/sonderloesungen" },
];

export const chairGroups: GalleryGroup[] = [
  {
    title: "Formen und Ausführungen",
    text: "Unterschiedliche Sitzschalen, Polsterungen, Rückenformen und Gestelle geben einen Eindruck der möglichen gestalterischen Bandbreite. Die konkrete Ausführung wird modellbezogen abgestimmt.",
    images: [
      media("Stapelstühle", "1021.png", "Gepolsterter Stapelstuhl mit schwarzem Metallgestell"),
      media("Stapelstühle", "1021_armlehne.png", "Gepolsterter Stapelstuhl mit Armlehnen"),
      media("Stapelstühle", "1021a.png", "Stapelstuhl mit Holzrücken und Sitzpolster"),
      media("Stapelstühle", "1021b.png", "Gepolsterter Stapelstuhl mit geschlossenem Rücken"),
      media("Stapelstühle", "1021c.png", "Stapelstuhl mit Polstersitz und Grifföffnung"),
      media("Stapelstühle", "1021c03.png", "Holzstuhl mit perforierter Rückenlehne"),
      media("Stapelstühle", "beschihtet-gepolstert-eckiges-griffloch.png", "Gepolsterter Stuhl mit eckiger Grifföffnung"),
    ],
  },
  {
    title: "Holz, Polster und Rückenlehnen",
    text: "Detailansichten machen Materialkombinationen, Grifföffnungen und die Verarbeitung von Sitz und Rücken vergleichbar.",
    images: [
      media("Stapelstühle", "1021-holzgestell-2.png", "Stuhl mit Holzgestell in einer weiteren Ausführung"),
      media("Stapelstühle", "1021-holzgestell-2-detail.png", "Detail von Holzgestell und Polsterung eines Stuhls"),
      media("Stapelstühle", "lederbezug.png", "Stapelstuhl mit glattem dunklem Bezug"),
      media("Stapelstühle", "ovales-griffloch.png", "Stuhlrücken mit ovaler Grifföffnung"),
      media("Stapelstühle", "mehrere-löcher.png", "Stuhlrücken mit mehreren runden Öffnungen"),
    ],
  },
  {
    title: "Farbliche Wirkung und Reihenbildung",
    text: "Farbe verändert die Wirkung im Raum; Verbinder unterstützen eine geordnete Aufstellung. Eignung und Kombination prüfen wir am jeweiligen Modell.",
    images: [
      media("Stapelstühle", "lila-stuhl.png", "Stapelstuhl mit lilafarbener Sitzschale"),
      media("Stapelstühle", "mit beschichtung-sortiment.png", "Mehrere Stühle mit unterschiedlichen beschichteten Sitzschalen"),
      media("Stapelstühle", "stuhlverbinder.png", "Reihenverbinder an zwei nebeneinanderstehenden Stühlen"),
      media("Stapelstühle", "stuhlverbinder1.png", "Detail einer Verbindung zwischen zwei Stuhlgestellen"),
      media("Stapelstühle", "Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.png", "Mehrere platzsparend gestapelte Stühle"),
    ],
  },
];

export const materialImages: GalleryImage[] = [
  media("Stoffe-Farben", "Textilproben.png", "Mehrere Stoffmuster in unterschiedlichen Farbtönen"),
  media("Stoffe-Farben", "beize-varianten.png", "Holzbeizen in unterschiedlichen Farbtönen"),
  media("Stoffe-Farben", "holz-varianten.png", "Mehrere Holzoberflächen zur Bemusterung"),
  media("Stoffe-Farben", "Singer-Nähmaschine.png", "Nähmaschine bei der Verarbeitung eines Bezugsstoffs"),
];

export const tableGroups: GalleryGroup[] = [
  {
    title: "Tischformen für wechselnde Raumkonzepte",
    text: "Rechteckige, trapezförmige und kompakte Tischlösungen unterstützen unterschiedliche Aufstellungen. Welche Formen verfügbar und kombinierbar sind, klären wir projektbezogen.",
    images: [
      media("Tische", "Klapptisch_Stapeltisch_t310ccolor_02.png", "Rechteckiger Klapptisch mit Metallgestell"),
      media("Tische", "Klapptisch_Stapeltisch_steh3erB_02.png", "Mehrere zusammen aufgestellte Klapptische"),
      media("Tische", "Trapezklapptisch_Klapptische_trapez_klappbar.png", "Trapezförmiger Klapptisch"),
      media("Tische", "T210cdetail.png", "Detailansicht einer Tischplatte und ihres Gestells"),
    ],
  },
  {
    title: "Gestelle, Füße und Klappmechanik",
    text: "Die technische Ausführung beeinflusst Standfestigkeit, Handhabung und Lagerung. Die Bilder zeigen unterschiedliche Konstruktionsprinzipien ohne pauschale Verfügbarkeitszusage.",
    images: [
      media("Tische", "Klapptischgestell-ModNr.K10.png", "Klappbares Tischgestell aus Metall"),
      media("Tische", "Mod.Nr.K2kufe30x30.png", "Tischgestell mit rechteckigen Metallkufen"),
      media("Tische", "Stapeltischgestelle-rund-und-vierkant.png", "Runde und vierkantige Tischgestelle im Vergleich"),
    ],
  },
];

export const accessoryGroups: GalleryGroup[] = [
  { title: "Buchablagen", text: "Ablagen am Stuhl und als Detailansicht; die passende Befestigung wird am vorhandenen Gestell geprüft.", images: [
    media("Zubehör", "zubehör-buchablage-an-stuhl.png", "Buchablage unter der Sitzfläche eines Stapelstuhls"),
    media("Zubehör", "zubehör-buchablage.png", "Buchablage als einzelnes Zubehörteil"),
  ] },
  { title: "Reihenverbinder", text: "Verbinder können Stühle zu geordneten Reihen zusammenführen. Maße und Gestellform entscheiden über die Eignung.", images: [
    media("Zubehör", "reihenverbinder-kunststoff.png", "Kunststoff-Reihenverbinder für Stuhlgestelle"),
    media("Zubehör", "zubehör-14.png", "Detail eines Verbinders an einem Stuhlgestell"),
  ] },
  { title: "Schreibtablare", text: "Montierte Ansichten und technische Details zeigen, wie eine Schreibfläche am Stuhl genutzt werden kann.", images: [
    media("Zubehör", "schreibtablart-mit-stuhl-vorne.png", "Stuhl mit montiertem Schreibtablar von vorne"),
    media("Zubehör", "schreibtablart-mit-stuhl-seite.png", "Stuhl mit montiertem Schreibtablar von der Seite"),
    media("Zubehör", "schreibtablart.png", "Schreibtablar als einzelnes Zubehörteil"),
  ] },
  { title: "Gleiter und Gestellstopfen", text: "Die Gesamt- und Detailansichten erleichtern die Zuordnung. Filz- und Kunststoffteile werden passend zu Boden, Rohrform und Abmessung ausgewählt.", images: [
    media("Zubehör", "zubehör-filzgleiter.png", "Filzgleiter für ein Stuhlgestell"),
    media("Zubehör", "gummistopfen-schwarz1.png", "Schwarzer Gestellstopfen montiert und als Einzelteil"),
    media("Zubehör", "gummistopfen-weiß.png", "Weiße Kunststoffstopfen für Metallrohre"),
  ] },
  { title: "Transportwagen", text: "Wagen für Stühle und Tische unterstützen kurze Wege zwischen Nutzung, Umbau und Lager.", images: [
    media("Zubehör", "Stapelstuhl_Stuhltransportwagen_02.png", "Gestapelte Stühle auf einem Stuhltransportwagen"),
    media("Zubehör", "Tischtransportwagen_02.png", "Tische auf einem Tischtransportwagen"),
  ] },
];
