export interface GalleryImage {
  src: string;
  alt: string;
}

export interface GalleryGroup {
  title: string;
  text: string;
  images: GalleryImage[];
}

const media = (folder: string, file: string, alt: string): GalleryImage => ({
  src: encodeURI(`/neue bilder/${folder}/${file}`),
  alt,
});

export const chairGroups: GalleryGroup[] = [
  {
    title: "Formen und Ausführungen",
    text: "Unterschiedliche Sitzschalen, Polsterungen, Rückenformen und Gestelle geben einen Eindruck der möglichen gestalterischen Bandbreite. Die konkrete Ausführung wird modellbezogen abgestimmt.",
    images: [
      media("Stapelstühle", "1021.png", "Gepolsterter Stapelstuhl mit schwarzem Metallgestell"),
      media("Stapelstühle", "1021_armlehne.png", "Gepolsterter Stapelstuhl mit Armlehnen"),
      media("Stapelstühle", "1021a.png", "Stapelstuhl mit Holzrücken und Sitzpolster"),
      media("Stapelstühle", "1021a_1.png", "Stapelstuhl mit geformter Holzrückenlehne"),
      media("Stapelstühle", "1021a_2.png", "Stapelstuhl mit Holzschale und Metallgestell"),
      media("Stapelstühle", "1021b.png", "Gepolsterter Stapelstuhl mit geschlossenem Rücken"),
      media("Stapelstühle", "1021c.png", "Stapelstuhl mit Polstersitz und Grifföffnung"),
      media("Stapelstühle", "1021c01.png", "Stapelstuhl mit abgerundeter Rückenlehne"),
      media("Stapelstühle", "1021c02.png", "Stapelstuhl mit farbigem Bezug und Stahlrohrgestell"),
      media("Stapelstühle", "1021c03.png", "Stapelstuhl in einer weiteren Polsterausführung"),
      media("Stapelstühle", "1021c04.png", "Stapelstuhl mit heller Polsterung"),
      media("Stapelstühle", "1021c05.png", "Stapelstuhl mit dunkler Polsterung"),
    ],
  },
  {
    title: "Holz, Polster und Rückenlehnen",
    text: "Detailansichten machen Materialkombinationen, Grifföffnungen und die Verarbeitung von Sitz und Rücken vergleichbar.",
    images: [
      media("Stapelstühle", "1021-holzgestell.png", "Stapelstuhl mit Holzgestell und gepolstertem Sitz"),
      media("Stapelstühle", "1021-holzgestell-2.png", "Stuhl mit Holzgestell in einer weiteren Ausführung"),
      media("Stapelstühle", "1021-holzgestell-2-detail.png", "Detail von Holzgestell und Polsterung eines Stuhls"),
      media("Stapelstühle", "holzgestell-detail.png", "Nahaufnahme der Verbindung an einem Holzstuhlgestell"),
      media("Stapelstühle", "lederbezug.png", "Stapelstuhl mit glattem dunklem Bezug"),
      media("Stapelstühle", "beschihtet-gepolstert-eckiges-griffloch.png", "Gepolsterter Stuhl mit eckiger Grifföffnung"),
      media("Stapelstühle", "ovales-griffloch.png", "Stuhlrücken mit ovaler Grifföffnung"),
      media("Stapelstühle", "mehrere-löcher.png", "Stuhlrücken mit mehreren runden Öffnungen"),
    ],
  },
  {
    title: "Farbliche Wirkung und Reihenbildung",
    text: "Farbe verändert die Wirkung im Raum; Verbinder unterstützen eine geordnete Aufstellung. Eignung und Kombination prüfen wir am jeweiligen Modell.",
    images: [
      media("Stapelstühle", "lila-stuhl.png", "Stapelstuhl mit lilafarbener Sitzschale"),
      media("Stapelstühle", "turkis-stuhl.png", "Stapelstuhl mit türkisfarbener Sitzschale"),
      media("Stapelstühle", "mit beschichtung.png", "Stapelstuhl mit beschichteter Sitzschale"),
      media("Stapelstühle", "mit beschichtung-sortiment.png", "Mehrere Stühle mit unterschiedlichen beschichteten Sitzschalen"),
      media("Stapelstühle", "stuhlverbinder.png", "Reihenverbinder an zwei nebeneinanderstehenden Stühlen"),
      media("Stapelstühle", "stuhlverbinder1.png", "Detail einer Verbindung zwischen zwei Stuhlgestellen"),
      media("Stapelstühle", "bünde.png", "Mehrere Stapelstühle in einer Reihe"),
      media("Stapelstühle", "Stapelstuhl_Stahlrohr_1021c_02.png", "Gepolsterter Stapelstuhl mit Stahlrohrgestell"),
    ],
  },
];

export const materialImages: GalleryImage[] = [
  media("Stoffe-Farben", "Textilproben.png", "Mehrere Stoffmuster in unterschiedlichen Farbtönen"),
  media("Stoffe-Farben", "beize-varianten.png", "Holzbeizen in unterschiedlichen Farbtönen"),
  media("Stoffe-Farben", "holz-varianten.png", "Mehrere Holzoberflächen zur Bemusterung"),
  media("Stoffe-Farben", "stuhl-farbverlauf.png", "Stühle in aufeinander abgestimmten Farbtönen"),
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
      media("Tische", "MOd. Nr.K3-füße30mm.png", "Tischgestell mit einzelnen Metallfüßen"),
      media("Tische", "Mod.Nr.K2kufe30x30.png", "Tischgestell mit rechteckigen Metallkufen"),
      media("Tische", "Stapeltischgestelle-rund-und-vierkant.png", "Runde und vierkantige Tischgestelle im Vergleich"),
      media("Tische", "zubehör-10.png", "Technisches Bauteil für ein Tischgestell"),
    ],
  },
];

export const accessoryGroups: GalleryGroup[] = [
  { title: "Buchablagen", text: "Ablagen am Stuhl und als Detailansicht; die passende Befestigung wird am vorhandenen Gestell geprüft.", images: [
    media("Zubehör", "zubehör-buchablage-an-stuhl.png", "Buchablage unter der Sitzfläche eines Stapelstuhls"),
    media("Zubehör", "zubehör-buchablage.png", "Buchablage als einzelnes Zubehörteil"),
    media("Zubehör", "zubehör-06.png", "Montierte Buchablage an einem Stuhlgestell"),
  ] },
  { title: "Reihenverbinder", text: "Verbinder können Stühle zu geordneten Reihen zusammenführen. Maße und Gestellform entscheiden über die Eignung.", images: [
    media("Zubehör", "reihenverbinder-kunststoff.png", "Kunststoff-Reihenverbinder für Stuhlgestelle"),
    media("Zubehör", "zubehör-14.png", "Detail eines Verbinders an einem Stuhlgestell"),
  ] },
  { title: "Schreibtablare", text: "Montierte Ansichten und technische Details zeigen, wie eine Schreibfläche am Stuhl genutzt werden kann.", images: [
    media("Zubehör", "schreibtablart-mit-stuhl-vorne.png", "Stuhl mit montiertem Schreibtablar von vorne"),
    media("Zubehör", "schreibtablart-mit-stuhl-seite.png", "Stuhl mit montiertem Schreibtablar von der Seite"),
    media("Zubehör", "schreibtablart.png", "Schreibtablar als einzelnes Zubehörteil"),
    media("Zubehör", "schreibtablart-von-unten.png", "Befestigung eines Schreibtablars von unten"),
  ] },
  { title: "Gleiter", text: "Filz- und Kunststoffgleiter werden passend zu Boden, Rohrform und Abmessung ausgewählt.", images: [
    media("Zubehör", "zubehör-filzgleiter.png", "Filzgleiter für ein Stuhlgestell"),
    media("Zubehör", "gummistopfen-schwarz1.png", "Schwarzer Ersatzgleiter für ein Stuhlgestell"),
  ] },
  { title: "Stopfen und Kleinteile", text: "Kleine Ersatzteile helfen, vorhandene Gestelle weiter zuverlässig zu nutzen. Die Zuordnung erfolgt anhand eines Musters oder der Maße.", images: [
    media("Zubehör", "gummistopfen-schwarz.png", "Schwarze Kunststoffstopfen für Metallrohre"),
    media("Zubehör", "gummistopfen-weiß.png", "Weiße Kunststoffstopfen für Metallrohre"),
    media("Zubehör", "zubehör-stopfen.png", "Schwarzer Gestellstopfen in Nahaufnahme"),
    media("Zubehör", "zubehör-stopfen-weiß.png", "Weißer Gestellstopfen in Nahaufnahme"),
  ] },
  { title: "Transportwagen", text: "Wagen für Stühle und Tische unterstützen kurze Wege zwischen Nutzung, Umbau und Lager.", images: [
    media("Zubehör", "Stapelstuhl_Stuhltransportwagen_02.png", "Gestapelte Stühle auf einem Stuhltransportwagen"),
    media("Zubehör", "Tischtransportwagen_02.png", "Tische auf einem Tischtransportwagen"),
  ] },
];
