import type { GuideArticle } from "@/lib/knowledge/types";

export const guideArticles = [
  {
    slug: "stoffe-und-bezuege",
    title: "Bezugsstoffe für Stapelstühle: Worauf es wirklich ankommt",
    description:
      "Orientierung zu Stoffgruppen, Materialien, Martindale, Stoffgewicht und Brandschutz bei gepolsterten Stapelstühlen.",
    category: "Stoffe & Materialien",
    updatedAt: "2026-10-09",
    status: "published",
    body: [
      {
        id: "stoffgruppen",
        heading: "Was bedeuten die Stoffgruppen?",
        paragraphs: [
          "Stoffgruppen ordnen die verfügbaren Bezüge innerhalb des Dalemans-Sortiments. Sie sind keine genormten Qualitätsklassen. Eine höhere Gruppennummer bedeutet deshalb nicht automatisch, dass ein Stoff in jeder Hinsicht robuster oder für jeden Raum besser geeignet ist.",
          "Für die Auswahl zählt die konkrete Variante: Wie häufig werden die Stühle genutzt? Wie sollen sie gereinigt werden? Welche Farbe und Haptik passen in den Raum? Und müssen bestimmte Nachweise zum Brandverhalten vorliegen?",
        ],
      },
      {
        id: "materialien-gewicht",
        heading: "Material und Gewicht richtig einordnen",
        paragraphs: [
          "Dalemans setzt Bezugsstoffe für intensive Nutzung aus Dralon, Trevira, Polyester oder Polyamid ein. Die angebotenen Stoffe liegen typischerweise bei etwa 400 bis 700 Gramm je Laufmeter und meist rund 1,30 Meter Rollenbreite. Rechnerisch entspricht das ungefähr 308 bis 538 Gramm pro Quadratmeter. Diese Spanne beschreibt das Sortiment, nicht jede einzelne Variante.",
          "Das Gewicht allein ist kein Qualitätsurteil. Faserart, Gewebekonstruktion, Verarbeitung und die Nutzung im Alltag wirken zusammen. Konkrete Material- und Pflegeangaben sollten deshalb immer am ausgewählten Stoff geprüft werden.",
        ],
      },
      {
        id: "martindale",
        heading: "Was sagen 40.000 bis 100.000 Scheuertouren?",
        paragraphs: [
          "Beim Martindale-Verfahren wird die Scheuerbeständigkeit eines Stoffes unter festgelegten Laborbedingungen geprüft. Die von Dalemans eingesetzten Bezüge erreichen typischerweise etwa 40.000 bis 100.000 Scheuertouren. Der Einzelwert gehört jedoch immer zur konkreten Stoffvariante.",
          "Martindale ist ein hilfreicher Vergleichswert, aber keine Garantie für eine bestimmte Zahl von Nutzungsjahren. Beanspruchung, Pflege, Licht, Nähte und der gesamte Polsteraufbau beeinflussen die tatsächliche Lebensdauer.",
        ],
      },
      {
        id: "brandschutz",
        heading: "B1 und Polsterverbund: Nachweise vor der Auswahl klären",
        paragraphs: [
          "Stoffe der Dalemans-Stoffgruppe 3 sind nach Unternehmensangaben in der Regel mit B1-Eigenschaften erhältlich. B1 bezeichnet im Zusammenhang mit DIN 4102-1 einen schwer entflammbaren Baustoff. Das ist keine pauschale Zusicherung für jede Farbe, jede Variante oder einen vollständigen Stuhl.",
          "Ein Nachweis für den Bezugsstoff belegt nicht automatisch das Brandverhalten aus Bezug, Polsterung und Trägermaterial. Je nach Gebäude, Nutzung und Brandschutzkonzept können weitere Prüfungen des Polsterverbunds verlangt werden. Maßgeblich sind die konkrete Ausführung, die vorliegenden Dokumente und die Vorgaben der zuständigen Fachplanung oder Behörde.",
        ],
      },
      {
        id: "auswahl",
        heading: "Welche Stoffe passen zu Ihrem Raum?",
        paragraphs: [
          "In häufig umgebauten Gemeinde- und Veranstaltungsräumen stehen robuste, pflegegerechte Oberflächen im Vordergrund. In Seminar- oder Besprechungsräumen können Haptik, Sitzkomfort und die ruhige Einbindung in das Farbkonzept stärker zählen.",
          "Dalemans unterstützt bei der Auswahl und stellt Stoffmuster auf Anfrage bereit. Wenn Brandschutzanforderungen bestehen, nennen Sie uns diese bitte vor der Bestellung, damit verfügbare Varianten und Nachweise konkret geprüft werden können.",
        ],
      },
    ],
    faq: [
      {
        question: "Sind Stoffgruppen genormte Qualitätsklassen?",
        answer: "Nein. Die Gruppen strukturieren das jeweilige Sortiment. Technische Eigenschaften lassen sich nur aus den Angaben und Nachweisen der konkreten Stoffvariante ableiten.",
      },
      {
        question: "Was bedeutet Martindale bei Polsterstoffen?",
        answer: "Martindale ist ein standardisiertes Prüfverfahren für Scheuerbeständigkeit. Der Laborwert hilft beim Vergleich, garantiert aber keine bestimmte Nutzungsdauer.",
      },
      {
        question: "Ist ein schwererer Bezugsstoff grundsätzlich besser?",
        answer: "Nein. Faser, Webart, Verarbeitung und Abriebfestigkeit sind ebenfalls wichtig. Das Stoffgewicht allein reicht als Qualitätsmaßstab nicht aus.",
      },
      {
        question: "Ist Stoffgruppe 3 automatisch B1?",
        answer: "Nein. Entsprechende Varianten sind in dieser Gruppe in der Regel erhältlich. Entscheidend ist der Nachweis für den ausgewählten Stoff; ein B1-Bezug allein weist zudem nicht den vollständigen Polsterstuhl nach.",
      },
      {
        question: "Kann ich Stoffmuster erhalten?",
        answer: "Ja. Dalemans bietet eine persönliche Stoff- und Farbberatung und stellt Stoffmuster auf Anfrage bereit.",
      },
    ],
    relatedLinks: [
      { href: "/wissen/stoffkarten", label: "Stoffkarten ansehen", description: "Verfügbarkeit der Stoffgruppen 2, 3 und 4 prüfen." },
      { href: "/produkte/stapelstuehle", label: "Stapelstühle", description: "Modelle und Polstervarianten im Sortiment ansehen." },
    ],
  },
  {
    slug: "klapptische-richtig-waehlen",
    title: "Klapptische richtig wählen und im Raum planen",
    description:
      "Praxisnahe Orientierung zu Tischmaß, Platzbedarf, Reihen- und Einzelstellung sowie den Gestellvarianten K1 bis K4.",
    category: "Klapptische",
    updatedAt: "2026-10-09",
    status: "published",
    body: [
      {
        id: "nutzung",
        heading: "Mit der Nutzung beginnen, nicht mit dem Einzelmaß",
        paragraphs: [
          "Ein Klapptisch sollte zu den Abläufen im Raum passen: zu Reihen, Gruppen- oder Blockstellungen, zu den Transportwegen und zur verfügbaren Lagerfläche. Erst aus diesem Zusammenspiel ergibt sich eine sinnvolle Größe und Gestellform.",
          "Dalemans empfiehlt 140 × 70 cm häufig als vielseitiges Praxismaß. Es lässt sich gut in Reihen einsetzen und erleichtert Blockstellungen im 2:1-Raster. Das ist eine Planungsempfehlung aus der Praxis, keine allgemeine Norm und keine Vorgabe für jedes Projekt.",
        ],
      },
      {
        id: "platzbedarf",
        heading: "60 bis 70 Zentimeter pro sitzender Person einplanen",
        paragraphs: [
          "Als erste Orientierung können etwa 60 Zentimeter Tischbreite je sitzender Person angesetzt werden. Rund 70 Zentimeter schaffen mehr Bewegungsfreiheit und werden von Dalemans bevorzugt, wenn Raum und Aufstellung es zulassen.",
          "Für eine belastbare Planung kommen Stuhlabmessungen, Durchgänge, Bedienwege und die Art der Veranstaltung hinzu. Der Wert ersetzt daher keine konkrete Raum- oder Fluchtwegplanung.",
        ],
      },
      {
        id: "gestelle",
        heading: "Reihenstellung oder frei stehender Tisch?",
        paragraphs: [
          "Nach der Dalemans-Praxiserfahrung eignen sich die Gestellvarianten K1 und K2 besonders für Tische, die in Reihen stehen. Die Varianten K3 und K4 werden eher für einzeln gestellte Tische und Situationen mit Sitzplätzen an den Stirnseiten empfohlen.",
          "Welche Gestelle aktuell für ein bestimmtes Tischmodell und Maß angeboten werden, muss am konkreten Produkt geprüft werden. Die Zuordnung beschreibt eine Auswahlhilfe und keine zugesicherte Eigenschaft jedes heutigen Modells.",
        ],
      },
      {
        id: "planung",
        heading: "Aufstellung, Transport und Lagerung zusammen denken",
        paragraphs: [
          "Wiederkehrende Aufstellungen profitieren von wenigen, gut kombinierbaren Tischformaten. Gleichzeitig sollten Gewicht, Griffmöglichkeiten, Türbreiten, Transportwagen und der Lagerweg berücksichtigt werden.",
          "Mit Maßen, gewünschter Personenzahl und einer Skizze des Raums kann Dalemans die Auswahl eingrenzen und verschiedene Aufstellungen gemeinsam prüfen.",
        ],
      },
    ],
    faq: [
      { question: "Ist 140 × 70 cm immer das richtige Tischmaß?", answer: "Nein. Dalemans nutzt es als vielseitige Praxisempfehlung. Nutzung, Raum, Personenzahl, Transport und Lagerung können ein anderes Maß sinnvoll machen." },
      { question: "Wie viel Platz braucht eine Person am Tisch?", answer: "Etwa 60 Zentimeter sind eine erste Orientierung; rund 70 Zentimeter bieten mehr Komfort. Stuhlbreite, Durchgänge und die konkrete Nutzung müssen zusätzlich berücksichtigt werden." },
      { question: "Welche Gestelle eignen sich für Reihen?", answer: "K1 und K2 werden von Dalemans dafür bevorzugt. K3 und K4 können bei Einzelstellung und Sitzplätzen an Stirnseiten Vorteile haben. Die aktuelle Verfügbarkeit ist modellabhängig." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Klapptische im Sortiment", description: "Verfügbare Tischmodelle und Ausführungen ansehen." },
      { href: "/raumplaner", label: "Raumplaner", description: "Eine mögliche Aufstellung im eigenen Raum vorbereiten." },
      { href: "/wissen/tischplatten-und-kanten", label: "Tischplatten & Kanten", description: "Oberflächen und Kanten passend zum Alltag auswählen." },
    ],
  },
  {
    slug: "tischplatten-und-kanten",
    title: "Tischplatten und Kanten sachlich auswählen",
    description:
      "HPL und Melamin, Tischkanten und Reinigung im praktischen Vergleich – ohne pauschale Qualitätsversprechen.",
    category: "Klapptische",
    updatedAt: "2026-10-09",
    status: "published",
    body: [
      {
        id: "oberflaechen",
        heading: "HPL und Melamin sind unterschiedliche Oberflächen",
        paragraphs: [
          "HPL und melaminharzbeschichtete Platten werden in unterschiedlichen Aufbauten und Ausführungen angeboten. HPL ist ein separat gefertigtes Schichtmaterial, das auf eine Trägerplatte aufgebracht wird. Bei einer Melaminoberfläche wird dekoriertes Papier mit Harz direkt mit der Platte verpresst.",
          "Aus der Bezeichnung allein folgt keine pauschale Überlegenheit für jeden Einsatzzweck. Entscheidend sind die konkrete Produktkonstruktion, die Beanspruchung, das gewünschte Dekor, Pflegeanforderungen und das verfügbare Budget.",
        ],
      },
      {
        id: "einsatz",
        heading: "Die tatsächliche Nutzung entscheidet",
        paragraphs: [
          "Bei häufigem Auf- und Abbau sind neben der Oberfläche auch Plattengewicht, Kanten, Gestell, Beschläge und Transportweg wichtig. Für dauerhaft ruhige Aufstellungen können andere Prioritäten gelten als für einen Mehrzweckraum mit wöchentlichen Umbauten.",
          "Technische Eigenschaften sollten immer anhand des aktuell angebotenen Tischmodells und seiner Ausführung geprüft werden. Nicht jede beschriebene Kante oder Oberfläche ist automatisch für jedes Modell erhältlich.",
        ],
      },
      {
        id: "kanten",
        heading: "Tischkanten schützen und prägen die Haptik",
        paragraphs: [
          "Die Kante schützt den Plattenrand und beeinflusst, wie sich ein Tisch beim Anfassen und Umstellen anfühlt. Je nach Produkt können beispielsweise Kunststoff- oder Holzkanten eingesetzt werden. Material, Radius und Verarbeitung müssen zur konkreten Ausführung passen.",
          "Eine bestimmte Kantenart ist nicht automatisch in jeder Situation besser. Für die Auswahl zählen Stoßbeanspruchung, Reinigungsabläufe, Optik und die Frage, wie oft Tische bewegt oder zusammengestellt werden.",
        ],
      },
      {
        id: "reinigung",
        heading: "Schonend reinigen und Feuchtigkeit an Kanten vermeiden",
        paragraphs: [
          "Für die regelmäßige Reinigung genügen häufig ein weiches Tuch und eine milde, für die jeweilige Oberfläche geeignete Reinigungslösung. Flüssigkeit sollte nicht längere Zeit auf der Platte stehen oder in Fugen und beschädigte Kanten gelangen.",
          "Scheuernde Mittel, aggressive Reiniger und harte Schwämme können Oberflächen verändern. Verbindlich sind die Pflegehinweise des konkreten Produkts; bei unbekannten Mitteln empfiehlt sich ein Test an unauffälliger Stelle.",
        ],
      },
    ],
    faq: [
      { question: "Ist HPL grundsätzlich besser als Melamin?", answer: "Nein. HPL und Melamin sind unterschiedliche Lösungen. Welche passt, hängt von Produktaufbau, Nutzung, gewünschter Oberfläche und Budget ab." },
      { question: "Hat jeder Dalemans-Tisch eine Holzkante?", answer: "Nein. Kanten und Oberflächen sind modell- und variantenabhängig. Die aktuelle Ausführung muss am konkreten Produkt geprüft werden." },
      { question: "Wie reinige ich eine Tischplatte?", answer: "Üblicherweise schonend mit weichem Tuch und geeignetem mildem Reiniger. Flüssigkeit an Fugen und Kanten sowie scheuernde oder aggressive Mittel sollten vermieden werden. Maßgeblich bleibt die produktspezifische Pflegeangabe." },
    ],
    relatedLinks: [
      { href: "/produkte/sortiment/klapptische", label: "Tische im Sortiment", description: "Aktuelle Modelle und nachgewiesene Ausführungen ansehen." },
      { href: "/wissen/klapptische-richtig-waehlen", label: "Klapptische richtig wählen", description: "Maße, Platzbedarf und Gestelle in die Planung einbeziehen." },
    ],
  },
] as const satisfies readonly GuideArticle[];

export function getPublishedGuides() {
  return guideArticles.filter((article) => article.status === "published");
}

export function getPublishedGuide(slug: string) {
  return getPublishedGuides().find((article) => article.slug === slug);
}
