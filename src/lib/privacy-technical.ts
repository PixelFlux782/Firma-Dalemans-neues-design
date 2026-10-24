export const technicalPrivacyText = `Datenschutzhinweise - technischer Stand vom 23. Oktober 2026

Hinweis zum Freigabestatus

Diese Fassung beschreibt den aktuell im Quellcode festgestellten technischen Stand der Website. Sie ist noch nicht fachjuristisch freigegeben. Insbesondere Rechtsgrundlagen, Aufbewahrungs- und Löschfristen, eingesetzte Hosting- und E-Mail-Dienstleister, Verträge zur Auftragsverarbeitung sowie gegebenenfalls erforderliche Pflichtangaben müssen vor einer Veröffentlichung durch eine fachkundige Stelle ergänzt und bestätigt werden.

1. Kontakt

Dalemans Sitzmöbel und Tische
Bollenwaldstraße 108a
63743 Aschaffenburg
Deutschland
Telefon: +49 9342 9153-53
E-Mail: info@dalemans.de

Die rechtliche Bezeichnung und Verantwortlichkeit sind vor der Freigabe mit dem Impressum fachjuristisch abzugleichen.

2. Bereitstellung der Website und Server-Protokolle

Beim Abruf einer Website werden technisch erforderliche Verbindungsdaten an den ausliefernden Server übertragen. Dazu können insbesondere IP-Adresse, Zeitpunkt, angeforderte Adresse, Referrer, Browser und Betriebssystem gehören. Welcher Hostinganbieter eingesetzt wird, an welchen Standorten verarbeitet wird und wie lange Protokolle gespeichert werden, ist in der Deployment-Konfiguration zu bestätigen und vor der Freigabe zu ergänzen.

3. Cookies, Reichweitenmessung und Marketing

Die aktuell geprüfte Anwendung setzt selbst keine Cookies und enthält keine aktive Integration von Google Analytics, Google Ads, Wordfence, iThemes oder einem anderen Tracking- oder Marketingdienst. Ein technischer Consent-Banner für solche Dienste ist deshalb im derzeitigen Stand nicht implementiert. Werden später Tracking-, Marketing- oder andere einwilligungspflichtige Dienste hinzugefügt, müssen diese vor ihrer Aktivierung technisch und rechtlich neu bewertet werden.

4. Lokale Speicherung im Browser

Die Website verwendet LocalStorage des Browsers. Diese Daten bleiben grundsätzlich auf dem verwendeten Gerät und werden nicht allein durch die lokale Speicherung an Dalemans übertragen. Gespeichert werden:

- dlmns-commerce-cart: Produktauswahl, Varianten, Mengen und gegebenenfalls Finder-Kontext des lokalen Anfragekorbs;
- dlmns-customer-price-mode: gewählte Darstellung für Geschäfts- oder Privatkundenpreise;
- dalemans-room-planner-projects-v1: lokal angelegte Raumplaner-Projekte einschließlich Projektname, Raumgeometrie, Möbeln, Einstellungen und Zeitangaben;
- dlmns-room-planner-help-v1: Einstellungen der Raumplaner-Hilfe.

Die Einträge bleiben bestehen, bis sie durch Funktionen der Anwendung, durch Löschen der Website-Daten oder durch Einstellungen des Browsers entfernt werden. Raumplaner-Projekte werden nur bei einer ausdrücklichen Export- oder Anfragehandlung weitergegeben.

5. Kontaktformular

Beim Absenden des Kontaktformulars verarbeitet die Anwendung Vorname, Nachname, Organisation, E-Mail-Adresse und/oder Telefonnummer, Betreff und Nachricht. Ein verborgenes Honeypot-Feld dient der Spam-Erkennung. Die Angaben werden serverseitig validiert und über den konfigurierten SMTP-Dienst an die konfigurierte interne Empfängeradresse gesendet. Ohne vollständige SMTP-Konfiguration findet kein Versand statt. SMTP-Anbieter, Empfängerkreis, Rechtsgrundlage sowie Aufbewahrungs- und Löschfristen sind organisatorisch festzulegen und juristisch freizugeben.

6. Produkt- und Angebotsanfragen

Bei einer Angebotsanfrage verarbeitet die Anwendung Vorname, Nachname, E-Mail-Adresse, optional Organisation, Telefonnummer, Liefer-Postleitzahl und Nachricht sowie Kundenart und die ausgewählten Produkte, Varianten, Mengen und Ausstattungen. Zur Missbrauchsbegrenzung wird aus der vom Proxy gemeldeten IP-Adresse ein Hash gebildet und vorübergehend in einem instanzlokalen Speicher für die Ratenbegrenzung verwendet. Eine technische Anfragekennung dient dazu, doppelte Sendungen zu vermeiden. Die Anfrage wird per SMTP intern versendet; zusätzlich versucht die Anwendung, eine Eingangsbestätigung an die angegebene E-Mail-Adresse zu senden. Dienstleister, Rechtsgrundlage und Speicherfristen sind vor der Freigabe zu dokumentieren.

7. Externe Inhalte, Schriftarten und Links

Schriftarten, Bilder, Produktmedien und 3D-Modelle werden im geprüften Stand aus der Anwendung selbst ausgeliefert. Der Browsercrawl des Pre-Launch-Audits stellte keine automatischen Drittanbieter-Requests fest. Externe Links, beispielsweise zu Karten- oder Gesetzesangeboten, werden erst durch Anklicken aufgerufen; ab diesem Zeitpunkt gelten die Hinweise des jeweiligen Anbieters.

8. Shop-Schnittstellen

Die vorhandene Shopify-Konfiguration ist reserviert, aber derzeit nicht als Commerce-Provider aktiv. Produktdaten und Anfragekorb stammen im geprüften Stand aus lokalen Daten. Eine Aktivierung externer Shop-, Zahlungs- oder Kundendienste erfordert vorab eine neue technische und rechtliche Prüfung sowie eine Aktualisierung dieser Hinweise.

9. Betroffenenrechte und weitere Pflichtangaben

Auskunfts-, Berichtigungs-, Löschungs-, Einschränkungs-, Widerspruchs- und Beschwerderechte sowie die zuständige Aufsichtsbehörde, einschlägige Rechtsgrundlagen und Kontaktwege müssen in der juristisch freigegebenen Endfassung korrekt und vollständig beschrieben werden. Bis zu dieser Freigabe bleibt die Veröffentlichung der Website ausgesetzt.`;
