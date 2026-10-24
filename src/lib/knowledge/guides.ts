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
    category: "Stapelstühle", updatedAt: "2026-10-22", status: "published",
    body: [
      { id: "raum-und-nutzung", heading: "Mit Raum und Nutzung beginnen", paragraphs: [
        "Entscheidend ist nicht nur die Form eines Stuhls: Wie oft bauen Sie um, wie lange sitzen die Menschen, wie lagern Sie die Stühle und stellen Sie regelmäßig Reihen? Unsere Stapelstühle sind für häufiges Umstellen ausgelegt. Stapelung und Ausstattung unterscheiden sich je nach Modell.",
        `Aus unserer Erfahrung können Sie mit etwa ${estimatedValues.chairWidthCm.withoutRowConnector} cm ohne und etwa ${estimatedValues.chairWidthCm.withRowConnector} cm mit Reihenverbinder planen. Da die Breiten je nach Modell und Ausführung abweichen können, prüfen wir das genaue Maß für Ihre Auswahl.`,
      ] },
      { id: "sitzkomfort", heading: "Sitzkomfort persönlich prüfen", paragraphs: [
        "Für längere Veranstaltungen sind Sitz- und Rückenpolster häufig sinnvoll. Komfort ist dennoch individuell: Schalenform, Körpergröße, Sitzdauer und Bezug wirken zusammen.",
        "Vor einer größeren Anschaffung empfehlen wir deshalb einen Musterstuhl. So können Sie das Modell im eigenen Raum, mit der geplanten Polsterung und mit unterschiedlichen Personen erproben.",
      ] },
      { id: "qualitaet-verarbeitung", heading: "Qualitätsunterschiede an Verarbeitung und Details erkennen", paragraphs: [
        "Bei regelmäßig bewegten Objektstühlen entscheidet nicht ein einzelnes Schlagwort über die Qualität. Achten Sie auf die gesamte Konstruktion: sauber ausgeführte Verbindungen am Gestell, gleichmäßige Oberflächen, belastbare Befestigungspunkte und eine Schale, deren Furnierlagen dauerhaft miteinander verbunden sind.",
        "Unsaubere Gestellverbindungen können unter häufiger Belastung zu Schäden führen. Bei mangelhaft verleimtem Schichtholz können sich Furnierlagen voneinander lösen; eine zu schwache oder beschädigte Beschichtung kann Korrosion begünstigen. Ein Musterstuhl hilft deshalb nicht nur beim Probesitzen, sondern auch bei der Prüfung von Verarbeitung, Gewicht und Handhabung.",
      ] },
      { id: "schichtholz-und-gestelle", heading: "Schichtholzschale und Gestell als Einheit beurteilen", paragraphs: [
        `Wir, die Firma Dalemans, empfehlen für stark beanspruchte Räume weniger stark taillierte Schalen wie die Modelle ${modelSpecific.heavyUseChairExamples.map((model) => model.label).join(" und ")}. Auch weitere Modelle wählen wir passend zur Nutzung aus.`,
        "Unsere Schichtholzschalen sind sorgfältig verleimt, die Gestelle sauber verarbeitet und je nach Ausführung beschichtet oder verchromt. Für die konkrete Auswahl betrachten wir Schalenform, Gestell, Befestigung und geplante Beanspruchung gemeinsam; eine einzelne Materialangabe ersetzt diese Prüfung nicht.",
      ] },
      { id: "pruefhinweis-altangaben", heading: "Prüfhinweis zu früheren Qualitätsaussagen", paragraphs: [
        "Die frühere Informationsseite formulierte unter anderem, Dalemans-Stühle kämen ohne Kunststoff aus und Gestell- oder Schalenbrüche gehörten grundsätzlich der Vergangenheit an. Solche pauschalen Aussagen lassen sich nicht auf jede aktuelle Ausführung und jede Nutzung übertragen.",
        "Für eine belastbare Beratung prüfen wir stattdessen Materialmix, Verbindungen, Beschichtung, verfügbare Nachweise und die konkrete Modellvariante. Qualitätsmerkmale werden damit nachvollziehbar, ohne eine ausnahmslose Haltbarkeitszusage zu geben.",
      ] },
      { id: "bestuhlungsplanung", heading: "Bestuhlung, Reihenverbinder und Wege zusammen planen", paragraphs: [
        "Wenn Sie eine Reihenbestuhlung planen, empfehlen wir die passende Reihenverbindung direkt bei der Modellauswahl. Der benötigte Stuhlabstand, die tatsächliche Modellbreite, Gänge, Ausgänge und die genehmigte Raumplanung gehören zusammen betrachtet.",
        "Unser Raumplaner kann bei Mengen und Aufstellungen eine erste Orientierung geben. Er ersetzt weder einen genehmigten Bestuhlungsplan noch die Prüfung durch die für Ihren Veranstaltungsraum zuständigen Fachstellen.",
      ], links: [
        { href: "/wissen/reihenverbinder-fuer-stapelstuehle", label: "Reihenverbinder fachlich einplanen", description: "Fest montierte und nachrüstbare Lösungen sowie die örtlichen Anforderungen unterscheiden." },
        { href: "/raumplaner", label: "Bestuhlung im Raum vorbereiten", description: "Stuhlreihen und Wege als unverbindlichen Planungsentwurf anlegen." },
      ] },
      { id: "langfristig-planen", heading: "Langlebigkeit mit Ersatzteilen und Nachrüstung sichern", paragraphs: [
        "Austauschbare Stuhlgleiter, passende Reihenverbinder und je nach Modell nachrüstbare Buchablagen können eine vorhandene Bestuhlung lange nutzbar halten. Vor einer Nachrüstung prüfen wir Modell, Gestellmaße, Befestigung und die weitere Stapelbarkeit.",
        "Viele unserer zufriedenen Kunden nutzen ihre Dalemans-Stühle seit Jahrzehnten. Das ist ein Erfahrungswert und keine garantierte Mindestlebensdauer: Nutzung, Pflege, Transport und die konkrete Ausführung bleiben entscheidend.",
      ] },
    ],
    faq: [
      { question: "Sind gepolsterte Stühle immer bequemer?", answer: "Sitz- und Rückenpolster können bei längerem Sitzen sinnvoll sein. Das persönliche Sitzempfinden bleibt individuell; ein Musterstuhl hilft bei der Entscheidung." },
      { question: "Wie breit ist ein Stapelstuhl mit Reihenverbinder?", answer: "Mit Reihenverbinder beträgt die Stuhlbreite ca. 53 cm, ohne Reihenverbinder ca. 51 cm. Das genaue Maß hängt vom Modell und der Ausführung ab." },
      { question: "Woran erkenne ich einen hochwertig verarbeiteten Stapelstuhl?", answer: "Beurteilen Sie Schale, Gestell, Verbindungen, Beschichtung und Befestigung als Einheit. Saubere Gestellverbindungen und dauerhaft verleimte Furnierlagen sind wichtiger als ein einzelnes Werbeversprechen." },
      { question: "Sind Coburg und Nürnberg die einzigen Modelle für starke Nutzung?", answer: "Nein. Wir empfehlen Coburg und Nürnberg wegen ihrer weniger stark taillierten Schalen besonders für stark beanspruchte Räume. Auch weitere Modelle wählen wir passend zur Nutzung aus." },
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
        { src: encodeURI("/neue bilder/Stapelstühle/reihenverbinder/1010dd1-optimiert.webp"), alt: "Fest montierte Metall-Reihenverbinder zweier miteinander verbundener Stapelstühle", width: 2000, height: 2000 },
        { src: encodeURI("/neue bilder/Stapelstühle/reihenverbinder/1010dd2-optimiert.webp"), alt: "Geöffnete Metall-Reihenverbinder an zwei Stapelstühlen vor dem Einhaken", width: 2000, height: 2000 },
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
    title: "Zubehör, Pflege und Werterhalt für Stühle und Tische",
    description: "Gleiter, Bodenschutz, Buchablagen, Ersatzteile, Transport, Lagerung und schonende Reinigung fachlich einordnen.",
    category: "Zubehör & Pflege", updatedAt: "2026-10-22", status: "published",
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
      { id: "gleiter-bodenschutz", heading: "Gleiter passend zu Gestell und Boden auswählen", paragraphs: [
        "Stuhlgleiter sind Verschleißteile. Rechtzeitig ausgetauscht schützen sie Gestell und Boden; ein unpassender Gleiter kann dagegen schlecht sitzen oder den Boden ungeeignet belasten.",
        "Für die Zuordnung benötigen wir je nach Ausführung Rohrform, Innen- oder Außenmaß, Einbausituation und Bodenart. Fotos und genaue Maße helfen mehr als eine alleinige Modellvermutung.",
      ], link: { href: "/kontakt?anliegen=Gleiter-Beratung", label: "Gleiter persönlich zuordnen", description: "Foto, Rohrform und genaue Maße gemeinsam prüfen lassen." } },
      { id: "reihenverbinder-und-buchablagen", heading: "Reihenverbinder und Buchablagen modellbezogen nachrüsten", paragraphs: [
        "Reihenverbinder und Buchablagen sind kein universell passendes Zubehör. Entscheidend sind Stuhlmodell, Gestellform, Rohrmaß, benötigter Abstand und die vorhandenen Befestigungsmöglichkeiten.",
        "Eine Buchablage für jeweils zwei Sitzplätze kann in manchen Gemeinderäumen eine wirtschaftliche Lösung sein. Ob das zur Nutzung passt und die Stühle nach der Montage stapelbar bleiben, prüfen wir an der konkreten Bestuhlung.",
      ], links: [
        { href: "/wissen/reihenverbinder-fuer-stapelstuehle", label: "Reihenverbinder richtig einplanen", description: "Neubestellung und Nachrüstung fachlich vergleichen." },
        { href: "/produkte/artikel/buchablage-nachruesten", label: "Buchablage zum Nachrüsten", description: "Ausführung und Kompatibilität am vorhandenen Stuhl prüfen." },
      ] },
      { id: "erhalten", heading: "Ersatzteil, Reparatur und Nachbestellung vor Neukauf prüfen", paragraphs: [
        "Verschlissene Gleiter, beschädigte Einzelteile oder ergänzbares Zubehör sind nicht automatisch ein Grund, die gesamte Ausstattung zu ersetzen. Sofern passende Teile und eine fachlich sinnvolle Reparatur verfügbar sind, lässt sich der Bestand häufig weiter nutzen.",
        "Für eine spätere Nachbestellung helfen Modellbezeichnung, Auftragsdaten, Fotos, Maße sowie Angaben zu Farbe und Ausführung. Eine dauerhafte Verfügbarkeit identischer Stoffe, Dekore oder Bauteile können wir nicht garantieren; wir suchen dann nach einer technisch und gestalterisch passenden Lösung.",
      ] },
    ],
    faq: [
      { question: "Wie viele Stühle kann ich stapeln?", answer: "Bis zu ca. 15 Stück sind ein betrieblicher Orientierungswert. Zulässig und sicher ist nur, was Modell, Wagen und Sicherung für den konkreten Einsatz erlauben." },
      { question: "Wie lagere ich Klapptische?", answer: "Trocken, bei normaler Innenraumtemperatur, vor dauerhafter direkter UV-Strahlung geschützt und flach liegend. Nicht längere Zeit an die Wand lehnen." },
      { question: "Kann ich Polster mit Trockenschaum reinigen?", answer: "Nur wenn der konkrete Stoff und sein Pflegehinweis dafür geeignet sind. Zuerst unauffällig testen und nicht durchnässen." },
      { question: "Welche Angaben helfen bei einer Ersatzteilanfrage?", answer: "Modellbezeichnung, frühere Auftragsdaten, Fotos, genaue Maße und die gewünschte Ausführung helfen uns, Gleiter, Zubehör oder eine Reparaturlösung zuzuordnen." },
    ],
    relatedLinks: [
      { href: "/produkte/kategorien/transportwagen-zubehoer", label: "Transport & Zubehör", description: "Wagen, Ersatzteile und Ergänzungen im Sortiment ansehen." },
      { href: "/kontakt?anliegen=Gleiter-Beratung", label: "Gleiter zuordnen lassen", description: "Passende Ersatzgleiter anhand von Foto und Maß persönlich prüfen lassen." },
      { href: "/produkte/artikel/buchablage-nachruesten", label: "Buchablagen", description: "Nachrüstbare Ablagen für geeignete Stuhlgestelle prüfen." },
      { href: "/kontakt?anliegen=Ersatzteile", label: "Ersatzteil anfragen", description: "Vorhandenes Modell und benötigtes Teil gemeinsam zuordnen." },
    ],
  },
  {
    slug: "stoffe-und-bezuege",
    title: "Bezugsstoffe für Stapelstühle: Worauf es wirklich ankommt",
    description: "Orientierung zu Stoffgruppen, Materialien, Martindale, Pflege und Brandschutznachweisen bei gepolsterten Stapelstühlen.",
    category: "Stoffe & Polsterung", updatedAt: "2026-10-22", status: "published",
    body: [
      { id: "industriestoffe", heading: "Industriestoffe für häufig genutzte Sitzmöbel", paragraphs: [
        "Für Stühle in Gemeinden, Veranstaltungsräumen und öffentlichen Einrichtungen verwenden wir Bezugsstoffe, die für eine regelmäßige bis intensive Nutzung vorgesehen sind. Im Sortiment kommen unter anderem Dralon, Trevira, Polyester und Polyamid vor.",
        "Die Materialbezeichnung allein entscheidet nicht über die Eignung. Webart, Flächengewicht, Scheuerbeständigkeit, Lichteinwirkung, Pflege und der gesamte Polsteraufbau müssen zur Nutzung passen.",
      ] },
      { id: "stoffgruppen", heading: "Stoffgruppen sind keine genormten Qualitätsklassen", paragraphs: [
        "Die Gruppen ordnen die verfügbaren Bezüge in unserem Sortiment. Eine höhere Nummer bedeutet nicht automatisch, dass ein Stoff robuster oder für jeden Raum besser geeignet ist.",
        "Ab Gruppe 3 bieten wir in der Regel Stoffoptionen mit passenden B1-Eigenschaften an. Das ist keine automatische Zertifizierung: Entscheidend sind Nachweis, Farbe und Variante des gewählten Stoffes.",
      ] },
      { id: "material-und-abrieb", heading: "Martindale und Abriebfestigkeit richtig einordnen", paragraphs: [
        "Im Sortiment kommen unter anderem Dralon, Trevira, Polyester und Polyamid vor. Typische Orientierungen sind etwa 400 bis 700 Gramm je Laufmeter bei meist rund 1,30 Meter Rollenbreite sowie etwa 40.000 bis 100.000 Martindale-Scheuertouren. Kein Einzelwert gilt automatisch für jede Variante.",
        "Beim Martindale-Verfahren wird die Scheuerbeständigkeit eines Textils unter festgelegten Prüfbedingungen verglichen. Ein höherer Wert kann bei sonst vergleichbaren Stoffen eine höhere Abriebreserve anzeigen, ist aber weder eine Lebensdauergarantie noch alleiniger Qualitätsnachweis.",
        "Frühere pauschale Schwellenwerte für Privat-, Objekt- oder 24-Stunden-Nutzung veröffentlichen wir nicht als allgemeingültige Auswahlregel. Maßgeblich sind die aktuelle technische Angabe des konkreten Stoffes und der vorgesehene Einsatz.",
      ] },
      { id: "pruefhinweis-erfahrungswerte", heading: "Prüfhinweis zu früheren Martindale- und Lebensdauerangaben", paragraphs: [
        "Die alte Informationsseite nannte 10.000 bis 15.000 Scheuertouren für private Nutzung, 30.000 bis 40.000 für Büros oder öffentliche Bereiche und bis zu 500.000 für extreme Belastung. Diese pauschalen Einsatzgrenzen sind ohne Bezug auf die konkrete Prüfnorm, Stoffart und Nutzung keine verlässliche Auswahlregel und müssen vor einer technischen Verwendung geprüft werden.",
        "Dort genannte Nutzungszeiten von mehr als 20 Jahren in Gemeinden oder mindestens fünf Jahren an einzelnen 24-Stunden-Arbeitsplätzen sind Erfahrungsbeispiele, keine zugesicherte Lebensdauer. Sie werden deshalb nicht auf aktuelle Stoffe übertragen.",
      ] },
      { id: "farben-und-gestaltung", heading: "Einfarbige Stoffe bleiben gestalterisch flexibel", paragraphs: [
        "Aus unserer Beratungspraxis empfehlen wir häufig einfarbige Bezüge. Sie lassen sich langfristig leichter mit unterschiedlichen Räumen, Holzschalen und späteren Ergänzungen kombinieren als stark trendgebundene Muster.",
        "Farbe darf trotzdem mutig eingesetzt werden: Unterschiedliche Polster- oder Schalenfarben können Orientierung schaffen und einen Raum lebendig gliedern. Eine spätere identische Nachlieferung hängt jedoch immer von der fortlaufenden Verfügbarkeit der konkreten Kollektion und Farbe ab.",
      ] },
      { id: "nachbestellung-und-reparatur", heading: "Nachbestellung und Reparatur von Anfang an mitdenken", paragraphs: [
        "Bei Reparaturen oder Ergänzungen helfen genaue Angaben zu Stoffkollektion, Farbcode, Modell und ursprünglichem Auftrag. Ein Uni-Stoff erhöht die gestalterische Chance auf eine passende Ergänzung, garantiert aber nicht, dass derselbe Bezug über Jahrzehnte produziert wird.",
        "Ist eine identische Ware nicht mehr verfügbar, prüfen wir gemeinsam eine passende Alternative oder eine sinnvolle gruppenweise Neupolsterung. Verfügbarkeit und technische Eigenschaften werden dafür erneut am konkreten Stoff geprüft.",
      ] },
      { id: "pflege-und-muster", heading: "Pflegehinweise beachten und echte Muster ansehen", paragraphs: [
        "Bei geeigneten Stoffen haben wir gute Erfahrungen mit Textil- oder Teppich-Trockenschaum gemacht. Beachten Sie die Pflegehinweise, testen Sie zunächst an einer unauffälligen Stelle und durchnässen Sie den Bezug nicht.",
        "Farben am Bildschirm sind nicht farbverbindlich. Für Farbe, Haptik und das Zusammenspiel im Raum ist ein echtes Stoffmuster die bessere Grundlage.",
      ] },
    ],
    faq: [
      { question: "Was bedeutet Martindale?", answer: "Martindale ist ein Prüfverfahren für Scheuerbeständigkeit. Der Wert hilft beim Vergleich, garantiert aber keine bestimmte Nutzungsdauer." },
      { question: "Ist ein höherer Martindale-Wert automatisch der bessere Stoff?", answer: "Nein. Scheuertouren sind nur ein Vergleichswert. Material, Webart, Pflege, Lichteinwirkung, Brandschutznachweis und der gesamte Polsteraufbau gehören ebenfalls zur Auswahl." },
      { question: "Warum empfehlen Sie häufig einfarbige Stoffe?", answer: "Uni-Stoffe wirken meist zeitlos und lassen sich leichter mit Raum, Holz und späteren Ergänzungen kombinieren. Eine identische langfristige Nachlieferbarkeit können wir dennoch nicht garantieren." },
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
    category: "Klapptische", updatedAt: "2026-10-22", status: "published",
    body: [
      { id: "nutzung", heading: "Mit Nutzung, Transport und Lagerung beginnen", paragraphs: [
        "Ein Klapptisch sollte zu Reihen, Gruppen- oder Blockstellungen, zu Transportwegen und Lagerfläche passen. Erst aus diesem Zusammenspiel ergeben sich Format, Platte und Gestell.",
        `Unsere üblichen Ausführungen wiegen je nach Größe und Material ungefähr ${estimatedValues.tableWeightKg.min} bis ${estimatedValues.tableWeightKg.max} kg. Den genauen Wert prüfen wir für das gewählte Modell.`,
      ] },
      { id: "standardmasse", heading: "Zwölf Standardmaße, Sondermaße auf Anfrage", paragraphs: [
        "Die folgenden Formate führen wir als Standardgrößen. Zwischenmaße, Sondermaße und Freiformen prüfen wir passend zu Modell und Konstruktion.",
      ], facts: tableDimensionFacts },
      { id: "sitzplatzbedarf", heading: "Pro Sitzplatz mit 60 bis 70 Zentimetern rechnen", paragraphs: [
        "Als praktische Orientierung sollten pro Person mindestens etwa 60 cm Tischbreite eingeplant werden; rund 70 cm bieten spürbar mehr Bewegungsfreiheit. Körpermaße, Stuhlbreite, Geschirr, Unterlagen und die geplante Sitzdauer können den tatsächlichen Bedarf verändern.",
        "Das zeigt der Vergleich: An einer 160 cm langen Seite ergeben drei Plätze rechnerisch nur rund 53,3 cm pro Person. An einer 140 cm langen Seite stehen bei zwei Plätzen jeweils 70 cm zur Verfügung. Der längere Tisch bietet also nicht automatisch den komfortableren einzelnen Sitzplatz.",
        "Kompaktere Tische sind häufig leichter zu bewegen und flexibler zu kombinieren. Ob eine Person sie sicher handhaben kann, hängt jedoch vom konkreten Gewicht, dem Transportweg und den betrieblichen Vorgaben ab.",
      ], facts: [
        { label: "Orientierung", value: "mindestens ca. 60 cm", note: "pro Person und Tischseite" },
        { label: "komfortabler", value: "ca. 70 cm", note: "pro Person und Tischseite" },
        { label: "160 cm / 3", value: "ca. 53,3 cm", note: "vergleichsweise knapp" },
        { label: "140 cm / 2", value: "70 cm", note: "mehr Bewegungsfreiheit" },
      ] },
      { id: "zwei-zu-eins", heading: "Das 2:1-Prinzip erleichtert rechtwinklige Tischblöcke", paragraphs: [
        "Bei einem 2:1-Maß entsprechen zwei Tischbreiten genau einer Tischlänge. Vier gleich große Tische lassen sich dadurch zu einem rechteckigen Block kombinieren, ohne dass an den Anschlüssen ein Versatz oder eine Lücke entsteht. Das ist besonders für wechselnde Gruppenarbeiten und Besprechungen praktisch.",
        "Beim Format 140 × 70 cm ergeben zwei Breiten zusammen genau 140 cm. Bei 160 × 70 cm ergeben zwei Breiten dagegen nur 140 cm; gegenüber der Tischlänge bleibt ein Versatz von 20 cm. Das 2:1-Verhältnis ist ein Planungsvorteil und keine Norm. Andere Maße können für lange Reihen, bestimmte Raumgeometrien oder abweichende Nutzungen besser passen.",
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
      ], link: { href: "/wissen/tischplatten-und-kanten", label: "HPL, Melamin und Tischkanten vergleichen", description: "Oberflächenaufbau, Beanspruchung, Kanten und Pflege im vollständigen Ratgeber nachlesen." } },
    ],
    faq: [
      { question: "Welche Maße erfüllen das 2:1-Prinzip?", answer: "140 × 70, 150 × 75 und 160 × 80 cm erfüllen es exakt. 160 × 70 cm nicht. Das Verhältnis ist eine Planungshilfe, keine Norm." },
      { question: "Wie viel Tischbreite sollte ich pro Person einplanen?", answer: "Mindestens etwa 60 cm sind eine praktische Orientierung, ungefähr 70 cm bieten mehr Bewegungsfreiheit. Stuhl, Nutzung und Ausstattung auf dem Tisch können den Bedarf verändern." },
      { question: "Welches Gestell passt für Tischreihen?", answer: "Für lange Tischreihen empfehlen wir in der Regel K1 oder K2, weil ihre vertikalen Rohre leicht zurückgesetzt sind. Für überwiegend einzeln genutzte Tische oder regelmäßig genutzte Stirnseiten empfehlen wir K3 oder K4. Wir prüfen Verfügbarkeit und Eignung am gewählten Modell." },
      { question: "Wie schwer ist ein Klapptisch?", answer: "Übliche Ausführungen liegen als Orientierung bei ca. 23–32 kg, abhängig von Material, Modell und Größe. Den konkreten Wert bitte für die gewählte Ausführung prüfen." },
      { question: "Sind Zwischen- und Sondermaße möglich?", answer: "Ja, abhängig von Modell und Konstruktion. Beim Modell 210 liegt die konstruktive Obergrenze bei 140 × 70 cm; kleinere Kombinationen prüfen wir für Ihre Anfrage." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Klapptische im Sortiment", description: "Aktuelle Modelle und verfügbare Ausführungen ansehen." },
      { href: "/wissen/tischplatten-und-kanten", label: "HPL, Melamin & Tischkanten", description: "Oberflächen und Kanten passend zur Beanspruchung auswählen." },
      { href: modelSpecific.table210.href, label: modelSpecific.table210.label, description: "Das kompakte Seminar-Modell im Produktbereich prüfen." },
      { href: "/raumplaner", label: "Raumplaner", description: "Eine mögliche Aufstellung unverbindlich vorbereiten." },
    ],
  },
  {
    slug: "tischplatten-und-kanten",
    title: "HPL, Melamin und Tischkanten sachlich auswählen",
    description: "HPL, Melamin, Tischkanten, Muster und Pflege im praktischen Vergleich.",
    category: "Klapptische", updatedAt: "2026-10-22", status: "published",
    body: [
      { id: "oberflaechen", heading: "HPL und Melamin unterscheiden sich im Aufbau", paragraphs: [
        "Bei einer melamindirektbeschichteten Platte wird das dekorative, harzgetränkte Papier direkt mit dem Trägermaterial verpresst. Das ergibt eine wirtschaftliche, pflegeleichte Oberfläche für leichte bis mittlere Beanspruchung.",
        "HPL – High Pressure Laminate oder Hochdruckschichtstoff – besteht aus mehreren unter Druck und Wärme verpressten, harzgetränkten Papierschichten. Dieser separate Schichtstoff wird mit dem Trägermaterial verbunden und bietet üblicherweise eine höhere Reserve gegen Abrieb, Kratzer und Stöße.",
      ] },
      { id: "einsatz", heading: "Beanspruchung und Nutzung entscheiden", paragraphs: [
        "Melamin kann für weniger stark beanspruchte Möbel und preisbewusste Projekte passend sein. Bei häufig bewegten Tischen in Gemeinden, Seminarräumen, Kantinen oder Veranstaltungsbereichen empfehlen wir in der Regel HPL, weil die Oberfläche für eine höhere Alltagsbeanspruchung ausgelegt ist.",
        "Nicht jede HPL- oder Melaminausführung ist identisch. Dekor, Oberflächenstruktur, Trägerplatte, Verklebung, Kante und Pflege wirken zusammen. Die Wahl sollte deshalb immer am konkreten Tischmodell und Einsatz erfolgen.",
      ] },
      { id: "pruefhinweis", heading: "Prüfhinweis zu pauschalen Altangaben", paragraphs: [
        "Die alte Informationsseite nannte für Melamin typischerweise 0,1 bis 0,3 mm und für HPL 0,5 bis 1,5 mm oder mehr. Außerdem schrieb sie HPL pauschal ein Vielfaches an Belastbarkeit oder Härte sowie allgemeine Hitze- und Chemikalienbeständigkeit zu. Solche Werte hängen von Produkt, Prüfverfahren und Herstellerangabe ab und werden deshalb nicht als allgemeingültige technische Zusage übernommen.",
        "Auch eine frühere Aussage zur Widerstandsdauer gegen Zigarettenglut muss für die konkrete Oberfläche anhand aktueller Produktdaten geprüft werden. Für Ihr Angebot klären wir die verfügbare Plattenausführung und die dazugehörigen technischen Angaben.",
      ] },
      { id: "kanten", heading: "Die Kante schützt und prägt die Haptik", paragraphs: [
        "Je nach Produkt kommen beispielsweise robuste Kunststoffkanten mit Dekor oder echte Holzkanten infrage. Holzkanten wirken natürlich und lassen sich passend zur Gestaltung beizen; Kunststoffkanten können stoßfest, pflegeleicht und optisch auf die Platte abgestimmt sein.",
        "Material, Radius, Verklebung und Verarbeitung müssen zur konkreten Ausführung passen. Eine echte Holzkante ist nicht automatisch nachhaltiger, und keine Kantenart ist in jeder Nutzung überlegen.",
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
      { question: "Ist HPL grundsätzlich besser als Melamin?", answer: "Nicht für jede Aufgabe, aber für häufig und intensiv genutzte Klapptische empfehlen wir in der Regel HPL. Melamin kann bei leichterer Beanspruchung eine wirtschaftliche Lösung sein. Entscheidend ist die konkrete Plattenausführung." },
      { question: "Wie belastbar oder hitzebeständig ist HPL genau?", answer: "Das lässt sich nicht seriös für jedes HPL pauschalisieren. Schichtstoff, Trägerplatte, Verklebung und Prüfverfahren unterscheiden sich; konkrete Kennwerte prüfen wir anhand der aktuellen Produktunterlagen." },
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
