import { company } from "@/lib/company";

export const shippingNotice = "Zuzüglich Versand- und gegebenenfalls Montagekosten. Die Kosten richten sich nach Lieferort, Menge und Lieferumfang und werden im individuellen Angebot vor einer verbindlichen Bestellung ausgewiesen.";

export const withdrawalReviewNotice = "Entwurf zur rechtlichen Prüfung. Vor Verwendung im einzelnen Vertrag sind Lieferfall, Rücksendeweg und Rücksendekosten festzulegen und die passende Belehrung samt Formular auf einem dauerhaften Datenträger bereitzustellen. Diese allgemeinen Informationen ersetzen die vertragsbezogene Belehrung nicht.";

export const withdrawalText = `
## 1. Widerrufsrecht für Verbraucher

Bei Fernabsatzverträgen und außerhalb von Geschäftsräumen geschlossenen Verträgen über Waren steht Verbrauchern grundsätzlich das Recht zu, den Vertrag innerhalb von 14 Tagen ohne Begründung zu widerrufen. Unternehmer haben dieses gesetzliche Verbraucherwiderrufsrecht nicht. Eine unverbindliche Anfrage ist noch kein Vertrag und muss nicht widerrufen werden.

Die Frist beginnt bei einem Warenkauf mit Erhalt der Ware durch Sie oder einen von Ihnen benannten Dritten, der nicht der Beförderer ist. Werden mehrere Waren einer einheitlichen Bestellung getrennt geliefert, zählt der Erhalt der letzten Ware; bei einer Ware in mehreren Teilsendungen oder Stücken zählt der Erhalt der letzten Teilsendung oder des letzten Stücks. Voraussetzung für den Fristbeginn ist außerdem die ordnungsgemäße Widerrufsbelehrung. Bei fehlender oder fehlerhafter Belehrung gelten die gesetzlichen verlängerten Fristen, grundsätzlich bis zu zwölf Monate und 14 Tage.

## 2. Widerruf erklären

Richten Sie Ihren Widerruf an: ${company.legalName}, ${company.address.streetAddress}, ${company.address.postalCode} ${company.address.addressLocality}, Deutschland; E-Mail: ${company.email}; Telefon: ${company.telephone}.

Teilen Sie uns eindeutig mit, dass Sie den Vertrag widerrufen möchten, beispielsweise per Brief oder E-Mail. Das unten stehende Formular kann verwendet werden, ist aber nicht vorgeschrieben. Die rechtzeitige Absendung der Widerrufserklärung vor Fristablauf genügt. Eine Begründung oder vorherige Genehmigung ist nicht erforderlich.

## 3. Rückzahlung und Rückgabe

Nach wirksamem Widerruf sind erhaltene Zahlungen einschließlich der Kosten der günstigsten angebotenen Standardlieferung spätestens innerhalb von 14 Tagen nach Eingang der Widerrufserklärung zurückzuzahlen. Mehrkosten einer von Ihnen gewählten teureren Lieferung sind davon ausgenommen. Die Rückzahlung erfolgt mit dem ursprünglichen Zahlungsmittel, sofern nicht ausdrücklich etwas anderes vereinbart wurde, und ohne Rückzahlungsentgelt.

Sofern wir keine Abholung angeboten haben, dürfen wir die Erstattung bis zum Wareneingang oder bis zum Nachweis der Rücksendung zurückhalten; der frühere Zeitpunkt zählt. Waren sind unverzüglich, spätestens binnen 14 Tagen nach Erklärung des Widerrufs an die oben genannte Anschrift zurückzusenden oder zu übergeben, sofern keine Abholung angeboten wurde. Rechtzeitiges Absenden wahrt diese Rückgabefrist.

Verbraucher tragen unmittelbare Rücksendekosten nur, wenn sie darüber ordnungsgemäß vor ihrer Vertragserklärung informiert wurden. Bei nicht normal per Post rücksendbaren Waren, insbesondere Speditionsmöbeln, sind dabei auch die konkreten Kosten oder eine begründete Höchstschätzung anzugeben. Diese Angaben sind auftragsbezogen noch zu bestätigen; es wird hier weder eine Kostenübernahme durch den Verbraucher noch eine Kostenhöhe pauschal festgelegt. Ohne die erforderliche Information können Rücksendekosten nicht auf Verbraucher abgewälzt werden. Gesetzliche Abholpflichten bei außerhalb von Geschäftsräumen geschlossenen Verträgen bleiben unberührt.

Für Wertverluste müssen Sie nur einstehen, soweit diese durch einen Umgang mit den Waren verursacht wurden, der zur Prüfung von Beschaffenheit, Eigenschaften und Funktionsweise nicht erforderlich war, und Sie ordnungsgemäß über Ihr Widerrufsrecht unterrichtet wurden.

## 4. Sonderanfertigungen und gesetzliche Ausnahmen

Ein Widerrufsrecht kann nach § 312g Abs. 2 Nr. 1 BGB ausgeschlossen sein, wenn Waren nicht vorgefertigt sind und eine individuelle Auswahl oder Bestimmung des Verbrauchers für ihre Herstellung maßgeblich ist oder wenn Waren eindeutig auf persönliche Bedürfnisse zugeschnitten sind. Eine Bezeichnung als Sonderanfertigung oder die Auswahl aus Varianten reicht für einen pauschalen Ausschluss nicht aus. Ob die gesetzlichen Voraussetzungen erfüllt sind, ist je Auftrag zu prüfen und vor der verbindlichen Vertragserklärung mitzuteilen. Gewährleistungsrechte bleiben bestehen.

## 5. Muster-Widerrufsformular

(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)

An ${company.legalName}, ${company.address.streetAddress}, ${company.address.postalCode} ${company.address.addressLocality}, Deutschland, ${company.email}:

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)

________________________

Bestellt am (*)/erhalten am (*)

________________________

Name des/der Verbraucher(s)

________________________

Anschrift des/der Verbraucher(s)

________________________

Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)

________________________

Datum

________________________

(*) Unzutreffendes streichen.
`;
