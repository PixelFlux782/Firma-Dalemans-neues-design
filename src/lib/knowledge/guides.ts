import {
  dimensionLabel,
  estimatedValues,
  modelSpecific,
  recommendations,
  regulatory,
  standardTableDimensions,
} from "@/lib/knowledge/advisory-facts";
import type { GuideArticle } from "@/lib/knowledge/types";

const tableDimensionFacts = standardTableDimensions.map((dimension) => ({
  label: dimension.ratioTwoToOne ? "2:1-Maß" : "Standardmaß",
  value: dimensionLabel(dimension),
  note: dimension.ratioTwoToOne ? `2 × ${dimension.width} cm = ${dimension.length} cm` : undefined,
}));

export const guideArticles = [
  {
    slug: "stapelstuehle-richtig-auswaehlen",
    title: "Stapelstühle passend zu Raum und Nutzung auswählen",
    description: "Praxisnahe Auswahlhilfe zu Sitzkomfort, Polsterung, Reihenverbindung, häufigem Umstellen und langlebiger Verarbeitung.",
    category: "Stapelstühle", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "raum-und-nutzung", heading: "Mit Raum und Nutzung beginnen", paragraphs: [
        "Entscheidend ist nicht nur die Form eines Stuhls: Wie oft wird umgebaut, wie lange sitzen die Menschen, wie wird gelagert und braucht die Aufstellung regelmäßig Reihen? Die aktuellen Dalemans-Modelle sind nach Firmenauskunft für regelmäßiges Umstellen gedacht; Details wie Stapelung und Ausstattung bleiben modellabhängig.",
        `Als überlieferte Orientierung können etwa ${estimatedValues.chairWidthCm.withoutRowConnector} cm ohne und etwa ${estimatedValues.chairWidthCm.withRowConnector} cm mit Reihenverbinder angesetzt werden. Das sind keine geprüften Breiten jedes Modells; besondere Ausführungen können abweichen.`,
      ] },
      { id: "sitzkomfort", heading: "Sitzkomfort persönlich prüfen", paragraphs: [
        "Für längere Veranstaltungen sind Sitz- und Rückenpolster häufig sinnvoll. Komfort ist dennoch individuell: Schalenform, Körpergröße, Sitzdauer und Bezug wirken zusammen.",
        "Bei einer größeren Anschaffung empfiehlt Dalemans deshalb einen Musterstuhl. Er lässt sich im eigenen Raum, mit der geplanten Polsterung und von unterschiedlichen Personen erproben.",
      ] },
      { id: "starke-nutzung", heading: "Bei starker Nutzung Konstruktion und Schalenform ansehen", paragraphs: [
        `Für stark beanspruchte Räume empfiehlt Dalemans häufig weniger stark taillierte Schalen, etwa die Modelle ${modelSpecific.heavyUseChairExamples.map((model) => model.label).join(" und ")}. Das ist eine Beratungsempfehlung, keine Aussage, dass andere Modelle ungeeignet wären.`,
        "Bei Schichtholzschalen zählt eine sorgfältige Verleimung der Furnierlagen. Ebenso wichtig sind eine sauber verarbeitete Gestellkonstruktion sowie eine passende Beschichtung oder Verchromung. Mängel an diesen Stellen können Delamination, Brüche oder Korrosion begünstigen; pauschale Ausfall- oder Haltbarkeitsversprechen wären trotzdem unseriös.",
      ] },
      { id: "langfristig-planen", heading: "Reihenverbindung und Ersatzteile früh mitdenken", paragraphs: [
        "Bei Reihenbestuhlung sollte eine passende Reihenverbindung bereits bei der Modellauswahl berücksichtigt werden. Auch austauschbare Stuhlgleiter und nachrüstbare Buchablagen können helfen, eine vorhandene Bestuhlung weiter zu nutzen.",
        "Dalemans begleitet Bestuhlungen, die über Jahrzehnte genutzt werden. Diese Erfahrung ist weder eine Lebensdauergarantie noch ein Mindestwert; Modell, Beanspruchung, Pflege und Reparaturen bestimmen den tatsächlichen Verlauf.",
      ] },
    ],
    faq: [
      { question: "Sind gepolsterte Stühle immer bequemer?", answer: "Sitz- und Rückenpolster können bei längerem Sitzen sinnvoll sein. Das persönliche Sitzempfinden bleibt individuell; ein Musterstuhl hilft bei der Entscheidung." },
      { question: "Wie breit ist ein Stapelstuhl mit Reihenverbinder?", answer: "Etwa 53 cm sind ein überlieferter Orientierungswert, keine geprüfte Breite aller Modelle. Ohne Reihenverbinder werden etwa 51 cm genannt. Das konkrete Modell muss geprüft werden." },
      { question: "Sind Coburg und Nürnberg die einzigen Modelle für starke Nutzung?", answer: "Nein. Dalemans empfiehlt sie wegen ihrer weniger stark taillierten Schalen häufig für starke Nutzung. Auch andere aktuelle Modelle können für regelmäßiges Umstellen geeignet sein." },
    ],
    relatedLinks: [
      { href: "/produkte/stapelstuehle", label: "Stapelstuhlmodelle", description: "Aktuelle Modelle und verfügbare Ausführungen vergleichen." },
      ...modelSpecific.heavyUseChairExamples.map((model) => ({ href: model.href, label: `Modell ${model.label}`, description: "Das aktuelle Modell und seine belegten Ausführungen ansehen." })),
      { href: "/wissen/reihenverbinder-fuer-stapelstuehle", label: "Reihenverbinder planen", description: "Werksseitige und nachrüstbare Lösungen richtig einordnen." },
      { href: "/wissen/stoffe-und-bezuege", label: "Stoffe & Bezüge", description: "Polsterstoffe, Pflege und Nachweise auswählen." },
    ],
  },
  {
    slug: "reihenverbinder-fuer-stapelstuehle",
    title: "Reihenverbinder für Stapelstühle richtig einplanen",
    description: "Warum Dalemans Reihenverbinder bei Reihenbestuhlung empfiehlt und was bei Werksausführung, Nachrüstung und Bestuhlungsplan zählt.",
    category: "Stapelstühle", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "praxisnutzen", heading: "Ein ruhigeres Bild und klarere Reihen", paragraphs: [
        "Dalemans empfiehlt bei Reihenbestuhlung grundsätzlich eine passende Reihenverbindung. Sie führt Stühle innerhalb einer Reihe zusammen, unterstützt ein einheitliches Gesamtbild und hilft, die Lage der Reihen im Alltag beizubehalten.",
        "Bei einer geeigneten Ausführung kann das Umstellen kompletter Reihen zum Reinigen einfacher werden. Welche Handhabung zulässig ist, hängt jedoch vom Stuhl, Verbinder und Boden ab.",
      ] },
      { id: "ab-werk-oder-nachruesten", heading: "Passende Ausführung möglichst ab Werk wählen", paragraphs: [
        "Eine Reihenverbindung sollte möglichst bei der Auswahl des Stuhlmodells oder seiner Variante feststehen. Eine spätere Nachrüstung kann unpraktischer oder weniger wirtschaftlich sein und passt nicht automatisch zu jedem Gestell.",
        "Im Zubehör gibt es einen schwarzen, nachrüstbaren Clip. Seine Eignung muss anhand des vorhandenen Stuhlmodells und Gestells geprüft werden; eine allgemeine Kompatibilitätsfreigabe liegt derzeit nicht vor.",
      ] },
      { id: "anforderungen", heading: "Bestuhlungsplan und örtliche Anforderungen prüfen", paragraphs: [
        regulatory.rowConnectorRequirement,
        "Für Veranstaltungen sollte der genehmigte Bestuhlungsplan beziehungsweise die zuständige Fachplanung geprüft werden. Die Auswahl eines Verbinders ersetzt weder eine baurechtliche Bewertung noch eine Sicherheitsfreigabe für eine konkrete Aufstellung.",
      ] },
    ],
    faq: [
      { question: "Sind Reihenverbinder in jeder Kirche vorgeschrieben?", answer: "Nein, nicht pauschal. Nutzung, rechtliche Einordnung, örtliche Vorschriften und der genehmigte Bestuhlungsplan sind entscheidend." },
      { question: "Kann ich Reihenverbinder nachrüsten?", answer: "Für geeignete Bestände gibt es einen schwarzen Nachrüstclip. Die Passung muss am konkreten Stuhlmodell und Gestell geprüft werden." },
      { question: "Warum gleich bei der Bestellung mitplanen?", answer: "Eine zum Modell passende Lösung ist meist einfacher einzuordnen als eine spätere Nachrüstung. Zudem können Abstand, Gestell und Handhabung von Anfang an abgestimmt werden." },
    ],
    relatedLinks: [
      { href: "/produkte/reihenverbinder", label: "Reihenverbinder im Zubehör", description: "Vorhandene Ausführungen und Beratungsmöglichkeiten ansehen." },
      { href: "/produkte/stapelstuehle", label: "Stapelstühle", description: "Modelle mit ihren verfügbaren Ausstattungen vergleichen." },
      { href: "/raumplaner", label: "Raumplaner", description: "Eine mögliche Bestuhlung unverbindlich vorbereiten." },
    ],
  },
  {
    slug: "transport-lagerung-pflege",
    title: "Stapelstühle und Klapptische transportieren, lagern und pflegen",
    description: "Orientierungswerte für Stapel, sichere Lagerung, schonende Reinigung und den Erhalt durch Ersatzteile und Reparatur.",
    category: "Pflege & Lagerung", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "stapeln-und-transportieren", heading: "Stapelzahlen sind Orientierungswerte, keine Wagenfreigabe", paragraphs: [
        `Für übliche Stühle nennt Dalemans bis zu ca. ${estimatedValues.chairStackCount} Stück pro Stapel als Praxiswert. Bei Tischen gelten ca. ${estimatedValues.tableStackCount.storage} Stück im Lager und ca. ${estimatedValues.tableStackCount.suitableCart} Stück auf einem passenden Tischtransportwagen als Orientierung.`,
        "Daraus folgt keine pauschal sichere fahrbare Last. Modell, Eigengewicht, Wagen-Tragfähigkeit, Kipprisiko und Sicherung müssen zusammen geprüft werden. Transportwege sollten frei sein; Möbel nach den jeweiligen Herstellerhinweisen bewegen.",
      ], facts: [
        { label: "Stühle", value: `bis ca. ${estimatedValues.chairStackCount} je Stapel`, note: "Modell und Sicherung prüfen" },
        { label: "Tische im Lager", value: `ca. ${estimatedValues.tableStackCount.storage} je Stapel`, note: "flach liegend lagern" },
        { label: "Tische auf passendem Wagen", value: `ca. ${estimatedValues.tableStackCount.suitableCart}`, note: "Wagenlast und Modellfreigabe prüfen" },
      ] },
      { id: "lagern", heading: "Trocken, flach und vor dauerhafter Sonne geschützt lagern", paragraphs: [
        "Möbel trocken und bei normalen Innenraumtemperaturen lagern. Dauerhafte direkte UV-Strahlung vermeiden, weil sie Materialien und Farben verändern kann.",
        "Zusammengeklappte Tische flach liegend aufbewahren. Längeres Anlehnen an eine Wand kann Verformung begünstigen und ist deshalb keine geeignete Dauerlagerung.",
      ] },
      { id: "reinigen", heading: "Materialgerecht und sparsam mit Feuchtigkeit reinigen", paragraphs: [
        "Mit geeignetem Textil- oder Teppich-Trockenschaum erzielt Dalemans bei passenden Polsterstoffen gute Ergebnisse. Zuerst die Pflegehinweise prüfen, an einer unauffälligen Stelle testen und den Bezug nicht durchnässen.",
        "Tischplatten feucht, nicht nass wischen. Flüssigkeit nicht an Kanten oder Fugen stehen lassen und keine aggressiven Mittel ohne produktspezifische Freigabe verwenden.",
      ] },
      { id: "erhalten", heading: "Ersatzteil und Reparatur vor Neukauf prüfen", paragraphs: [
        "Verschlissene Stuhlgleiter lassen sich häufig ersetzen. Abhängig vom Modell können Buchablagen oder Reihenverbinder ergänzt werden. So kann eine vorhandene Ausstattung länger sinnvoll genutzt werden.",
        "Vor einer Nachrüstung sollten Modell, Montagebedingungen und die weitere Stapelbarkeit geprüft werden. Dalemans unterstützt bei der Zuordnung und bei Reparaturfragen.",
      ] },
    ],
    faq: [
      { question: "Wie viele Stühle kann ich stapeln?", answer: "Bis zu ca. 15 Stück sind ein betrieblicher Orientierungswert. Zulässig und sicher ist nur, was Modell, Wagen und Sicherung für den konkreten Einsatz erlauben." },
      { question: "Wie lagere ich Klapptische?", answer: "Trocken, bei normaler Innenraumtemperatur, vor dauerhafter direkter UV-Strahlung geschützt und flach liegend. Nicht längere Zeit an die Wand lehnen." },
      { question: "Kann ich Polster mit Trockenschaum reinigen?", answer: "Nur wenn der konkrete Stoff und sein Pflegehinweis dafür geeignet sind. Zuerst unauffällig testen und nicht durchnässen." },
    ],
    relatedLinks: [
      { href: "/produkte/kategorien/transportwagen-zubehoer", label: "Transport & Zubehör", description: "Wagen, Ersatzteile und Ergänzungen im Sortiment ansehen." },
      { href: "/produkte/gleiter-finder", label: "Gleiter finden", description: "Passende Ersatzgleiter anhand der Ausführung eingrenzen." },
      { href: "/kontakt?anliegen=Ersatzteile", label: "Ersatzteil anfragen", description: "Vorhandenes Modell und benötigtes Teil gemeinsam zuordnen." },
    ],
  },
  {
    slug: "stoffe-und-bezuege",
    title: "Bezugsstoffe für Stapelstühle: Worauf es wirklich ankommt",
    description: "Orientierung zu Stoffgruppen, Materialien, Martindale, Pflege und Brandschutznachweisen bei gepolsterten Stapelstühlen.",
    category: "Stoffe & Materialien", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "stoffgruppen", heading: "Stoffgruppen sind keine genormten Qualitätsklassen", paragraphs: [
        "Die Gruppen ordnen die verfügbaren Bezüge im Dalemans-Sortiment. Eine höhere Nummer bedeutet nicht automatisch, dass ein Stoff in jeder Hinsicht robuster oder für jeden Raum besser geeignet ist.",
        "Ab Gruppe 3 sind nach Dalemans-Erfahrung in der Regel Stoffoptionen mit passenden B1-Eigenschaften erhältlich. Das ist keine automatische Zertifizierung: Entscheidend sind Nachweis, Farbe und Variante des gewählten Stoffes.",
      ] },
      { id: "material-und-abrieb", heading: "Material, Gewicht und Martindale zusammen betrachten", paragraphs: [
        "Im Sortiment kommen unter anderem Dralon, Trevira, Polyester und Polyamid vor. Typische Orientierungen sind etwa 400 bis 700 Gramm je Laufmeter bei meist rund 1,30 Meter Rollenbreite sowie etwa 40.000 bis 100.000 Martindale-Scheuertouren. Kein Einzelwert gilt automatisch für jede Variante.",
        "Gewicht und Scheuertouren sind Vergleichswerte, aber keine Lebensdauergarantie. Faser, Webart, Verarbeitung, Licht, Pflege und die gesamte Polsterkonstruktion wirken zusammen.",
      ] },
      { id: "brandschutz", heading: "Stoffnachweis und kompletter Polsterstuhl sind nicht dasselbe", paragraphs: [
        "Ein B1-Nachweis für einen Bezugsstoff belegt nicht automatisch das Brandverhalten aus Bezug, Polsterung und Trägermaterial. Bei Brandschutzanforderungen muss die konkrete Stoffvariante und, soweit erforderlich, der Polsterverbund dokumentiert werden.",
        "Die Stoffgruppe allein ist deshalb kein Zertifikat und erzeugt kein B1-Siegel für den vollständigen Stuhl.",
      ] },
      { id: "pflege-und-muster", heading: "Pflegehinweise beachten und echte Muster ansehen", paragraphs: [
        "Bei geeigneten Stoffen hat Dalemans gute Erfahrungen mit Textil- oder Teppich-Trockenschaum. Herstellerhinweise gehen vor: zunächst unauffällig testen und den Bezug nicht durchnässen.",
        "Farben am Bildschirm sind nicht farbverbindlich. Für Farbe, Haptik und das Zusammenspiel im Raum ist ein echtes Stoffmuster die bessere Grundlage.",
      ] },
    ],
    faq: [
      { question: "Ist Stoffgruppe 3 automatisch B1?", answer: "Nein. In dieser Gruppe sind laut Dalemans in der Regel entsprechende Optionen erhältlich. Erforderlich ist der Nachweis für den konkreten Stoff; daraus folgt nicht automatisch ein Nachweis für den ganzen Stuhl." },
      { question: "Was bedeutet Martindale?", answer: "Martindale ist ein Prüfverfahren für Scheuerbeständigkeit. Der Wert hilft beim Vergleich, garantiert aber keine bestimmte Nutzungsdauer." },
      { question: "Kann ich Stoffmuster erhalten?", answer: "Ja. Dalemans stellt auf Anfrage Muster bereit. Sie zeigen Farbe und Haptik verlässlicher als ein unkalibrierter Bildschirm." },
    ],
    relatedLinks: [
      { href: "/wissen/stoffkarten", label: "Stoffkarten ansehen", description: "Status der Stoffgruppen 2, 3 und 4 prüfen." },
      { href: "/produkte/stapelstuehle", label: "Stapelstühle", description: "Modelle und Polstervarianten im Sortiment ansehen." },
      { href: "/wissen/transport-lagerung-pflege", label: "Pflege & Lagerung", description: "Polster und Möbel materialgerecht erhalten." },
    ],
  },
  {
    slug: "klapptische-richtig-waehlen",
    title: "Klapptische richtig wählen und im Raum planen",
    description: "Praxisnahe Orientierung zu zwölf Standardmaßen, 2:1-Prinzip, Gestellen, Platten und Sonderausführungen.",
    category: "Klapptische", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "nutzung", heading: "Mit Nutzung, Transport und Lagerung beginnen", paragraphs: [
        "Ein Klapptisch sollte zu Reihen, Gruppen- oder Blockstellungen, zu Transportwegen und Lagerfläche passen. Erst aus diesem Zusammenspiel ergeben sich Format, Platte und Gestell.",
        `Das Gewicht üblicher Ausführungen liegt nach Firmenangabe ungefähr zwischen ${estimatedValues.tableWeightKg.min} und ${estimatedValues.tableWeightKg.max} kg, abhängig von Größe und Material. Ein exakter Wert lässt sich nicht allein aus dem Maß ableiten.`,
      ] },
      { id: "standardmasse", heading: "Zwölf Standardmaße, Sondermaße auf Anfrage", paragraphs: [
        "Dalemans führt die folgenden Formate als Standardgrößen. Zwischen- und Sondermaße sowie Freiformen können je nach Modell und Konstruktion angefragt werden; sie sind keine automatisch verfügbare Standardvariante.",
      ], facts: tableDimensionFacts },
      { id: "zwei-zu-eins", heading: "Das 2:1-Prinzip erleichtert rechtwinklige Tischblöcke", paragraphs: [
        "Bei einem 2:1-Maß entsprechen zwei Tischbreiten genau einer Tischlänge. So lassen sich gleich große Tische bündig und ohne Versatz zu rechtwinkligen Blöcken kombinieren. Das ist ein Planungsvorteil, keine bauordnungsrechtliche Regel.",
        "Andere Maße können für lange Reihen, bestimmte Raumgeometrien oder abweichende Nutzungen besser passen.",
      ], facts: [
        { label: "passt exakt", value: "140 × 70 cm", note: "70 + 70 = 140 cm" },
        { label: "passt exakt", value: "150 × 75 cm", note: "75 + 75 = 150 cm" },
        { label: "passt exakt", value: "160 × 80 cm", note: "80 + 80 = 160 cm" },
        { label: "kein 2:1-Maß", value: "160 × 70 cm", note: "70 + 70 = 140 cm, nicht 160 cm" },
      ] },
      { id: "gestelle", heading: "K1 für Reihen, K3 bei häufiger Stirnseitennutzung", paragraphs: [
        `Für überwiegend in Reihen aufgestellte Tische empfiehlt Dalemans häufig ${recommendations.tableLegs.rows}. Wenn oft an den Stirnseiten gesessen wird, ist ${recommendations.tableLegs.frequentEndSeating} häufig günstiger.`,
        "Die Empfehlung beschreibt die Nutzung, nicht eine automatisch verfügbare Produktvariante. Das tatsächlich angebotene Gestell muss am konkreten Tischmodell geprüft werden; Produktvarianten werden dadurch nicht verändert.",
      ] },
      { id: "platten-und-modell-210", heading: "Plattenaufbau und Modell 210 getrennt betrachten", paragraphs: [
        `Viele sonstige Tischplatten sind nach Firmenauskunft typischerweise etwa ${estimatedValues.typicalTopThicknessMm} mm stark; die übliche Tischhöhe liegt bei ca. ${estimatedValues.tableHeightMm} mm. Beides gilt nicht blind für jede Ausführung, Wunschhöhen sind auf Anfrage möglich.`,
        `Das Modell 210 (Seminar) besitzt nach Konstruktionsangabe eine ${modelSpecific.table210.topThicknessMm}-mm-Platte ohne Kantenaufdopplung und wird nur bis ${modelSpecific.table210.largestAdvertisedFormatCm.length} × ${modelSpecific.table210.largestAdvertisedFormatCm.width} cm angeboten. Welche kleineren Zwischenmaße möglich sind, muss die aktuelle Variantenmatrix zeigen.`,
        `Zusammengeklappt nennt Dalemans modellabhängig ca. ${estimatedValues.foldedTableHeightCm.lengthBelow160} cm Höhe bei Tischlängen unter 160 cm und ca. ${estimatedValues.foldedTableHeightCm.lengthFrom160} cm ab 160 cm. Die sichere Nutzung richtet sich nach den Herstellerhinweisen; eine pauschale Traglast wird nicht veröffentlicht.`,
      ] },
      { id: "sonderausfuehrungen", heading: "Freiformen, Kanten und Farben konkret anfragen", paragraphs: [
        "Sonderformen, besondere Oberflächen, Kantenbeizungen und Sonderfarben können projektbezogen angefragt werden. Die Machbarkeit hängt von Modell, Konstruktion und aktueller Fertigung ab.",
        "Dekore und Produktbilder am Bildschirm sind nicht farbverbindlich. Für eine sichere Farbentscheidung stellt Dalemans auf Wunsch echte Muster bereit.",
      ] },
    ],
    faq: [
      { question: "Welche Maße erfüllen das 2:1-Prinzip?", answer: "140 × 70, 150 × 75 und 160 × 80 cm erfüllen es exakt. 160 × 70 cm nicht. Das Verhältnis ist eine Planungshilfe, keine Norm." },
      { question: "Welches Gestell passt für Tischreihen?", answer: "Dalemans empfiehlt häufig K1. Bei regelmäßiger Nutzung der Stirnseiten ist K3 oft günstiger. Verfügbarkeit und Eignung müssen am Modell geprüft werden." },
      { question: "Wie schwer ist ein Klapptisch?", answer: "Übliche Ausführungen liegen als Orientierung bei ca. 23–32 kg, abhängig von Material, Modell und Größe. Den konkreten Wert bitte für die gewählte Ausführung prüfen." },
      { question: "Sind Zwischen- und Sondermaße möglich?", answer: "Laut Firmenauskunft grundsätzlich auf Anfrage, aber abhängig von Modell und Konstruktion. Beim Modell 210 gilt die konstruktive Obergrenze 140 × 70 cm; kleinere Kombinationen müssen konkret geprüft werden." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Klapptische im Sortiment", description: "Aktuelle Modelle und verfügbare Ausführungen ansehen." },
      { href: modelSpecific.table210.href, label: modelSpecific.table210.label, description: "Das kompakte Seminar-Modell im Produktbereich prüfen." },
      { href: "/raumplaner", label: "Raumplaner", description: "Eine mögliche Aufstellung unverbindlich vorbereiten." },
    ],
  },
  {
    slug: "tischplatten-und-kanten",
    title: "Tischplatten und Kanten sachlich auswählen",
    description: "HPL, Melamin, Tischkanten, Muster und Pflege im praktischen Vergleich – ohne pauschale Haltbarkeitsversprechen.",
    category: "Klapptische", updatedAt: "2026-10-09", status: "published",
    body: [
      { id: "oberflaechen", heading: "HPL und Melamin sind unterschiedliche Oberflächen", paragraphs: [
        "HPL ist ein separat gefertigtes Schichtmaterial, das auf eine Trägerplatte aufgebracht wird. Bei einer Melaminoberfläche wird dekoriertes Papier mit Harz direkt mit der Platte verpresst.",
        "Aus der Bezeichnung folgt keine allgemeine Kratz-, Chemikalien-, Hitze- oder Lebensdauergarantie. Maßgeblich sind der konkrete Produktaufbau, die Nutzung und die Pflegehinweise.",
      ] },
      { id: "kanten", heading: "Die Kante schützt und prägt die Haptik", paragraphs: [
        "Je nach Produkt kommen beispielsweise Kunststoff- oder Holzkanten infrage. Material, Radius und Verarbeitung müssen zur konkreten Ausführung passen; keine Kantenart ist automatisch in jeder Situation überlegen.",
        "Bei häufigem Auf- und Abbau zählen neben Oberfläche und Kante auch Plattengewicht, Gestell, Beschläge und Transportweg.",
      ] },
      { id: "muster", heading: "Bildschirmdekore sind nicht farbverbindlich", paragraphs: [
        "Holz-, HPL- und Farbdarstellungen können je nach Display, Licht und Aufnahme abweichen. Für verbindliche Entscheidungen empfiehlt Dalemans ein echtes Muster.",
        "Sonderoberflächen, Kantenbeizungen und Sonderfarben sind Anfrageoptionen und nicht automatisch sofort verfügbare Standardvarianten.",
      ] },
      { id: "reinigung-und-lagerung", heading: "Feucht, nicht nass reinigen und flach lagern", paragraphs: [
        "Tischplatten mit einem weichen Tuch feucht, nicht nass reinigen. Flüssigkeit nicht auf der Platte oder an Fugen und beschädigten Kanten stehen lassen; produktspezifische Pflegehinweise gehen vor.",
        "Zusammengeklappte Tische trocken und flach liegend lagern. Längeres Anlehnen an eine Wand kann Verformung begünstigen.",
      ] },
    ],
    faq: [
      { question: "Ist HPL grundsätzlich besser als Melamin?", answer: "Nein. Es sind unterschiedliche Oberflächen. Welche passt, hängt von Produktaufbau, Nutzung, gewünschtem Dekor und Budget ab." },
      { question: "Sind Dekore am Bildschirm farbverbindlich?", answer: "Nein. Display und Licht verändern die Darstellung. Auf Wunsch können echte Muster angefragt werden." },
      { question: "Wie reinige und lagere ich Tischplatten?", answer: "Feucht, nicht nass reinigen und Flüssigkeit an Kanten vermeiden. Klapptische trocken und flach lagern, nicht dauerhaft an eine Wand lehnen." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Tische im Sortiment", description: "Aktuelle Modelle und nachgewiesene Ausführungen ansehen." },
      { href: "/wissen/klapptische-richtig-waehlen", label: "Klapptische richtig wählen", description: "Maße, Gestelle und Sonderausführungen einordnen." },
      { href: "/wissen/transport-lagerung-pflege", label: "Pflege & Lagerung", description: "Möbel materialgerecht reinigen und aufbewahren." },
    ],
  },
] as const satisfies readonly GuideArticle[];

export function getPublishedGuides() {
  return guideArticles.filter((article) => article.status === "published");
}

export function getPublishedGuide(slug: string) {
  return getPublishedGuides().find((article) => article.slug === slug);
}
