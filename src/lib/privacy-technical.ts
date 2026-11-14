import { company } from "@/lib/company";

export const technicalPrivacyText = `
## 1. Verantwortlicher

${company.legalName}
${company.address.streetAddress}
${company.address.postalCode} ${company.address.addressLocality}, Deutschland
Telefon: ${company.telephone}
Mobil: ${company.mobile}
E-Mail: ${company.email}

## 2. Bereitstellung der Website und Hosting

Wir nutzen Netlify für die Bereitstellung dieser Website und die serverseitige Bearbeitung unserer Online-Formulare. Dabei werden technisch erforderliche Verbindungs- und Protokolldaten verarbeitet, insbesondere IP-Adresse, Zeitpunkt und Ziel einer Serveranfrage sowie technische Angaben zu Browser, Betriebssystem und Status- oder Fehlerdaten. Beim Absenden eines Formulars werden auch dessen Inhalte auf der Hosting-Infrastruktur verarbeitet.

Dies dient der sicheren, stabilen Bereitstellung der Website, der Fehleranalyse und der Abwehr von Missbrauch. Rechtsgrundlage für den sicheren Betrieb ist Art. 6 Abs. 1 Buchst. f DSGVO. Für Formularinhalte gelten ergänzend die nachfolgend genannten Rechtsgrundlagen.

Netlify, Inc., USA, verarbeitet Website- und Formulardaten als Auftragsverarbeiter für uns. Davon zu unterscheiden ist Netlifys eigene Verarbeitung etwa von Vertrags- und Kontodaten seiner Kunden. Die eigene Datenschutzerklärung von Netlify ersetzt daher nicht die Auftragsverarbeitungsbedingungen. Protokolldaten unterliegen je nach Protokollart unterschiedlichen Speicherzeiten; eine einheitliche Löschfrist besteht nicht. Weitere Angaben enthalten die unten verlinkten Anbieterunterlagen.

## 3. Kontakt- und Produktanfragen

Beim Absenden des Kontaktformulars verarbeiten wir Vorname, Nachname, gegebenenfalls Organisation, E-Mail-Adresse und/oder Telefonnummer, Betreff und Nachricht. Bei produktbezogenen Anfragen können Produkt, Variante, Menge und weitere von Ihnen übernommene Angaben hinzukommen. Zur Erkennung unerwünschter und doppelter Übermittlungen werden außerdem eine technische Anfragekennung und ein verborgenes Prüffeld verarbeitet.

Die Daten dienen der Zuordnung und Beantwortung Ihrer Anfrage und der Vorbereitung eines Angebots. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO bei vorvertraglichen Maßnahmen oder einem Vertrag mit Ihnen. Sonstige Anfragen und die Kommunikation mit Ansprechpartnern von Organisationen bearbeiten wir nach Art. 6 Abs. 1 Buchst. f DSGVO aufgrund unseres berechtigten Interesses an der Beantwortung eingehender Nachrichten und der geschäftlichen Kommunikation. Pflichtangaben sind erforderlich, damit wir Ihre Anfrage bearbeiten können.

## 4. Warenkorb, Gleiter-Finder und Raumplanung

Der Anfragekorb dient ausschließlich der Vorbereitung einer unverbindlichen Angebotsanfrage. Er löst keine Bestellung und keine Zahlung aus. Beim Absenden verarbeiten wir Kundenart, Vorname, Nachname, E-Mail-Adresse, gegebenenfalls Organisation, Telefonnummer, Liefer-Postleitzahl und Nachricht sowie ausgewählte Produkte, Varianten, Mengen, Ausstattungen und Preisangaben.

Der Gleiter-Finder verwendet Ihre Auswahl und Angaben zum Produkteinsatz zur Ermittlung geeigneter Produkte. Soweit Sie diese Angaben in den Anfragekorb oder eine Kontaktanfrage übernehmen und absenden, werden sie zusammen mit der Anfrage verarbeitet. Beim Öffnen einer weiterführenden Produkt- oder Kontaktseite können auch technische Angaben und Ihre Freitextangaben in deren Adresse übernommen werden und dadurch in Browserchronik und Serverprotokollen erscheinen.

Raumplaner-Projekte werden im Browser Ihres Geräts gespeichert. Wenn Sie die Anfragefunktion nutzen, werden Projektname, Möbelbedarf und Angaben zur Planung in das Kontaktformular übernommen. Diese Angaben stehen dabei auch in der aufgerufenen Kontaktadresse und können dadurch in Browserchronik und Serverprotokollen erscheinen. Die Nachricht an Dalemans senden Sie anschließend über das Formular. Ein lokaler Export oder Ausdruck übermittelt für sich genommen keine Planungsdaten an Dalemans.

Zweck ist die Beratung, Bedarfsplanung und Angebotserstellung. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO bei vorvertraglichen Maßnahmen oder der Vertragserfüllung und Art. 6 Abs. 1 Buchst. f DSGVO bei der Kommunikation mit Ansprechpartnern von Organisationen. Für Sicherheitsmaßnahmen gilt ebenfalls Art. 6 Abs. 1 Buchst. f DSGVO.

## 5. E-Mail-Versand über IONOS

Für die E-Mail-Kommunikation nutzen wir IONOS SE, Elgendorfer Straße 57, 56410 Montabaur, Deutschland. Kontakt- und Warenkorbanfragen werden über eine verschlüsselte Verbindung an den E-Mail-Versanddienst übermittelt. Bei Warenkorbanfragen versucht das System zusätzlich, eine Eingangsbestätigung an Ihre E-Mail-Adresse zu senden. Dabei werden Absender- und Empfängeradressen, Betreff, Nachrichteninhalt, Anfrage- und Produktangaben sowie technisch erforderliche Versanddaten verarbeitet. An der Zustellung sind auch die E-Mail-Anbieter der Empfänger beteiligt.

IONOS verarbeitet Nachrichten im Rahmen der Bereitstellung des E-Mail-Dienstes für uns. Die Rechtsgrundlagen entsprechen denen der jeweiligen Anfrage; für gesetzlich erforderliche Aufbewahrungen gilt Art. 6 Abs. 1 Buchst. c DSGVO. Die eigene Vertrags- und Kundenverwaltung von IONOS ist davon zu unterscheiden. Die Auftragsverarbeitung ist Gegenstand gesonderter Vertragsbedingungen. Das Hosting dieser Website erfolgt über Netlify.

## 6. Schutz vor Missbrauch und doppelten Übermittlungen

Wir nutzen Upstash Redis, einen Dienst von Upstash, Inc., USA, um automatisierte Massenanfragen und doppelte E-Mails zu verhindern. Dazu wird die über die Hosting-Plattform ermittelte IP-Adresse auf unserem Server mit einem geheimen Zusatz in eine Kennung umgewandelt. Die ungekürzte IP-Adresse wird von unserer Anwendung nicht in dieser Datenbank gespeichert. Die Kennung ist pseudonym und nicht automatisch anonym.

Gespeichert werden technische Kennungen, Zähler und Bearbeitungsergebnisse. Zähler zur Begrenzung von Sendeversuchen verfallen nach 15 Minuten. Einträge zur Vermeidung doppelter Kontaktanfragen verfallen nach 10 Minuten, solche zu Warenkorbanfragen nach 24 Stunden. Bei Warenkorbanfragen umfasst das Ergebnis die Anfrage-ID und den Status der Eingangsbestätigung. Auch Reservierungen für laufende Übermittlungen unterliegen der jeweiligen Ablaufzeit. Namen, E-Mail-Adressen und Nachrichtentexte werden von unserer Anwendung nicht in Redis gespeichert.

Upstash verarbeitet diese Daten als Auftragsverarbeiter. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO; unser berechtigtes Interesse liegt im Schutz der Website und der zuverlässigen Bearbeitung Ihrer Anfragen. Die genannten Fristen betreffen unsere Datenbankeinträge, nicht sämtliche Betriebsprotokolle oder Sicherungen des Dienstleisters.

## 7. Speicherung von Kunden- und Anfragedaten

Übermittelte Formulardaten werden als E-Mail in den für die Bearbeitung vorgesehenen Postfächern verarbeitet. Wir speichern Anfragen so lange, wie dies für ihre Bearbeitung und gegebenenfalls die anschließende Vertragsabwicklung erforderlich ist. Danach werden die Daten gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten oder berechtigten Gründe, etwa die Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen, entgegenstehen. Für aufbewahrungspflichtige Geschäfts- und Vertragsunterlagen richtet sich die Dauer nach den anwendbaren handels- und steuerrechtlichen Vorschriften. Besondere Ablaufzeiten für den Formularschutz sind in Abschnitt 6 beschrieben.

## 8. Speicherung im Browser

Die Website verwendet lokalen Browserspeicher, um den Anfragekorb, die Preisansicht und Funktionen des Raumplaners bereitzustellen. Die gespeicherten Angaben werden nicht allein durch ihre lokale Speicherung an uns übermittelt. Wir setzen keine eigenen Cookies zur Reichweitenmessung oder Werbung ein.

- dlmns-commerce-cart: Produkte, Varianten, Mengen und gegebenenfalls Angaben aus dem Gleiter-Finder;
- dlmns-customer-price-mode: Darstellung für Privat- oder Geschäftskunden; diese Einstellung wird bereits beim Laden der Website gelesen und gespeichert;
- dalemans-room-planner-projects-v1: Projektname, Raumgeometrie, Möbel, Einstellungen und Zeitangaben;
- dlmns-room-planner-help-v1: Einstellungen der Raumplaner-Hilfe.

Diese Einträge haben keine automatische Ablaufzeit. Sie bleiben gespeichert, bis sie über die jeweilige Funktion oder durch Löschen der Browserdaten entfernt werden. Auf gemeinsam genutzten Geräten können andere Nutzer desselben Browserprofils darauf zugreifen. Für ausdrücklich gewünschte, technisch erforderliche Speicherfunktionen gilt § 25 Abs. 2 Nr. 2 TDDDG. Soweit dabei personenbezogene Daten verarbeitet werden, dient dies der Bereitstellung der jeweiligen Funktion auf Grundlage von Art. 6 Abs. 1 Buchst. b oder f DSGVO.

## 9. Reichweitenmessung und externe Inhalte

Wir verwenden keine Analyse-, Werbe- oder Social-Media-Trackingdienste. Schriftarten, Bilder, Produktmedien und 3D-Modelle werden mit der Website ausgeliefert. Externe Links, etwa zu Kartenangeboten oder unserer bisherigen Website, öffnen das jeweilige Angebot erst bei Betätigung des Links. Für die dortige Verarbeitung gelten die Datenschutzhinweise des jeweiligen Anbieters.

## 10. Empfänger und internationale Verarbeitung

Zugriff erhalten die mit der Bearbeitung befassten Personen bei Dalemans sowie die für die jeweiligen Zwecke eingesetzten Dienstleister: Netlify für Websitehosting und Formularverarbeitung, IONOS und beteiligte E-Mail-Anbieter für die Kommunikation und Upstash für den Formularschutz. Weitere Übermittlungen erfolgen, soweit eine gesetzliche Pflicht, eine Einwilligung oder die Durchsetzung beziehungsweise Abwehr von Rechtsansprüchen dies erfordert.

Bei Netlify und Upstash kann eine Verarbeitung außerhalb des Europäischen Wirtschaftsraums, insbesondere in den USA, stattfinden. Die veröffentlichten Auftragsverarbeitungsbedingungen der Anbieter sehen für internationale Übermittlungen die jeweils einschlägigen Mechanismen nach Kapitel V DSGVO vor, darunter EU-Standardvertragsklauseln und, soweit dessen Voraussetzungen erfüllt sind, das EU-US Data Privacy Framework. Eine ausschließliche Speicherung in Deutschland oder der EU wird damit nicht zugesichert. Informationen zu den Garantien finden Sie in den verlinkten Auftragsverarbeitungsbedingungen. Ergänzende Auskünfte und eine Kopie der einschlägigen Garantien können Sie über unsere oben genannten Kontaktdaten anfordern.

## 11. Rechtsgrundlagen und erforderliche Angaben

Die jeweils einschlägigen Rechtsgrundlagen sind bei den Verarbeitungsvorgängen genannt. Unsere berechtigten Interessen bestehen in einer sicheren, stabilen Website, der Bearbeitung eingehender Anfragen und der Abwehr von Missbrauch und Doppelübermittlungen.

Sie können die Website ohne Formularangaben nutzen. Für Anfragen benötigen wir die als Pflichtfelder gekennzeichneten Daten, um sie zuzuordnen und zu beantworten. Ohne diese Angaben ist die jeweilige Online-Übermittlung nicht möglich. Es findet keine ausschließlich automatisierte Entscheidung mit rechtlicher oder ähnlich erheblicher Wirkung und kein Profiling statt.

## 12. Ihre Rechte

Nach Maßgabe der gesetzlichen Voraussetzungen haben Sie das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen, ohne dass die Rechtmäßigkeit der vorherigen Verarbeitung berührt wird.

Sie können einer Verarbeitung auf Grundlage von Art. 6 Abs. 1 Buchst. e oder f DSGVO aus Gründen widersprechen, die sich aus Ihrer besonderen Situation ergeben (Art. 21 DSGVO). Wir verarbeiten die Daten dann nicht weiter, es sei denn, wir weisen zwingende schutzwürdige Gründe nach, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient Rechtsansprüchen. Gegen Direktwerbung können Sie jederzeit ohne Angabe von Gründen widersprechen.

Zur Ausübung Ihrer Rechte genügt eine Nachricht an ${company.email}. Gesetzliche Aufbewahrungspflichten und Rechte Dritter können einer sofortigen Löschung entgegenstehen.

## 13. Beschwerderecht

Sie haben nach Art. 77 DSGVO das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, insbesondere am Ort Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des vermuteten Verstoßes. Für private Unternehmen in Bayern ist das Bayerische Landesamt für Datenschutzaufsicht zuständig, Promenade 18, 91522 Ansbach.

## 14. Anbieterinformationen

- [IONOS: Datenschutzhinweise](https://www.ionos.de/datenschutzerklaerung)
- [IONOS: Auftragsverarbeitung](https://www.ionos.de/terms-gtc/avv/)
- [Netlify: Datenschutzerklärung](https://www.netlify.com/privacy/)
- [Netlify: Auftragsverarbeitungsbedingungen](https://www.netlify.com/pdf/netlify-dpa.pdf)
- [Upstash: Datenschutzerklärung](https://upstash.com/trust/privacy.pdf)
- [Upstash: Auftragsverarbeitungsbedingungen](https://upstash.com/static/trust/dpa.pdf)

## 15. Stand

Stand: 14. November 2026.
`;
