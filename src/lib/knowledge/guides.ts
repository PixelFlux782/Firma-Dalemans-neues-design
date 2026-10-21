import {
  dimensionLabel,
  estimatedValues,
  modelSpecific,
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
    category: "Stapelstühle", updatedAt: "2026-10-21", status: "published",
    body: [
      { id: "raum-und-nutzung", heading: "Mit Raum und Nutzung beginnen", paragraphs: [
        "Entscheidend ist nicht nur die Form eines Stuhls: Wie oft bauen Sie um, wie lange sitzen die Menschen, wie lagern Sie die Stühle und stellen Sie regelmäßig Reihen? Unsere Stapelstühle sind für häufiges Umstellen ausgelegt. Stapelung und Ausstattung unterscheiden sich je nach Modell.",
        `Aus unserer Erfahrung können Sie mit etwa ${estimatedValues.chairWidthCm.withoutRowConnector} cm ohne und etwa ${estimatedValues.chairWidthCm.withRowConnector} cm mit Reihenverbinder planen. Da die Breiten je nach Modell und Ausführung abweichen können, prüfen wir das genaue Maß für Ihre Auswahl.`,
      ] },
      { id: "sitzkomfort", heading: "Sitzkomfort persönlich prüfen", paragraphs: [
        "Für längere Veranstaltungen sind Sitz- und Rückenpolster häufig sinnvoll. Komfort ist dennoch individuell: Schalenform, Körpergröße, Sitzdauer und Bezug wirken zusammen.",
        "Vor einer größeren Anschaffung empfehlen wir deshalb einen Musterstuhl. So können Sie das Modell im eigenen Raum, mit der geplanten Polsterung und mit unterschiedlichen Personen erproben.",
      ] },
      { id: "starke-nutzung", heading: "Robuste Schalen und saubere Verarbeitung", paragraphs: [
        `Wir, die Firma Dalemans, empfehlen für stark beanspruchte Räume weniger stark taillierte Schalen wie die Modelle ${modelSpecific.heavyUseChairExamples.map((model) => model.label).join(" und ")}. Auch weitere Modelle wählen wir passend zur Nutzung aus.`,
        "Unsere Schichtholzschalen sind sorgfältig verleimt, die Gestelle sauber verarbeitet und je nach Ausführung hochwertig beschichtet oder verchromt. Diese robuste Konstruktion ist für langjährige Nutzung ausgelegt. Signifikante Mängel an Verleimung, Gestell oder Oberfläche sind bei unseren ausgelieferten Bestuhlungen bislang nicht aufgetreten.",
      ] },
      { id: "langfristig-planen", heading: "Von Anfang an an Reihenverbinder denken", paragraphs: [
        "Wenn Sie eine Reihenbestuhlung planen, empfehlen wir die passende Reihenverbindung direkt bei der Modellauswahl. Ersatzteile wie Stuhlgleiter sowie nachrüstbare Buchablagen können Sie später bei uns beziehen.",
        "Viele unserer zufriedenen Kunden nutzen ihre Dalemans-Stühle seit Jahrzehnten.",
      ] },
    ],
    faq: [
      { question: "Sind gepolsterte Stühle immer bequemer?", answer: "Sitz- und Rückenpolster können bei längerem Sitzen sinnvoll sein. Das persönliche Sitzempfinden bleibt individuell; ein Musterstuhl hilft bei der Entscheidung." },
      { question: "Wie breit ist ein Stapelstuhl mit Reihenverbinder?", answer: "Mit Reihenverbinder beträgt die Stuhlbreite ca. 53 cm, ohne Reihenverbinder ca. 51 cm. Das genaue Maß hängt vom Modell und der Ausführung ab." },
      { question: "Sind Coburg und Nürnberg die einzigen Modelle für starke Nutzung?", answer: "Nein. Wir empfehlen Coburg und Nürnberg wegen ihrer weniger stark taillierten Schalen besonders für stark beanspruchte Räume. Auch unsere weiteren aktuellen Modelle sind für regelmäßiges Umstellen ausgelegt." },
    ],
    relatedLinks: [
      { href: "/produkte/stapelstuehle", label: "Stapelstuhlmodelle", description: "Aktuelle Modelle und verfügbare Ausführungen vergleichen." },
      ...modelSpecific.heavyUseChairExamples.map((model) => ({ href: model.href, label: `Modell ${model.label}`, description: "Das aktuelle Modell und seine belegten Ausführungen ansehen." })),
      { href: "/wissen/reihenverbinder-fuer-stapelstuehle", label: "Reihenverbinder planen", description: "Werksseitige und nachrüstbare Lösungen direkt vergleichen." },
      { href: "/wissen/stoffe-und-bezuege", label: "Stoffe & Bezüge", description: "Polsterstoffe, Pflege und Nachweise auswählen." },
    ],
  },
  {
    slug: "reihenverbinder-fuer-stapelstuehle",
    title: "Reihenverbinder für Stapelstühle richtig einplanen",
    description: "Fest montierte Metall-Reihenverbinder für neue Stapelstühle oder Kunststoff-Reihenverbinder zur Nachrüstung: Wir zeigen, welche Lösung wann passt.",
    category: "Stapelstühle", updatedAt: "2026-10-19", status: "published",
    body: [
      { id: "metall-reihenverbinder", heading: "Fest montierte Metall-Reihenverbinder – unsere erste Wahl", paragraphs: [
        "Bei der Neubestellung von Stapelstühlen empfehlen wir die fest am Stuhl montierte Reihenverbindung aus Metall. Sie ist unsere bevorzugte Lösung für regelmäßig genutzte Reihenbestuhlungen.",
        "Die Reihenverbindung wird direkt am Stuhl montiert. Wählen Sie diese Ausstattung deshalb möglichst bereits bei der Konfiguration Ihrer neuen Stapelstühle aus.",
        "Die beiden Ansichten zeigen, wie unsere bevorzugte Metall-Reihenverbindung am Stapelstuhl aussieht.",
      ], images: [
        { src: encodeURI("/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Reihenverbinder_l.png"), alt: "Fest montierte Metall-Reihenverbindung an einem Stapelstuhl, linke Ansicht", width: 1536, height: 1024 },
        { src: encodeURI("/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Reihenverbinder_r.png"), alt: "Fest montierte Metall-Reihenverbindung an einem Stapelstuhl, rechte Ansicht", width: 1023, height: 1537 },
      ] },
      { id: "kunststoff-nachruestung", heading: "Kunststoff-Reihenverbinder – für die Nachrüstung", paragraphs: [
        "Für bereits vorhandene Stapelstühle, die ursprünglich ohne Reihenverbindung bestellt wurden, bieten wir separat erhältliche Reihenverbinder aus Kunststoff zur Nachrüstung an.",
        "Diese Lösung ist sinnvoll, wenn sich Ihre Anforderungen nach dem ursprünglichen Kauf geändert haben. Ob eine Nachrüstung möglich ist, hängt vom jeweiligen Stuhlmodell, der Gestellform, den Rohrmaßen und dem benötigten Stuhlabstand ab. Eine universelle Kompatibilität besteht nicht.",
      ], link: { href: "/produkte/artikel/reihenverbinder-kunststoff", label: "Kunststoff-Reihenverbinder zur Nachrüstung ansehen", description: "Nachrüstlösung für geeignete vorhandene Stapelstühle." } },
      { id: "unsere-empfehlung", heading: "Welche Lösung empfehlen wir?", paragraphs: [
        "Neubestellung mit Reihenverbindung: Wählen Sie fest montierte Metall-Reihenverbinder möglichst direkt bei der Stuhlkonfiguration.",
        "Vorhandene Stühle nachträglich verbinden: Nutzen Sie passende Kunststoff-Reihenverbinder zur Nachrüstung, nachdem wir die Kompatibilität mit Ihrem Stuhlmodell geprüft haben.",
      ] },
      { id: "anforderungen", heading: "Bestuhlungsplan und örtliche Anforderungen prüfen", paragraphs: [
        regulatory.rowConnectorRequirement,
        "Für Veranstaltungen sollte der genehmigte Bestuhlungsplan beziehungsweise die zuständige Fachplanung geprüft werden. Die Auswahl eines Verbinders ersetzt weder eine baurechtliche Bewertung noch eine Sicherheitsfreigabe für eine konkrete Aufstellung.",
      ] },
    ],
    faq: [
      { question: "Sind Reihenverbinder in jeder Kirche vorgeschrieben?", answer: "Nein, nicht pauschal. Nutzung, rechtliche Einordnung, örtliche Vorschriften und der genehmigte Bestuhlungsplan sind entscheidend." },
      { question: "Kann ich Reihenverbinder nachrüsten?", answer: "Für geeignete vorhandene Stapelstühle bieten wir Kunststoff-Reihenverbinder zur Nachrüstung an. Die Passung muss am konkreten Stuhlmodell und Gestell geprüft werden." },
      { question: "Warum gleich bei der Bestellung mitplanen?", answer: "Bei neuen Stapelstühlen empfehlen wir die fest montierte Metall-Reihenverbindung. Sie ist unsere bevorzugte Lösung für regelmäßig genutzte Reihenbestuhlungen und sollte direkt bei der Stuhlkonfiguration ausgewählt werden." },
    ],
    relatedLinks: [
      { href: "/produkte/artikel/reihenverbinder-kunststoff", label: "Kunststoff-Reihenverbinder zur Nachrüstung", description: "Nachrüstlösung für geeignete vorhandene Stapelstühle ansehen." },
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
        `Nach unserer Erfahrung sind bei üblichen Stühlen bis zu ca. ${estimatedValues.chairStackCount} Stück pro Stapel ein hilfreicher Orientierungswert. Bei Tischen dienen ca. ${estimatedValues.tableStackCount.storage} Stück im Lager und ca. ${estimatedValues.tableStackCount.suitableCart} Stück auf einem passenden Tischtransportwagen als Orientierung.`,
        "Diese Werte sind keine pauschale Transportfreigabe. Prüfen Sie Modell, Eigengewicht, Tragfähigkeit des Wagens, Kipprisiko und Sicherung gemeinsam. Halten Sie Transportwege frei und beachten Sie die Hinweise für das jeweilige Produkt.",
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
        "Bei geeigneten Polsterstoffen haben wir mit Textil- oder Teppich-Trockenschaum gute Erfahrungen gemacht. Prüfen Sie zuerst die Pflegehinweise, testen Sie an einer unauffälligen Stelle und durchnässen Sie den Bezug nicht.",
        "Tischplatten feucht, nicht nass wischen. Flüssigkeit nicht an Kanten oder Fugen stehen lassen und keine aggressiven Mittel ohne produktspezifische Freigabe verwenden.",
      ] },
      { id: "erhalten", heading: "Ersatzteil und Reparatur vor Neukauf prüfen", paragraphs: [
        "Verschlissene Stuhlgleiter lassen sich häufig ersetzen. Abhängig vom Modell können Buchablagen oder Reihenverbinder ergänzt werden. So kann eine vorhandene Ausstattung länger sinnvoll genutzt werden.",
        "Vor einer Nachrüstung prüfen wir Modell, Montagebedingungen und die weitere Stapelbarkeit. Auch bei der Zuordnung und bei Reparaturfragen helfen wir Ihnen gern.",
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
    category: "Stoffe & Materialien", updatedAt: "2026-10-21", status: "published",
    body: [
      { id: "stoffgruppen", heading: "Stoffgruppen sind keine genormten Qualitätsklassen", paragraphs: [
        "Die Gruppen ordnen die verfügbaren Bezüge in unserem Sortiment. Eine höhere Nummer bedeutet nicht automatisch, dass ein Stoff robuster oder für jeden Raum besser geeignet ist.",
        "Ab Gruppe 3 bieten wir in der Regel Stoffoptionen mit passenden B1-Eigenschaften an. Das ist keine automatische Zertifizierung: Entscheidend sind Nachweis, Farbe und Variante des gewählten Stoffes.",
      ] },
      { id: "material-und-abrieb", heading: "Material, Gewicht und Martindale zusammen betrachten", paragraphs: [
        "Im Sortiment kommen unter anderem Dralon, Trevira, Polyester und Polyamid vor. Typische Orientierungen sind etwa 400 bis 700 Gramm je Laufmeter bei meist rund 1,30 Meter Rollenbreite sowie etwa 40.000 bis 100.000 Martindale-Scheuertouren. Kein Einzelwert gilt automatisch für jede Variante.",
        "Gewicht und Scheuertouren sind Vergleichswerte, aber keine Lebensdauergarantie. Faser, Webart, Verarbeitung, Licht, Pflege und die gesamte Polsterkonstruktion wirken zusammen.",
      ] },
      { id: "pflege-und-muster", heading: "Pflegehinweise beachten und echte Muster ansehen", paragraphs: [
        "Bei geeigneten Stoffen haben wir gute Erfahrungen mit Textil- oder Teppich-Trockenschaum gemacht. Beachten Sie die Pflegehinweise, testen Sie zunächst an einer unauffälligen Stelle und durchnässen Sie den Bezug nicht.",
        "Farben am Bildschirm sind nicht farbverbindlich. Für Farbe, Haptik und das Zusammenspiel im Raum ist ein echtes Stoffmuster die bessere Grundlage.",
      ] },
    ],
    faq: [
      { question: "Was bedeutet Martindale?", answer: "Martindale ist ein Prüfverfahren für Scheuerbeständigkeit. Der Wert hilft beim Vergleich, garantiert aber keine bestimmte Nutzungsdauer." },
      { question: "Kann ich Stoffmuster erhalten?", answer: "Ja. Wir stellen Ihnen auf Anfrage Muster bereit. Damit beurteilen Sie Farbe und Haptik verlässlicher als am Bildschirm." },
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
    category: "Klapptische", updatedAt: "2026-10-21", status: "published",
    body: [
      { id: "nutzung", heading: "Mit Nutzung, Transport und Lagerung beginnen", paragraphs: [
        "Ein Klapptisch sollte zu Reihen, Gruppen- oder Blockstellungen, zu Transportwegen und Lagerfläche passen. Erst aus diesem Zusammenspiel ergeben sich Format, Platte und Gestell.",
        `Unsere üblichen Ausführungen wiegen je nach Größe und Material ungefähr ${estimatedValues.tableWeightKg.min} bis ${estimatedValues.tableWeightKg.max} kg. Den genauen Wert prüfen wir für das gewählte Modell.`,
      ] },
      { id: "standardmasse", heading: "Zwölf Standardmaße, Sondermaße auf Anfrage", paragraphs: [
        "Die folgenden Formate führen wir als Standardgrößen. Zwischenmaße, Sondermaße und Freiformen prüfen wir passend zu Modell und Konstruktion.",
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
      { id: "gestelle", heading: "Das passende Gestell für Ihren Tisch", paragraphs: [
        "Neben den Maßen spielt auch das Tischgestell eine wichtige Rolle. Welches Gestell wir empfehlen, richtet sich vor allem nach der geplanten Nutzung und Aufstellung.",
        "Für lange Reihenaufstellungen empfehlen wir in der Regel unsere Modelle K1 oder K2. Ihre vertikalen Rohre sind leicht zurückgesetzt. Dadurch werden Personen an den Tischstößen möglichst wenig gestört. Diese Gestelle eignen sich besonders für Konferenzen, Seminare und Veranstaltungen mit vielen Teilnehmern.",
        "Wenn Tische überwiegend einzeln genutzt werden oder regelmäßig Sitzplätze an den Stirnseiten vorgesehen sind, empfehlen wir die Modelle K3 oder K4. Diese Gestellformen bieten an den Stirnseiten mehr Beinfreiheit.",
        "K3 und K4 sind ohne Aufpreis erhältlich. Die gewünschte Ausführung kann bei der Bestellung angegeben werden. Wir prüfen zusätzlich, welches Gestell für das gewählte Tischmodell und die geplante Nutzung verfügbar und geeignet ist.",
      ], images: [
        { src: encodeURI("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K1-optimiert.webp"), alt: "Klapptisch-Gestell K1 mit zurückgesetzten vertikalen Rundrohren für Reihenaufstellungen", width: 2000, height: 2000 },
        { src: encodeURI("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K2-optimiert.webp"), alt: "Klapptisch-Gestell K2 mit zurückgesetzten vertikalen Vierkantrohren für Reihenaufstellungen", width: 2000, height: 2000 },
        { src: encodeURI("/neue bilder/Gestelle/Gestelltypen/T_Klapptisch_Gestell_K3_Standard-optimiert.webp"), alt: "Klapptisch-Gestell K3 mit außenliegenden Beinen für mehr Beinfreiheit an den Stirnseiten", width: 2000, height: 2000 },
      ], links: [
        { href: "/produkte/tischfuesse-gestellteile", label: "Tischgestelle K1 bis K4 ansehen", description: "Gestellformen für Reihen-, Einzel- und Stirnseitenaufstellungen vergleichen." },
        { href: "/produkte/artikel/klapptisch-310c", label: "Klapptisch Modell 310c ansehen", description: "Klapptisch mit den passenden Gestelltypen auswählen." },
      ] },
      { id: "platten-und-modell-210", heading: "Plattenaufbau und Modell 210 getrennt prüfen", paragraphs: [
        `Viele unserer Tischplatten sind etwa ${estimatedValues.typicalTopThicknessMm} mm stark; die übliche Tischhöhe liegt bei ca. ${estimatedValues.tableHeightMm} mm. Die genauen Maße hängen von der Ausführung ab, Wunschhöhen sind auf Anfrage möglich.`,
        `Das Modell 210 (Seminar) besitzt eine ${modelSpecific.table210.topThicknessMm}-mm-Platte ohne Kantenaufdopplung und ist bis ${modelSpecific.table210.largestAdvertisedFormatCm.length} × ${modelSpecific.table210.largestAdvertisedFormatCm.width} cm erhältlich. Welche kleineren Zwischenmaße möglich sind, prüfen wir anhand der aktuellen Varianten.`,
        `Zusammengeklappt sind unsere Tische je nach Modell ca. ${estimatedValues.foldedTableHeightCm.lengthBelow160} cm hoch, wenn sie kürzer als 160 cm sind, und ca. ${estimatedValues.foldedTableHeightCm.lengthFrom160} cm ab 160 cm Tischlänge.`,
      ] },
      { id: "sonderausfuehrungen", heading: "Freiformen, Kanten und Farben konkret anfragen", paragraphs: [
        "Sonderformen, besondere Oberflächen, Kantenbeizungen und Sonderfarben können projektbezogen angefragt werden. Die Machbarkeit hängt von Modell, Konstruktion und aktueller Fertigung ab.",
        "Dekore und Produktbilder am Bildschirm sind nicht farbverbindlich. Für eine sichere Farbentscheidung stellen wir Ihnen auf Wunsch echte Muster bereit.",
      ] },
    ],
    faq: [
      { question: "Welche Maße erfüllen das 2:1-Prinzip?", answer: "140 × 70, 150 × 75 und 160 × 80 cm erfüllen es exakt. 160 × 70 cm nicht. Das Verhältnis ist eine Planungshilfe, keine Norm." },
      { question: "Welches Gestell passt für Tischreihen?", answer: "Für lange Tischreihen empfehlen wir in der Regel K1 oder K2, weil ihre vertikalen Rohre leicht zurückgesetzt sind. Für überwiegend einzeln genutzte Tische oder regelmäßig genutzte Stirnseiten empfehlen wir K3 oder K4. Wir prüfen Verfügbarkeit und Eignung am gewählten Modell." },
      { question: "Wie schwer ist ein Klapptisch?", answer: "Übliche Ausführungen liegen als Orientierung bei ca. 23–32 kg, abhängig von Material, Modell und Größe. Den konkreten Wert bitte für die gewählte Ausführung prüfen." },
      { question: "Sind Zwischen- und Sondermaße möglich?", answer: "Ja, abhängig von Modell und Konstruktion. Beim Modell 210 liegt die konstruktive Obergrenze bei 140 × 70 cm; kleinere Kombinationen prüfen wir für Ihre Anfrage." },
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
    description: "HPL, Melamin, Tischkanten, Muster und Pflege im praktischen Vergleich.",
    category: "Klapptische", updatedAt: "2026-10-21", status: "published",
    body: [
      { id: "oberflaechen", heading: "HPL ist deutlich robuster als Melamin", paragraphs: [
        "HPL ist mindestens dreimal so belastbar und mindestens zehnmal härter als eine melamindirektbeschichtete Platte. Außerdem weist HPL eine hohe Widerstandsdauer gegen Zigarettenglut auf.",
      ] },
      { id: "kanten", heading: "Die Kante schützt und prägt die Haptik", paragraphs: [
        "Je nach Produkt kommen beispielsweise Kunststoff- oder Holzkanten infrage. Material, Radius und Verarbeitung müssen zur konkreten Ausführung passen; keine Kantenart ist automatisch in jeder Situation überlegen.",
        "Bei häufigem Auf- und Abbau zählen neben Oberfläche und Kante auch Plattengewicht, Gestell, Beschläge und Transportweg.",
      ] },
      { id: "muster", heading: "Bildschirmdekore sind nicht farbverbindlich", paragraphs: [
        "Holz-, HPL- und Farbdarstellungen können je nach Display, Licht und Aufnahme abweichen. Für eine verlässliche Entscheidung empfehlen wir ein echtes Muster.",
        "Sonderoberflächen, Kantenbeizungen und Sonderfarben sind Anfrageoptionen und nicht automatisch sofort verfügbare Standardvarianten.",
      ] },
      { id: "reinigung-und-lagerung", heading: "Feucht, nicht nass reinigen und flach lagern", paragraphs: [
        "Tischplatten mit einem weichen Tuch feucht, nicht nass reinigen. Flüssigkeit nicht auf der Platte oder an Fugen und beschädigten Kanten stehen lassen; produktspezifische Pflegehinweise gehen vor.",
        "Zusammengeklappte Tische trocken und flach liegend lagern. Längeres Anlehnen an eine Wand kann Verformung begünstigen.",
      ] },
    ],
    faq: [
      { question: "Ist HPL grundsätzlich besser als Melamin?", answer: "Ja, immer. HPL ist mindestens dreimal so belastbar, mindestens zehnmal härter und weist eine hohe Widerstandsdauer gegen Zigarettenglut auf." },
      { question: "Sind Dekore am Bildschirm farbverbindlich?", answer: "Nein. Display und Licht verändern die Darstellung. Auf Wunsch können echte Muster angefragt werden." },
      { question: "Wie reinige und lagere ich Tischplatten?", answer: "Feucht, nicht nass reinigen und Flüssigkeit an Kanten vermeiden. Klapptische trocken und flach lagern, nicht dauerhaft an eine Wand lehnen." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Tische im Sortiment", description: "Aktuelle Modelle und nachgewiesene Ausführungen ansehen." },
      { href: "/wissen/klapptische-richtig-waehlen", label: "Klapptische richtig wählen", description: "Maße, Gestelle und Sonderausführungen vergleichen." },
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
