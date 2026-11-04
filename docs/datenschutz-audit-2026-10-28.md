# WP19 – Dalemans Datenschutz- und DSGVO-Audit

**Prüfdatum:** 28. Oktober 2026

**Prüfgegenstand:** vorhandener Projektcode der Next.js-Anwendung im Repository, geplantes Hosting auf Vercel, geplanter Mailversand über IONOS

**Modus:** statische Read-only-Prüfung; keine Implementierung, Installation, Veröffentlichung, echte Formularübermittlung oder Änderung an Anwendungscode

**Rechtsstand:** vorläufige technische Bewertung, keine Rechtsberatung

## Prüfgrenzen und Bewertungsmaßstab

Geprüft wurden Anwendungscode, Konfigurationsdateien, Paketmanifest, API-Routen, Browser-Speicherungen, aktive und vorbereitete Integrationen, Raumplaner, Formulare, öffentlich auslieferbare Dateien sowie die im Code eingebundenen Rechtstexte. Installierte oder vorbereitete Funktionen werden ausdrücklich von tatsächlich aktiven Funktionen getrennt.

Nicht aus dem Repository verifizierbar sind insbesondere Vercel-Tarif und -Kontoeinstellungen, tatsächliche Production-Umgebungsvariablen, Deployment-Regionen, Log-Aufbewahrung und Log-Drains, AV-Verträge, Unterauftragsverarbeiter, konkrete SMTP-Kontodaten, IONOS-Vertrags- und Löschbedingungen, DNS/TLS auf `dalemans.de`, interne E-Mail-Aufbewahrung, Bild-/Nutzungsrechte und die rechtliche Identität/Rechtsform des Betreibers. Diese Punkte sind als manuell oder rechtlich zu prüfen gekennzeichnet. Es wurden keine Secret-Werte ausgegeben.

Die rechtliche Einordnung orientiert sich vorläufig insbesondere an Art. 5, 6, 13, 28, 32 und 44 ff. DSGVO, § 25 TDDDG und § 5 DDG. Die endgültige Subsumtion, Rechtsgrundlagen, Interessenabwägungen und Fristen müssen fachkundig freigegeben werden.

## A. Management-Zusammenfassung

### Datenschutzstatus

**Status: nicht livegangbereit.** Die Anwendung ist technisch vergleichsweise datensparsam: Es gibt keine aktive Reichweitenmessung, keine Marketing-Pixel, keine externen Webfonts, keine Social-Media-Einbettungen, keine Karten-Einbettung, kein Captcha und keinen aktivierten externen Shop. Der Raumplaner verarbeitet die eigentliche Geometrie, 2D-/3D-Darstellung, JSON-Dateien und PDF-Ausgabe im Browser. Ein allgemeiner Tracking-Cookie-Banner wäre daher sachlich nicht begründet.

Der Livegang ist dennoch blockiert, weil die aktuell veröffentlichte Datenschutzerklärung selbst erklärt, noch nicht fachjuristisch freigegeben zu sein und die Veröffentlichung bis zur Freigabe auszusetzen (`src/lib/privacy-technical.ts:1-5`, `src/lib/privacy-technical.ts:53-55`). Auch Verantwortlicher, Hosting-/Mail-Empfänger, Rechtsgrundlagen, konkrete Löschkonzepte, Betroffenenrechte und Drittlandfragen sind noch nicht abschließend dokumentiert. Das Impressum nennt nur die Geschäftsbezeichnung, Anschrift, Kontakte und USt-ID; Betreibername/Rechtsform/Vertretungsangaben sind aus dem Code nicht eindeutig feststellbar (`src/app/impressum/page.tsx:28-66`).

### Wichtigste Risiken

1. **Nicht freigegebene und unvollständige Rechtstexte.** Die aktive Datenschutzerklärung ist ein technischer Zwischenstand. Das Impressum muss gegen die tatsächliche Betreiberidentität und § 5 DDG geprüft werden.
2. **Hosting und E-Mail vertraglich/operativ ungeklärt.** Vercel verarbeitet beim Seitenabruf mindestens Verbindungs- und URL-Daten; Formulare laufen über Vercel-Serverfunktionen. Region, Logs, AVV/DPA, Unterauftragsverarbeiter und Drittlandgarantien sind nicht im Repository belegt. Der SMTP-Code ist implementiert, eine aktive IONOS-Konfiguration oder sichere Zustellung aber nicht nachweisbar.
3. **Formularschutz nicht produktionsfest verteilt.** Rate-Limit und Idempotenz liegen nur im Prozessspeicher; auf mehreren oder neu gestarteten Vercel-Instanzen sind sie inkonsistent (`src/lib/server/form-protection.ts:6-13`, `src/app/api/contact/route.ts:19-21`, `src/app/api/inquiry/route.ts:19-25`). Eine Origin-Prüfung ist nicht vorhanden.
4. **Nicht notwendige automatische Browser-Speicherung.** Der Preisansichtsmodus wird global bereits beim ersten Seitenaufruf in `localStorage` geschrieben, obwohl die Anzeige ohne Persistenz funktionieren würde (`src/components/commerce/PriceDisplayProvider.tsx:24-34`). Das ist der einzige technische Befund, der aktuell eine Einwilligungsfrage nach § 25 TDDDG auslöst, obwohl kein Tracking stattfindet.
5. **Öffentliches Asset-Inventar.** Alles unter `public/` ist grundsätzlich direkt abrufbar. Dort liegen 429 Dateien mit rund 546 MB, darunter nicht referenzierte Original-/Personenbilder und Quelldateien, zum Beispiel `public/pictures/Über uns/Passbild_Stefan_F_edit.jpg`, `public/pictures/Über uns/CHubert01.jpg`, `public/pictures/Über uns/Logo_Stage1.xcf`, CSV-Dateilisten und Bearbeitungsmetadaten. Ob Einwilligungen, Rechte und eine Veröffentlichung beabsichtigt sind, ist nicht verifizierbar.
6. **Raumplaner-Zusammenfassung in der URL.** Beim ausdrücklich gewählten Übergang zum Kontaktformular werden Projektname, Mengen, Raumfläche und weitere Planungskennzahlen als Query-String an `/kontakt` übergeben (`src/components/room-planner/2d/RoomEditor2D.tsx:148-150`). Das ist keine automatische Weitergabe der vollständigen Geometrie, kann aber in Browserhistorie, Hosting-/Proxy-Logs und internen Referrern erscheinen.

### Notwendige Maßnahmen

Vor dem Livegang sind mindestens erforderlich: juristisch freigegebene und implementierungsgetreue Datenschutz-/Impressumsangaben; Vercel- und IONOS-Vertrags-/Region-/Logprüfung; sichere SMTP-Stagingtests ohne reale Kundendaten; produktionsfestes Formular-Rate-Limit samt Origin-Schutz; Entscheidung zur automatischen Preispräferenz-Speicherung; Review aller öffentlich ausgelieferten Assets; sowie ein finaler Netz-/Storage-/Header-/Formulartest auf `dalemans.de`.

### Einschätzung der Livegang-Bereitschaft

**NO-GO bis die roten Blocker geschlossen sind.** Der Raumplaner kann aus Datenschutzsicht grundsätzlich lokal und datensparsam betrieben werden. Die Hauptdefizite liegen nicht in verstecktem Tracking, sondern in Rechtstexten, Hosting-/Mail-Governance, produktionsfestem Formularschutz und ungeprüften öffentlichen Dateien.

## B. Technische Bestandsaufnahme

| Bereich | Verwendeter Dienst/Funktion | Datenverarbeitung | Mögliche Datenschutzrelevanz | Technische Fundstelle | Prüfstatus |
|---|---|---|---|---|---|
| Hosting | Vercel (geplant und lokal verknüpft) | Abruf-IP, Zeit, URL, Header, technische Logs; Formulardaten passieren Serverfunktionen | Auftragsverarbeitung, Region, Logs, Unterauftragsverarbeiter, Art. 28/44 ff. | `src/app/api/contact/route.ts:23-157`; `src/app/api/inquiry/route.ts:31-93`; `.vercel/project.json` nur lokale Projektverknüpfung | ⚪ Kontoeinstellungen/Verträge ungeklärt |
| Runtime | Next.js 15, Node.js-Serverfunktionen | Kontakt und Anfrage serverseitig; Suche/Wissensvorschau über öffentliche GET-Routen | URLs und Suchbegriffe können in Hostinglogs stehen | `package.json:15-23`; `src/app/api/contact/route.ts:11`; `src/app/api/inquiry/route.ts:17`; `src/app/api/search/route.ts:4-9` | 🟡 technisch geprüft, Plattform offen |
| Deployment-Region | keine `preferredRegion`/Region im Projektcode | Region wird nicht durch Repository festgelegt | Datenstandort und Drittlandtransfer unbestimmt | keine Regionsangabe in `src/`/`next.config.mjs` | ⚪ manuell prüfen |
| Analytics/Marketing | keine aktive Integration | keine Analyse-/Marketingevents an Anbieter | kein Tracking-Cookie-Befund | keine `@vercel/analytics`, `@vercel/speed-insights`, GA/GTM-Pakete oder Skripte in `package.json:15-38`/`src/` | 🟢 unauffällig |
| Interner Analytics-Handoff | `dlmns:search` CustomEvent | Suchbegriff nur als lokales Browserereignis; kein Empfänger/Adapter im Code | könnte bei späterem Adapter Tracking werden | `src/lib/search/actions.ts:14-17`; Aufrufe `src/components/search/SearchOverlay.tsx:101-107` | 🟢 derzeit nicht extern |
| Schriftarten | System-/CSS-Schriften | keine externe Font-Anfrage | keine Übertragung an Google Fonts | `src/app/globals.css:18,75`; keine `next/font`-/Google-Font-Nutzung | 🟢 unauffällig |
| Bilder/PDFs | lokale Dateien, Next.js Image Optimization | Abruf über Hostingserver/Vercel; keine Remote-Image-Hosts konfiguriert | IP/URL in Hostinglogs; öffentliche Dateien | `next.config.mjs:25-55`; lokale Pfade z. B. `src/lib/fabrics.ts:44-230` | 🟡 Hosting/öffentliches Inventar beachten |
| Stoffkarten-iframe | lokale PDFs in `<iframe>` | Browser lädt PDF vom selben Origin | kein Drittanbieterrequest | `src/components/chairs/FabricSelectionDialog.tsx:232-237`; `src/lib/fabrics.ts:44-230` | 🟢 unauffällig |
| Build-/Redaktionsquellen | Hersteller-/Lieferanten-URLs in `config/` und Sync-Skripten | nur bei manuell ausgeführtem Synchronisationsskript, nicht beim Besucherabruf | keine Laufzeit-Integration | `config/fabric-material-sources.json:4-39`; `scripts/fabric-card-sync-lib.mjs:5` | 🟢 nicht aktiv im Websitebetrieb |
| 3D | React Three Fiber/Drei/Three, lokale GLB-Dateien | Rendering im Browser; Modelle vom eigenen Origin | keine externe 3D-API | `package.json:16-17,23`; `src/components/room-planner/3d/RoomView3D.tsx:4,44,112,132`; `src/lib/room-planner/chairs.ts:21`; `src/lib/room-planner/tables.ts:33-48` | 🟢 unauffällig |
| Shop/Commerce | lokaler Anfragekatalog | Produktdaten lokal; kein Checkout/Zahlungsdienst | Produktauswahl lokal, Versand erst bei Anfrage | `src/lib/commerce/service.ts:7-26`; `src/lib/commerce/config.ts:1-3` | 🟢 lokal aktiv |
| Shopify | vorbereiteter Serverclient, aber Provider nicht aktivierbar fertiggestellt | bei Aktivierung serverseitiger Abruf und ggf. Shopify-CDN-Medien | potenzieller externer Empfänger, derzeit nicht aktiv | `src/lib/shopify/client.ts:74-100`; `src/lib/commerce/service.ts:17-26`; `.env.example:6-9` | 🟢 installiert/vorbereitet, nicht aktiv |
| Warenkorb | `localStorage` `dlmns-commerce-cart` | Produkt-, Varianten-, Mengen-, Preis-/Finderkontext und zufällige lokale IDs | Endgerätzugriff nach § 25 TDDDG; bis Löschung | `src/lib/commerce/cart/local.ts:13-35,195-223`; `src/components/commerce/cart/CartProvider.tsx:54-70` | 🟡 voraussichtlich funktional erforderlich |
| Preisansicht | `localStorage` `dlmns-customer-price-mode` | Wert `business` oder `private`, automatisch global geschrieben | nicht nachweislich unbedingt erforderlich; Einwilligungsfrage | `src/components/commerce/PriceDisplayProvider.tsx:9,24-34`; global eingebunden `src/app/layout.tsx:71-102` | 🟠 rechtlich/technisch klären |
| Raumplaner-Projekte | `localStorage` `dalemans-room-planner-projects-v1` | Projektname, Zeitstempel, Raumgeometrie, Türen, Gänge, Objekte, Möbel, Einstellungen, Sitzplan | kann personenbezogene/projektbezogene Informationen enthalten; dauerhaft lokal | `src/lib/room-planner/projects.ts:8-26,114-138`; `src/components/room-planner/2d/RoomEditor2D.tsx:189-252` | 🟡 lokal; Information/Löschung prüfen |
| Raumplaner-Hilfe | `localStorage` `dlmns-room-planner-help-v1` | Onboarding gesehen/übersprungen, verworfene Hilfen | geringe Relevanz; funktionsbezogen | `src/components/room-planner/help/plannerHelpContent.ts:32-44` | 🟢 geringe Relevanz |
| JSON-Import/-Export | lokale File-/Blob-APIs | Projektdatei wird lokal gelesen bzw. heruntergeladen, max. 4 MB | Weitergabe nur durch Nutzer; Export unverschlüsselt | `src/components/room-planner/2d/ProjectControls.tsx:25-39`; `src/components/room-planner/2d/RoomEditor2D.tsx:299-310`; `src/lib/room-planner/projects.ts:120-124` | 🟢 lokal, Nutzerhinweis sinnvoll |
| PDF | Browserdruck | Plan wird im DOM erzeugt und über `window.print()` gedruckt/als PDF gespeichert | keine Server-PDF-API; lokale Datei kann geteilt werden | `src/components/room-planner/2d/PlanOutputView.tsx:35-42` | 🟢 lokal |
| Raumplaner → Kontakt | Query-String | Projektname, Bedarf, Raumfläche, Ausgänge/Gänge u. a. in URL; vollständige Geometrie nicht enthalten | Browserhistorie/Serverlogs/Referrer; explizite Nutzeraktion | `src/components/room-planner/2d/RoomEditor2D.tsx:148-150,1303-1305` | 🟠 minimieren/transparent machen |
| Suche | `/api/search?q=…` | frei eingegebener Suchtext wird an Hostingserver gesendet | kann bei Fehleingaben personenbezogen sein; URL-/Access-Logs | `src/components/search/SearchOverlay.tsx:101-107`; `src/app/api/search/route.ts:4-9` | 🟡 Datenschutzhinweis/Logs berücksichtigen |
| Kontaktformular | interne API + Nodemailer/SMTP | Vorname, Nachname, Organisation, E-Mail und/oder Telefon, Betreff, Nachricht, technische ID | personenbezogene Kommunikation über Hosting und Mailprovider | `src/components/ContactForm.tsx:14-44,95-122,148-197`; `src/app/api/contact/route.ts:37-50,116-139` | 🟠 implementiert, Betrieb offen |
| Angebotsanfrage | interne API + Nodemailer/SMTP | Name, E-Mail, optionale Organisation/Telefon/PLZ/Nachricht, Kundenart und Produktauswahl; Bestätigung an Kunden | personenbezogene/geschäftliche Anfrage und E-Mail-Speicherung | `src/components/commerce/InquiryCartSummary.tsx:15-38,88-106,164-205`; `src/lib/inquiry/server.ts:337-400` | 🟠 implementiert, Betrieb offen |
| Spam-Schutz | Honeypot, Größenlimits, Validierung, instanzlokales Rate-Limit | optional gesalzener Hash einer vertrauenswürdigen Client-IP für 15 Minuten; sonst gemeinsamer „unattributed“-Schlüssel | Pseudonymisierte Kennung; Schutz nicht clusterfest | `src/lib/server/form-protection.ts:6-13,21-54,68-97`; `.env.example:33-40` | 🟠 produktionsfest machen |
| Formularlogs | strukturierte technische Eventcodes | Route/Event, keine Body-, E-Mail-, Telefon- oder SMTP-Fehlerdetails | datensparsam; Plattformlogs zusätzlich unbekannt | `src/lib/server/form-protection.ts:100-108`; Aufrufe `src/app/api/contact/route.ts:79,92,109,149` | 🟢 Anwendungscode; Plattform offen |
| SMTP-Secrets | serverseitige Environment-Variablen | Host, Nutzer, Passwort, Absender/Empfänger | keine `NEXT_PUBLIC_`-Exposition im Code | `src/app/api/contact/route.ts:86-120`; `src/lib/inquiry/server.ts:283-314`; `.env.example:11-31` | 🟢 Code; Production-Werte offen |
| Externe Karte | Google-Maps-Kurzlink | erst bei Klick Wechsel zu Google; dann IP/Referrer nach Google-Regeln | kein Embed, keine automatische Übertragung | `src/app/impressum/page.tsx:36-40` | 🟡 als externer Link transparent |
| Weitere externe Links | Gesetze Bayern u. a. | erst bei Klick | keine automatische Einbettung | `src/lib/room-planner/rules/profiles.ts:26` | 🟢 unauffällig |
| Security Header | HSTS, nosniff, DENY, Referrer-, Permissions-, COOP; CSP nur Report-only | reduziert technische Risiken, CSP blockiert derzeit nichts | Art. 32; LocalStorage-Daten wären bei XSS lesbar | `next.config.mjs:28-54` | 🟠 CSP-Härtung offen |
| Öffentliche Dateien | gesamtes `public/` | sämtliche Dateien direkt abrufbar, auch wenn nicht verlinkt | mögliche unbeabsichtigte Veröffentlichung/Personenbild-/Rechterisiken | z. B. `public/pictures/Über uns/Passbild_Stefan_F_edit.jpg`, `public/pictures/Über uns/Logo_Stage1.xcf`, `public/neue bilder/Tische/klapptisch-310c/Bearbeitung.json` | ⚪ vollständige Freigabe offen |
| Abhängigkeiten | produktive Pakete laut Lockfile | Bibliothekscode wird server-/clientseitig ausgeführt | Supply-Chain-/CVE-Risiko | `package.json:15-23` | 🟢 `npm audit --offline --omit=dev`: 0 bekannte Funde am 28.10.2026; kein Ersatz für laufende Pflege |

### Browser-Speicher im Einzelnen

| Schlüssel | Inhalt | Dauer im Code | technische Notwendigkeit | Vorläufige §-25-TDDDG-Einordnung |
|---|---|---|---|---|
| `dlmns-commerce-cart` | lokale Cart-ID, Produkt/Variante, Menge, Preisstatus/-stufen, Ausstattung, Finder-Kontext | ohne Ablauf; wird beim Leeren als leerer Warenkorb weitergeschrieben | für den vom Nutzer angeforderten Anfragekorb plausibel erforderlich | voraussichtlich § 25 Abs. 2 Nr. 2; juristisch bestätigen |
| `dlmns-customer-price-mode` | `business` oder `private` | ohne Ablauf; wird beim ersten Mount automatisch geschrieben | Persistenz ist für die Preisanzeige nicht notwendig | derzeit nicht sicher privilegiert; entfernen/erst auf ausdrückliche Wahl beschränken oder Einwilligung einholen |
| `dalemans-room-planner-projects-v1` | bis 100 Projekte, Projektname, UUID, Erstell-/Änderungszeit, vollständige Geometrie und Planungseinstellungen | ohne Ablauf; einzelne Löschung und Browserdaten-Löschung möglich | lokale Speicherung ist Kern der ausdrücklich angebotenen Speicherfunktion | voraussichtlich § 25 Abs. 2 Nr. 2; klar informieren, Löschung/Export erklären |
| `dlmns-room-planner-help-v1` | Onboarding-/Hilfeeinstellungen | ohne Ablauf | für gemerkte Hilfeeinstellung plausibel funktionsbezogen | voraussichtlich privilegiert, aber juristisch bestätigen |

Keine Nutzung von Cookies, `sessionStorage`, IndexedDB oder Cache Storage wurde im Anwendungscode gefunden. Zufällige UUIDs werden für lokale Projekte/Warenkörbe und kurzlebige Doppelsende-IDs verwendet, nicht für anbieterübergreifendes Tracking (`src/lib/room-planner/projects.ts:136-138`, `src/lib/commerce/cart/local.ts:206-222`, `src/components/ContactForm.tsx:112-122`, `src/components/commerce/InquiryCartSummary.tsx:61-63`).

## C. Gefundene Probleme

### 🔴 Blocker

#### WP19-B01 – Aktive Datenschutzerklärung ist ausdrücklich nicht freigegeben

- **Fundstelle:** `src/lib/privacy-technical.ts:1-5,16,18-55`; Einbindung `src/app/datenschutz/page.tsx:28-31`.
- **Begründung:** Der ausgelieferte Text bezeichnet sich als technischen Stand, verlangt Ergänzungen/Freigaben und erklärt selbst, dass die Veröffentlichung bis dahin ausgesetzt bleibt. Konkrete Rechtsgrundlagen, Empfänger, Fristen/Kriterien, Vercel/IONOS, Drittlandgarantien, Aufsichtsbehörde und vollständige Betroffeneninformation sind offen. Das genügt nicht als freigegebene Art.-13-Information.
- **Empfohlene Lösung:** Auf Grundlage des technischen Inventars einen fachjuristisch geprüften Endtext erstellen; Betreiber, Vercel, IONOS/SMTP, Serverlogs, Formulare, Suche, LocalStorage, Raumplaner-Übergabe, Empfänger, Fristen/Kriterien, Rechte und Drittlandmechanismen konkret und wahrheitsgemäß ergänzen. Keine unbestätigten Verträge/Fristen behaupten.
- **Aufwand:** M
- **Art:** rechtlich, mit technischer Zuarbeit

#### WP19-B02 – Impressum/Verantwortlicher nicht eindeutig verifizierbar

- **Fundstelle:** `src/app/impressum/page.tsx:28-66`; `src/lib/company.ts:3-20`; Datenschutzhinweis `src/lib/privacy-technical.ts:7-16`.
- **Begründung:** Genannt werden Geschäftsbezeichnung, Anschrift, E-Mail, zwei Telefonnummern und USt-ID. Eine natürliche Betreiberperson, Rechtsform, Vertretungsberechtigung und gegebenenfalls Registerangaben sind nicht ersichtlich. Ob diese Angaben im konkreten Unternehmensfall erforderlich sind, hängt von der tatsächlichen Rechtsform ab. Verantwortlicher nach DSGVO und Diensteanbieter nach § 5 DDG müssen eindeutig und konsistent feststehen.
- **Empfohlene Lösung:** Tatsächliche Betreiberidentität/Rechtsform anhand offizieller Unterlagen bestimmen; Impressum und Datenschutz konsistent fachjuristisch prüfen und ergänzen.
- **Aufwand:** S
- **Art:** rechtlich/organisatorisch

#### WP19-B03 – Vercel- und Mailverarbeitung vertraglich/operativ nicht nachgewiesen

- **Fundstelle:** Serverrouten `src/app/api/contact/route.ts:23-157`, `src/app/api/inquiry/route.ts:31-93`; fehlende Regionsvorgabe im Projekt; `.vercel/project.json` belegt nur Verknüpfung; `.env.example:11-40` nur Sollkonfiguration.
- **Begründung:** Personenbezogene Formulardaten werden zuerst auf Vercel verarbeitet und anschließend an den konfigurierten SMTP-Anbieter übertragen. Tarif, AVV/DPA, Regionen, Subprozessoren, Drittlandgrundlage, Logs, Aufbewahrung und tatsächlicher IONOS-Empfänger sind unbekannt. Ohne diese Fakten kann die Rechtmäßigkeit/Transparenz nach Art. 13, 28 und 44 ff. nicht abgeschlossen werden.
- **Empfohlene Lösung:** Vercel- und IONOS-Verträge/Kontoeinstellungen dokumentieren; Verarbeitungsorte und Transfermechanismen prüfen; Log- und Mail-Aufbewahrung/Löschung festlegen; Zugriffskreise festlegen; anschließend Rechtstext aktualisieren.
- **Aufwand:** M
- **Art:** rechtlich/vertraglich/organisatorisch

#### WP19-B04 – Öffentlicher Asset-Bestand ist nicht freigegeben nachweisbar

- **Fundstelle:** gesamter Ordner `public/`; konkrete Beispiele `public/pictures/Über uns/Passbild_Stefan_F_edit.jpg`, `public/pictures/Über uns/CHubert01.jpg`, `public/pictures/Über uns/Logo_Stage1.xcf`, `public/neue bilder/Gestelle/Gestelltypen/Dateiliste.csv`, `public/neue bilder/Tische/klapptisch-310c/Bearbeitung.json`. Für die genannten Beispiele wurden keine Code-Referenzen in `src/`, Konfiguration oder Tests gefunden.
- **Begründung:** 429 Dateien (ca. 546 MB) werden vom Webroot grundsätzlich direkt ausgeliefert, auch wenn keine Seite auf sie verlinkt. Dateinamen weisen auf Portraits, historische Originalbilder, Kunden-/Raumreferenzen und Arbeitsdateien hin; Inhalt, Einwilligung, Urheber-/Nutzungsrechte und beabsichtigte Veröffentlichung lassen sich aus Code nicht bestätigen. Es wird nicht behauptet, dass jede Datei rechtswidrig ist; die fehlende Freigabe ist der Blocker.
- **Empfohlene Lösung:** Vollständige Assetliste gegen Veröffentlichungszweck, Personen-/Kundenbezug, Metadaten und Rechtefreigaben prüfen; nicht für die Website bestimmte Dateien vor Deployment aus dem öffentlich ausgelieferten Artefakt herausnehmen; Freigaben dokumentieren.
- **Aufwand:** L
- **Art:** rechtlich/organisatorisch/technisch

### 🟠 Hoch

#### WP19-H01 – Instanzlokales Rate-Limit/Idempotenz und fehlende Origin-Prüfung

- **Fundstelle:** `src/lib/server/form-protection.ts:6-13,57-97`; `src/app/api/contact/route.ts:19-21,58-83`; `src/app/api/inquiry/route.ts:19-28,41-68`; eigener Hinweis `.env.example:39-40`.
- **Begründung:** Maps im Prozessspeicher werden bei Neustart verloren und nicht über mehrere Vercel-Instanzen geteilt. Ohne korrekt konfigurierten vertrauenswürdigen IP-Header teilen alle Besucher je Instanz den Schlüssel `unattributed`; mit Replikaten ist das Limit umgehbar. Eine explizite Prüfung von `Origin`/`Sec-Fetch-Site` fehlt. Missbrauch kann Spam, Mailkosten, Verfügbarkeitsprobleme und unnötige Verarbeitung personenbezogener Daten verursachen.
- **Empfohlene Lösung:** Gemeinsamen atomaren TTL-Store und vertraglich dokumentierten, vom Edge bereinigten Einzel-IP-Header verwenden; stabile gesalzene Schlüssel; Origin/Same-Site-Prüfung; Mehrinstanz-/Restart-/Abusetest; Logs weiterhin ohne Inhalte/PII.
- **Aufwand:** M
- **Art:** technisch, Art. 32

#### WP19-H02 – SMTP-Konfiguration, Transportverschlüsselung und Zustellung nicht end-to-end nachgewiesen

- **Fundstelle:** `src/app/api/contact/route.ts:99-124`; `src/lib/inquiry/server.ts:283-315`; Beispiel `.env.example:11-17` (`587`, `secure=false`).
- **Begründung:** Nodemailer/SMTP ist vollständig implementiert, aber der Code erzwingt bei `secure=false` nicht ausdrücklich `requireTLS`. Ob STARTTLS zuverlässig genutzt wird, hängt von Server und Konfiguration ab. Außerdem ist `CONTACT_TO_EMAIL` nicht Teil der Pflichtvariablenprüfung, wird danach aber mit Non-null-Assertion und `.trim()` gelesen (`src/app/api/contact/route.ts:86-90,101-105`); fehlt die Variable, droht statt der vorgesehenen 503-Antwort ein ungefangener Konfigurationsfehler. Production-Credentials, IONOS-Host, Zertifikatsprüfung, Absenderauthentifizierung, Empfänger, Limits, Bounce- und Löschprozesse sind nicht nachgewiesen. Web-TLS auf `dalemans.de` ist ebenfalls extern zu testen.
- **Empfohlene Lösung:** IONOS-Konfiguration verbindlich festlegen; TLS-Modus und Zertifikatsfehler im Staging testen; Secrets ausschließlich im Vercel Secret Store; SPF/DKIM/DMARC, Absender/Empfänger, Bounce, Timeout, Retention und Zugriff dokumentieren. Keine realen Kundendaten für Tests.
- **Aufwand:** M
- **Art:** technisch/organisatorisch

#### WP19-H03 – Raumplaner-Projektdaten in URL beim Anfrageübergang

- **Fundstelle:** `src/components/room-planner/2d/RoomEditor2D.tsx:148-150,1303-1305`; Übernahme in Formular `src/components/ContactForm.tsx:76-85`.
- **Begründung:** Erst nach aktivem Klick werden Projektname, Produkt/Variante, Mengen, Sitzblöcke, Gänge, Ausgänge, Raumfläche und Regelprofil in einen Query-String geschrieben. Damit können die Daten in Browserhistorie, Screenshots, Copy/Paste, Hosting-/Proxylogs und gleichoriginigen Referrern landen. Die vollständige Geometrie wird nicht übertragen.
- **Empfohlene Lösung:** Übergabe ohne sensible URL-Parameter gestalten (z. B. nur minimale Kennzahlen, bewusste Kopierfunktion oder kurzlebiger clientseitiger Zustand); Nutzer vor Übergabe klar informieren; URL-/Access-Log-Redaktion und Frist prüfen.
- **Aufwand:** M
- **Art:** technisch/datenschutzrechtlich

#### WP19-H04 – Automatische, nicht zwingend erforderliche Preispräferenz-Speicherung

- **Fundstelle:** `src/components/commerce/PriceDisplayProvider.tsx:24-34`; globale Einbindung `src/app/layout.tsx:71-102`.
- **Begründung:** Jeder Besucher erhält beim Mount einen dauerhaften LocalStorage-Eintrag, auch ohne Preiswahl. Persistenz ist nicht für die Darstellung erforderlich. Damit ist die Ausnahme des § 25 Abs. 2 Nr. 2 TDDDG nicht sicher begründbar.
- **Empfohlene Lösung:** Datensparsamste Variante: nicht automatisch dauerhaft speichern bzw. Persistenz entfernen. Alternativ Speicherung erst nach einer eindeutig angeforderten Präferenz und deren rechtliche Privilegierung prüfen; wenn keine Ausnahme greift, vor Zugriff Einwilligung einholen. Kein großer Marketing-CMP-Banner nötig.
- **Aufwand:** S
- **Art:** technisch/rechtlich

### 🟡 Mittel

#### WP19-M01 – Lokale Speicherungen haben keine automatische Frist

- **Fundstelle:** Warenkorb `src/lib/commerce/cart/local.ts:195-223`; Preisansicht `src/components/commerce/PriceDisplayProvider.tsx:27-34`; Projekte `src/components/room-planner/2d/RoomEditor2D.tsx:189-252`; Hilfe `src/components/room-planner/help/plannerHelpContent.ts:32-44`.
- **Begründung:** Alle Einträge bleiben bis zur Funktionslöschung oder Browserdaten-Löschung bestehen. Projekte lassen sich einzeln löschen (`src/components/room-planner/2d/ProjectControls.tsx:42-48`), aber es gibt keine Ablaufregel oder zentrale „alle lokalen Daten löschen“-Funktion. Projektname und Raumplan können einen Personen-/Kundenbezug erhalten.
- **Empfohlene Lösung:** Zweck und Dauer transparent erklären; nutzerfreundliche Löschmöglichkeit/Alle-löschen-Konzept und angemessene Ablaufentscheidung prüfen; keine automatische Serverübertragung behaupten.
- **Aufwand:** S–M
- **Art:** technisch/rechtlich

#### WP19-M02 – Suchbegriffe werden als URL an eine Serverroute gesendet

- **Fundstelle:** `src/components/search/SearchOverlay.tsx:101-107`; `src/app/api/search/route.ts:4-9`.
- **Begründung:** Suchtexte stehen in `GET /api/search?q=...` und können dadurch in Accesslogs erscheinen. Die Anwendung selbst speichert oder loggt sie nicht; ein CustomEvent bleibt lokal. Nutzer könnten dennoch versehentlich personenbezogene Daten eingeben.
- **Empfohlene Lösung:** Hostinglogs/Redaktion/Fristen prüfen und im Hostingabschnitt abdecken; Suchquery nicht als Analytics-Event aktivieren, ohne neue Prüfung; optional Eingabehinweis/POST nur bei nachgewiesenem Bedarf.
- **Aufwand:** S
- **Art:** technisch/rechtlich

#### WP19-M03 – CSP schützt noch nicht aktiv

- **Fundstelle:** `next.config.mjs:28-54`.
- **Begründung:** Gute Quellenbegrenzung ist definiert, aber nur als `Content-Security-Policy-Report-Only`; `script-src` und `style-src` erlauben zudem `'unsafe-inline'`. Die Richtlinie blockiert keinen Angriff. Ein XSS könnte LocalStorage-Warenkorb und Raumpläne lesen.
- **Empfohlene Lösung:** Auf finaler Domain Reports auswerten, Inline-Bedarf reduzieren und nach separater Freigabe eine enforcing CSP ausrollen; keine ungetestete Härtung direkt live schalten.
- **Aufwand:** M
- **Art:** technisch, Art. 32

#### WP19-M04 – Kein bestätigtes Lösch-/Aufbewahrungskonzept für E-Mail-Anfragen

- **Fundstelle:** Datenumfang `src/app/api/contact/route.ts:37-43,127-139`; Angebotsmail `src/lib/inquiry/server.ts:337-400`; offener Hinweis `src/lib/privacy-technical.ts:37-43`.
- **Begründung:** Die Anwendung persistiert keine Anfrage-Datenbank, aber Mailboxen, SMTP-Provider und ggf. Vercel-Logs können Daten speichern. Kriterien/Fristen, Zuständigkeiten, Berechtigte und Löschwege sind nicht festgelegt.
- **Empfohlene Lösung:** Verarbeitungsverzeichnis/Löschkonzept für Anfragen, Angebote und handels-/steuerrechtlich relevante Folgedaten definieren; Mailboxen und Backups einbeziehen; korrekte Kriterien statt erfundener Pauschalfristen veröffentlichen.
- **Aufwand:** M
- **Art:** organisatorisch/rechtlich

#### WP19-M05 – Legacy-Datenschutztext mit falschen Diensten bleibt im Repository

- **Fundstelle:** `src/lib/legal-content.ts:3`; aktive Seite importiert dagegen `technicalPrivacyText` in `src/app/datenschutz/page.tsx:5,31`.
- **Begründung:** Der große Alttext behauptet Google Analytics, AdWords, Wordfence und iThemes, ist aktuell nicht gerendert, birgt aber ein hohes Wiederverwendungs-/Verwechslungsrisiko. Als aktive Integration werden diese Dienste ausdrücklich **nicht** bewertet.
- **Empfohlene Lösung:** Im nächsten Umsetzungs-WP eindeutig archivieren/kennzeichnen oder entfernen, ohne ihn versehentlich zu veröffentlichen; Rechtstextquelle eindeutig festlegen.
- **Aufwand:** S
- **Art:** technisch/redaktionell

### 🟢 Unauffällig

- Keine aktiven Google-Fonts-, Analytics-, Tag-Manager-, Ads-, Vercel-Analytics-, Speed-Insights-, Social-, Video-, Karten-Embed-, Captcha-, Monitoring- oder Marketing-Integrationen gefunden.
- Shopify-Code ist vorbereitet, aber der aktive Provider ist lokal; `COMMERCE_PROVIDER=shopify` endet ausdrücklich mit „reserved … not active“ (`src/lib/commerce/service.ts:17-26`).
- Formular-Bodygrößen, Feldlängen, serverseitige Validierung, Honeypot, Timeout und idempotente IDs sind vorhanden (`src/app/api/contact/route.ts:13-18,23-56,116-155`; `src/app/api/inquiry/route.ts:19-20,31-93`; `src/lib/inquiry/server.ts:37-126`).
- Anwendungslogs enthalten nur technische Eventcodes, keine Request-Bodies oder SMTP-Fehlerobjekte (`src/lib/server/form-protection.ts:100-108`).
- SMTP-Zugangsdaten sind ausschließlich serverseitige Variablen; keine Verwendung als `NEXT_PUBLIC_` gefunden (`src/app/api/contact/route.ts:86-120`; `src/lib/inquiry/server.ts:283-314`).
- JSON-Import validiert Schema, Mengenlimits, Objektbezüge und Dateigröße; keine Ausführung von importiertem Code (`src/lib/room-planner/projects.ts:55-133`).
- Der Paketbestand ergab bei `npm audit --offline --omit=dev` am Prüfdatum 0 bekannte Vulnerabilities. Das ist eine Momentaufnahme und keine Garantie.

### ⚪ Ungeklärt

- Vercel-Tarif, DPA/AVV, EU-/Funktionsregion, Edge/CDN- und Logregionen, Retention, Log-Drains, Analytics-Schalter im Konto, Firewall-/Bot-Schutz, Unterauftragsverarbeiter, Drittlandmechanismen.
- Tatsächlich gesetzte Production-Environment-Variablen und ob `NEXT_PUBLIC_SITE_URL` auf `https://dalemans.de` zeigt (`src/lib/seo.ts:3-13`; `.env.example:1`).
- IONOS-Vertrag/AVV, SMTP-Host/TLS-Modus, Speicherorte, Logs, Mailbox-Aufbewahrung, Absenderauthentifizierung und Zustellung.
- Bildrechte, Personenfreigaben, Kunden-/Objektfreigaben und Metadaten aller öffentlichen Medien.
- Rechtsform/Betreiber/Vertretung und daraus folgende §-5-DDG-Pflichtangaben.
- Konkrete Rechtsgrundlagen und Aufbewahrungsfristen/Kriterien; diese dürfen nicht aus Code erfunden werden.

## D. Cookie-Banner-Entscheidung

### 1. Ist nach dem technischen Befund ein Cookie-Banner erforderlich?

**Kein allgemeiner Tracking-/Marketing-Cookie-Banner ist erforderlich**, weil weder Cookies noch aktive Tracking-, Marketing- oder Drittanbieter-Embed-Technologien gefunden wurden.

**Für den unveränderten aktuellen Stand bleibt jedoch eine punktuelle Einwilligungsfrage offen:** `dlmns-customer-price-mode` wird automatisch und dauerhaft geschrieben, obwohl diese Persistenz nicht unbedingt erforderlich erscheint. Wenn dieser Zugriff nicht unter § 25 Abs. 2 TDDDG fällt, muss vor dem Schreiben eine Einwilligung eingeholt werden. Die datensparsamste Empfehlung ist, die automatische Persistenz im nächsten technischen WP zu entfernen oder auf eine tatsächlich angeforderte Funktion zu begrenzen; dann kann die Website voraussichtlich ohne Banner betrieben werden. Die endgültige Einordnung ist rechtlich zu bestätigen.

### 2. Welche Funktionen lösen gegebenenfalls die Einwilligungspflicht aus?

- **Primärer Prüfpunkt:** automatische Preisansichts-Persistenz `dlmns-customer-price-mode`.
- **Voraussichtlich technisch notwendig/ausdrücklich angefordert:** Warenkorb nach Produktwahl, lokale Projektablage im Raumplaner, Hilfepräferenzen nach Interaktion. Diese Einordnung ist vorläufig und muss im konkreten Servicekontext bestätigt werden.
- **Nicht vorhanden:** Analytics-/Marketing-Cookies, Fingerprinting, externe Medien-Cookies, Social-/Map-Embeds, Captcha-Cookies.

### 3. Datensparsame Ersatzmöglichkeiten

- Preisansicht nur im React-Zustand halten oder erst nach ausdrücklicher Wahl für die laufende Nutzung anwenden; keine automatische dauerhafte Speicherung.
- Warenkorb und Projekte lokal belassen; keine Cloud-Synchronisation ohne neues Audit.
- Externe Karte weiter nur als normaler Link, nicht als Embed.
- Kein Captcha vorsorglich integrieren; zuerst serverseitigen Missbrauchsschutz produktionsfest machen.

### 4. Rechtlich zu prüfen

- Privilegierung jeder LocalStorage-Funktion nach § 25 Abs. 2 Nr. 2 TDDDG.
- Ob ein sehr schlanker, zweckbezogener Consent ausschließlich für die Preispräferenz nötig wäre, falls die Persistenz unverändert bleibt.
- Formulierung der transparenten Information über lokale Speicherung, Dauer, Löschung und den Unterschied zwischen Endgerät- und Serververarbeitung.

## E. Erforderliche Abschnitte der Datenschutzerklärung

Die Endfassung sollte mindestens folgende, auf bestätigte Tatsachen beschränkte Abschnitte enthalten:

1. **Verantwortlicher:** vollständige rechtliche Identität, Anschrift, Kontakt; Datenschutzbeauftragter nur falls tatsächlich bestellt/erforderlich.
2. **Bereitstellung der Website über Vercel:** Datenkategorien (IP, Datum/Zeit, URL, Referrer, Browser/Headers), Zwecke, Rechtsgrundlage, Empfänger/Auftragsverarbeiter, bestätigte Löschkriterien, Regionen und ggf. Art.-44-ff.-Garantien.
3. **TLS, Sicherheits- und Serverlogs:** Umfang, Zwecke, Zugriffsberechtigte, Retention; keine unbestätigten Vercel-Details behaupten.
4. **Lokale Browser-Speicherung:** alle vier Schlüssel, Inhalte, Funktionszweck, Dauer, Löschmöglichkeiten und §-25-Einordnung; klarstellen, dass lokale Speicherung allein keine Übertragung an Dalemans ist.
5. **Warenkorb/Produktauswahl:** lokale Speicherung; Übertragung erst bei Angebotsanfrage.
6. **Raumplaner:** lokale Geometrie-/Projektdaten, Projektname/Zeitstempel, 2D/3D lokal, lokale GLB-Assets, JSON-Import/-Export, Browserdruck/PDF, Löschung und Sicherheits-/Teilungshinweis.
7. **Raumplaner-Anfrageübergang:** welche Zusammenfassungsdaten nach aktivem Klick in die Kontakt-URL und später ggf. ins Formular gelangen; keine Behauptung, dass die vollständige Geometrie übertragen wird.
8. **Kontaktformular:** Pflicht-/optionale Felder, technische Submission-ID, Honeypot, Rate-Limit-Kennung, Hostingverarbeitung, SMTP-/Mailboxempfänger, Zwecke, Rechtsgrundlage, Löschkriterien und Alternativkontakt.
9. **Angebotsanfrage:** Kontaktdaten, Kundenart, Produktauswahl, optionale PLZ/Nachricht, Anfrage-ID, interne E-Mail und Kundenbestätigung; Rechtsgrundlage und Speicher-/Löschkonzept.
10. **E-Mail/IONOS:** nur nach Bestätigung Anbieter, Rolle, Empfänger, Speicherorte, AVV, Unterauftragsverarbeiter und Drittlandthemen aufnehmen.
11. **Formular-Missbrauchsschutz:** 15-Minuten-Rate-Limit, ggf. gesalzener IP-Hash nur bei vertrauenswürdigem Edge-Header, Idempotenzfristen (Kontakt 10 Minuten, Inquiry-Ergebnis 24 Stunden), keine Inhaltslogs; nur aufnehmen, wenn Production-Konfiguration dies tatsächlich so umsetzt.
12. **Interne Suche/Wissensvorschau:** Suchbegriff an eigene Serverroute, mögliche URL-/Hostinglogs, kein aktives Suchtracking.
13. **Lokale Medien/PDF/3D und externe Links:** Ressourcen vom eigenen Origin; Google Maps/Gesetzeslinks erst nach Klick; keine Karte/Sozialmedien eingebettet.
14. **Keine aktive Reichweitenmessung/Marketingdienste:** nur solange technisch wahr; kein unnötiger Abschnitt zu nicht verwendeten Diensten erforderlich.
15. **Empfänger/Kategorien und Drittlandübermittlungen:** Vercel, bestätigter Mailprovider, intern Berechtigte; konkrete Transfergrundlage nur nach Vertragsprüfung.
16. **Speicherdauer bzw. Kriterien:** getrennt für Hostinglogs, Rate-Limit-/Idempotenzdaten, Mailbox/Anfragen/Angebote, lokale Browserdaten und Backups.
17. **Rechtsgrundlagen:** für Websitebereitstellung, vorvertragliche Anfragen, Sicherheit/Missbrauchsschutz und ggf. Einwilligung; fachjuristisch bestimmen.
18. **Betroffenenrechte:** Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit soweit anwendbar, Widerspruch, Widerruf soweit Einwilligung, Beschwerderecht und zuständige Aufsichtsbehörde.
19. **Keine automatisierte Entscheidung/Profiling:** nur wenn organisatorisch weiterhin zutreffend.
20. **Änderungsstand/Kontakt für Datenschutzfragen.**

Der ungenutzte Alttext in `src/lib/legal-content.ts:3` darf nicht als Quelle übernommen werden: Er nennt technisch nicht aktive Dienste und veraltete/ungeprüfte Aussagen.

## F. Maßnahmenplan

### WP19.1 – Kritische Datenschutzprobleme

1. Betreiberidentität/Rechtsform und Verantwortlichen verbindlich feststellen.
2. Vercel-DPA/AVV, Regionen, Subprozessoren, Transfergrundlagen, Logs/Retention und Konto-Schalter dokumentieren.
3. Gesamten `public/`-Bestand inventarisieren und jede Veröffentlichung von Personen-, Kunden-, Referenz- und Quelldateien freigeben; nicht freigegebene Assets aus dem Web-Artefakt herausnehmen.
4. Entscheidung zur Preispräferenz: bevorzugt automatische dauerhafte Speicherung entfernen; andernfalls rechtliche Einwilligungslösung festlegen.
5. Raumplaner-Kontaktübergang so minimieren, dass Projektbezeichnungen/-kennzahlen nicht unnötig in URLs/Logs stehen.

### WP19.2 – Kontaktformular / IONOS

1. IONOS als tatsächlichen SMTP-Anbieter bestätigen; AVV/Verarbeitungsorte/Logs/Retention prüfen.
2. Production-Variablen nur serverseitig im Vercel Secret Store setzen; Empfänger und Testmodi dokumentieren.
3. TLS-Modus, Zertifikatsprüfung, SPF/DKIM/DMARC, akzeptierte/abgelehnte Empfänger, Timeout, Bounce und Kundenbestätigungsfehler in isoliertem Staging mit freigegebenem Testpostfach prüfen.
4. Zentralen atomaren TTL-Store und vertrauenswürdigen Client-IP-Vertrag umsetzen; Origin-Schutz ergänzen; Mehrinstanz-/Restart-Test.
5. Mailbox-/Anfrage-Löschkonzept und Berechtigungskreis festlegen.

### WP19.3 – Datenschutzhinweise und rechtliche Seiten

1. Datenschutzerklärung anhand Abschnitt E finalisieren und fachjuristisch freigeben.
2. Impressum nach § 5 DDG auf Betreibername, Rechtsform, Vertretung, Register/weitere berufsbezogene Angaben (falls einschlägig) prüfen.
3. AGB und B2B/B2C-Darstellung prüfen; derzeit besteht nur ein unverbindlicher Anfrageprozess, kein Checkout. Prüfen, welche Shop-/Fernabsatztexte für den tatsächlichen Vertragsschlussweg erforderlich sind.
4. Kontaktdaten in Impressum, Datenschutz, Footer, strukturierten Daten und E-Mail-Templates konsistent halten.
5. Alttext in `src/lib/legal-content.ts` eindeutig stilllegen/archivieren, ohne Veröffentlichung.

### WP19.4 – Technische Absicherung

1. CSP auf finaler Domain reporten, auswerten, Inline-Ausnahmen reduzieren und anschließend separat enforcing freigeben.
2. Vercel-/Proxy-Logs so konfigurieren, dass Query-Strings/Formularinhalte nicht unnötig aufbewahrt oder an unbestätigte Log-Drains gesendet werden.
3. Öffentliche API-Routen mit Limits, Origin-Verhalten, Cache-Headern und Fehlerfällen testen.
4. Lokale Datenlöschung verständlich und vollständig anbieten; Projekt-/Warenkorb-Fristen fachlich entscheiden.
5. Regelmäßige Dependency-/CVE-Prüfung und Patchprozess definieren.

### WP19.5 – Abschließender Livegang-Test

1. Deployment auf Staging mit derselben Vercel-/Region-/Env-Konfiguration wie Production.
2. Browser-Netzwerkprüfung aller Kernpfade: Start, Produkte, Stoff-PDF, Suche, Kontakt, Anfrage, Raumplaner 2D/3D, JSON, Druck/PDF, externe Links.
3. Cookies/LocalStorage/SessionStorage/IndexedDB vor und nach jeder Interaktion dokumentieren; keine unerwarteten Drittrequests.
4. Formulare ausschließlich mit freigegebenen synthetischen Testdaten/Testpostfach prüfen; Logs auf PII/Secrets kontrollieren.
5. `dalemans.de`: DNS, TLS, HTTP→HTTPS, HSTS, Header/CSP, Canonical/`NEXT_PUBLIC_SITE_URL`, Vercel-Logs und Löschvorgaben bestätigen.
6. Rechtliche Endabnahme protokollieren; erst danach Production-Freigabe.

## G. Go-live-Checkliste

### Technisch geprüft

- [x] **Technisch geprüft:** Keine aktiven GA/GTM/Ads/Vercel-Analytics/Speed-Insights/Marketing-Pixel gefunden.
- [x] **Technisch geprüft:** Keine externen Webfonts, Videos, Social-Embeds, Karten-Embeds oder Captchas gefunden.
- [x] **Technisch geprüft:** Shopify ist nicht aktiver Commerce-Provider.
- [x] **Technisch geprüft:** Raumplaner-Geometrie, 2D/3D, JSON und PDF/Druck arbeiten im aktiven Pfad clientseitig.
- [x] **Technisch geprüft:** Vier LocalStorage-Schlüssel; keine Cookies, SessionStorage oder IndexedDB im Anwendungscode.
- [x] **Technisch geprüft:** Formularfelder, Bodylimits, Validierung, Honeypot, technische Logs und serverseitige SMTP-Secrets erfasst.
- [x] **Technisch geprüft:** Impressum und Datenschutz sind durch den globalen Footer auch auf Raumplaner-/Produktseiten erreichbar (`src/app/layout.tsx:71-102`; `src/components/Footer.tsx:58-63`).
- [x] **Technisch geprüft:** Offline-Dependency-Audit am 28.10.2026 ohne bekannte Funde.

### Manuell zu prüfen

- [ ] **Manuell zu prüfen:** Vercel-Tarif, DPA/AVV, Regionen, Logs/Retention, Log-Drains, Analytics-/Speed-Insights-Kontoschalter, Unterauftragsverarbeiter.
- [ ] **Manuell zu prüfen:** Production-Environment-Variablen; `NEXT_PUBLIC_SITE_URL=https://dalemans.de`; keine alten Builder-/Shop-/Trackingvariablen aktiv.
- [ ] **Manuell zu prüfen:** IONOS SMTP/AVV/TLS/Logs/Retention/Empfänger sowie SPF, DKIM und DMARC.
- [ ] **Manuell zu prüfen:** Vollständiger Asset-/Metadaten-/Rechtecheck aller Dateien unter `public/`.
- [ ] **Manuell zu prüfen:** Interne Mailboxen, Zugriffsberechtigte, Archiv/Backup und Löschablauf.
- [ ] **Manuell zu prüfen:** Staging-Netzwerkcrawl zeigt ausschließlich erwartete First-Party-Verbindungen; Klick-Links separat dokumentieren.
- [ ] **Manuell zu prüfen:** Vercel-Access-/Function-Logs enthalten keine Request-Bodies, Mailadressen, Telefonnummern, Projektquerys oder Secrets über das notwendige Maß hinaus.
- [ ] **Manuell zu prüfen:** Finaler TLS-/Header-/CSP-Test auf `dalemans.de`.

### Rechtlich zu prüfen

- [ ] **Rechtlich zu prüfen:** Verantwortlicher, Rechtsform, Vertreter und vollständige §-5-DDG-Angaben.
- [ ] **Rechtlich zu prüfen:** Rechtsgrundlagen nach Art. 6 DSGVO für Hosting, Formulare, Angebote und Missbrauchsschutz.
- [ ] **Rechtlich zu prüfen:** §-25-TDDDG-Einordnung aller LocalStorage-Zugriffe, besonders Preispräferenz.
- [ ] **Rechtlich zu prüfen:** Art. 28 und 44 ff. für Vercel/IONOS und deren Unterauftragsverarbeiter.
- [ ] **Rechtlich zu prüfen:** Speicher-/Löschfristen oder Kriterien für Logs, E-Mails, Anfragen, Angebote und Backups.
- [ ] **Rechtlich zu prüfen:** Endfassung Datenschutz, Betroffenenrechte, Aufsichtsbehörde und Widerspruch/Widerruf.
- [ ] **Rechtlich zu prüfen:** AGB und erforderliche B2B-/B2C-/Fernabsatztexte für den tatsächlichen Vertragsschlussweg.
- [ ] **Rechtlich zu prüfen:** Bild-/Personen-/Kunden-/Referenzfreigaben.

### Offen / Go-live-Blocker

- [ ] **Offen:** Juristisch freigegebene Datenschutzerklärung veröffentlicht.
- [ ] **Offen:** Impressum/Verantwortlicher verifiziert und freigegeben.
- [ ] **Offen:** Vercel-/IONOS-Verträge, Datenflüsse und Drittlandfragen dokumentiert.
- [ ] **Offen:** Produktionsfester verteilter Formularschutz und Origin-Prüfung nachgewiesen.
- [ ] **Offen:** SMTP-Stagingtest mit synthetischen Daten und Testempfänger erfolgreich; Fehler-/Bouncepfade geprüft.
- [ ] **Offen:** Automatische Preispräferenz-Speicherung entfernt/begrenzt oder wirksam eingewilligt.
- [ ] **Offen:** Raumplaner-Query-Übergabe minimiert und transparent dokumentiert.
- [ ] **Offen:** Öffentliche Assets vollständig freigegeben; keine unbeabsichtigten Dateien im Deployment.
- [ ] **Offen:** Finaler Production-ähnlicher Netzwerk-, Storage-, Log-, TLS- und Headertest bestanden.

## H. Fortschritt WP19.1 – technische Datenschutz-Fixes

**Umsetzungsstand:** 28. Oktober 2026. Dieser Abschnitt dokumentiert technische Korrekturen; er ist keine rechtliche Freigabe und ersetzt weder Verträge noch einen Test des tatsächlichen Vercel-/IONOS-Betriebs.

| Feststellung | Status | Umsetzung / verbleibender Punkt |
|---|---|---|
| Automatische Preispräferenz `dlmns-customer-price-mode` | **Behoben** | Die Preisart liegt nur noch im React-State. Ein vorhandener Alt-Eintrag wird beim Laden entfernt und nicht wiederhergestellt. Umschalter und Netto-/Bruttodarstellung bleiben unverändert. |
| Raumplaner-Zusammenfassung in Kontakt-URL | **Behoben** | Neue Übergaben verwenden ausschließlich `/kontakt#anfrage`. Die Zusammenfassung liegt vorübergehend im `sessionStorage` des Tabs, wird in das Formular übernommen und nach erfolgreichem Versand gelöscht; spätestens mit Ende der Tabsitzung entfällt sie. Bestehende alte Query-Links werden weiter gelesen und anschließend per `history.replaceState` aus der sichtbaren Historie bereinigt. Der initiale Request eines alten Links kann technisch weiterhin in vorgeschalteten Logs stehen. |
| Request-Größen, serverseitige Feldvalidierung, Honeypot und Header-Injection | **Behoben** | Bestehende Größen- und Feldlimits bleiben aktiv. Betreff- und andere Headerwerte werden einzeilig validiert/bereinigt; Absender und Empfänger kommen ausschließlich aus validierter Serverkonfiguration. Fremde Origins und Cross-Site-Requests werden abgewiesen. |
| Mehrinstanzfähiges Rate-Limit und Idempotenz | **Manuelle Konfiguration erforderlich** | Atomarer Redis-REST-Pfad für Rate-Limit und Idempotenz ist implementiert. Gespeichert werden nur gesalzene/gehashte technische Schlüssel sowie beim Inquiry ein technisches Ergebnis ohne Kontaktdaten; TTL: 15 Minuten (Rate), 10 Minuten (Kontakt-Idempotenz), 24 Stunden (Inquiry-Idempotenz). Produktion fällt ohne Store bewusst mit 503 aus; In-Memory wird nur in lokaler Entwicklung verwendet. |
| Datenschutzfolge des zentralen Stores | **Rechtlich zu prüfen** | Empfohlen ist Upstash Redis über den Vercel Marketplace. Anbieter, Region, AVV/DPA, Unterauftragsverarbeiter, Transfergrundlage und Lösch-/Backupverhalten sind vor Aktivierung zu prüfen. Trotz Hashing kann der Rate-Key als pseudonymes Datum einzuordnen sein. |
| Origin-/Client-IP-Vertrag auf Vercel | **Manuelle Konfiguration erforderlich** | `FORM_CLIENT_IP_HEADER=x-forwarded-for`, stabiles geheimes `FORM_RATE_LIMIT_HASH_SALT`, freigegebene Origins und tatsächliches Headerverhalten im Staging prüfen. Vercel dokumentiert, dass `x-forwarded-for` standardmäßig mit der Client-IP überschrieben wird; bei vorgeschaltetem Proxy ist der Vertrag neu zu bewerten. |
| SMTP TLS und Empfänger | **Teilweise behoben** | Für Port 587 wird STARTTLS erzwungen (`requireTLS`), Zertifikatsprüfung und mindestens TLS 1.2 sind aktiv. Kontakt- und Inquiry-Empfänger müssen serverseitig gesetzt und syntaktisch gültig sein; es gibt kein Empfänger-Fallback. Echte IONOS-Zustellung wurde ohne Zugangsdaten nicht getestet. |
| Vercel-/IONOS-Verträge, Regionen, Logs, Retention | **Weiterhin offen** | Nicht durch Quellcode lösbar; Konto-, Vertrags- und Betriebsprüfung bleibt erforderlich. |
| Rechtstexte, Verantwortlicher und Impressum | **Rechtlich zu prüfen** | WP19-B01/B02 wurden nicht durch technische Annahmen überschrieben. Fachjuristische Freigabe und tatsächliche Betreiberangaben bleiben Go-live-Blocker. |
| Öffentliche Arbeits-/Quelldateien | **Teilweise behoben** | Sieben eindeutig unreferenzierte Nicht-Laufzeitdateien wurden aus `public/` entfernt: eine XCF-Quelle, zwei CSV-Bearbeitungslisten, eine JSON-Promptdatei und drei Textplatzhalter. |
| Übrige öffentliche Bilder/PDFs/GLBs | **Manuelle Konfiguration erforderlich** | Nach Bereinigung verbleiben 422 Dateien (ca. 545 MB). Textscan fand keine erkennbaren Zugangsdaten/Tokens. 405 Rasterbilder wurden technisch geprüft; 91 enthalten EXIF/XMP/IPTC-Blöcke. Inhalte/Rechte und Metadaten müssen redaktionell freigegeben werden. Unklare Dateien, insbesondere Personen-/Referenzbilder wie `CHubert01.jpg` und `Passbild_Stefan_F_edit.jpg`, wurden nicht eigenmächtig gelöscht. |

### Neue technische Funktionsweise

- **Preispräferenz:** Standard ist bei jedem neuen Seitenaufruf „Geschäftskunden · netto“. Eine Umschaltung wirkt innerhalb der aktuellen React-Laufzeit und erzeugt keinen neuen dauerhaften Browser-Eintrag.
- **Raumplaner → Kontakt:** Der Klick schreibt die bestehende Planungszusammenfassung nur in `sessionStorage` und navigiert ohne Query-String. Das Kontaktformular liest diesen First-Party-Tabzustand. Es gibt keine zusätzliche Serverroute, Datenbank oder externe Übertragung.
- **Formularschutz:** In Development steht ein begrenzter lokaler Ersatz für Tests zur Verfügung. In Production sind `FORM_PROTECTION_REST_URL`/`FORM_PROTECTION_REST_TOKEN` oder die Upstash-Standardvariablen zwingend. Rate-Limit und Idempotenz werden atomar per Redis-Lua ausgeführt; Formulardaten selbst werden nicht in Redis geschrieben.
- **Fehlerbehandlung:** Fehlende Schutz-/SMTP-Konfiguration und Zustellfehler liefern allgemeine 5xx-Antworten. Logs enthalten weiterhin nur technische Eventcodes, keine Bodies, E-Mail-Adressen, Telefonnummern, Secrets oder SMTP-Fehlerdetails.

### Vercel-/IONOS-Einrichtung (manuell)

1. Über Vercel Marketplace einen Redis-Anbieter (bevorzugt Upstash) wählen und Region, Vertrag/AVV, Unterauftragsverarbeiter, Retention und Transfers prüfen.
2. Schreibfähige REST-Zugangsdaten ausschließlich als serverseitige Vercel-Variablen setzen: `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` oder die projektspezifischen `FORM_PROTECTION_*`-Namen. Keine `NEXT_PUBLIC_`-Variablen verwenden.
3. `FORM_CLIENT_IP_HEADER=x-forwarded-for`, ein zufälliges stabiles `FORM_RATE_LIMIT_HASH_SALT` und gegebenenfalls `FORM_ALLOWED_ORIGINS` setzen. Preview-Origins nur ausdrücklich freigeben.
4. IONOS SMTP serverseitig konfigurieren: Host laut IONOS-Vertrag, Port 587 mit `CONTACT_SMTP_SECURE=false` (STARTTLS wird erzwungen) oder Port 465 mit `true`, Benutzer/Passwort, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` und `INQUIRY_TO_EMAIL`.
5. Zunächst Staging-Testmodi und freigegebene synthetische Testadressen verwenden. Zertifikat, angenommene Empfänger, SPF/DKIM/DMARC, Bounce-Pfad und Logs kontrollieren. Ohne diesen Test ist erfolgreiche Zustellung nicht nachgewiesen.

### Teststatus WP19.1

- **Behoben / automatisiert geprüft:** TypeScript, ESLint, Produktions-Build, Preispräferenz ohne Persistenz, Raumplaner-Handoff ohne Query-String, Kontaktübernahme, Bodylimits, ungültiges JSON, Honeypot, Origin-Abweisung und fehlende Production-Store-Aktivierung.
- **Regressionstest-Bestand:** Die gezielte WP19.1-/Formular-/Raumplaner-Suite ist mit 10/10 Tests grün. Die ergänzend ausgeführte Shop-/Cart-/Inquiry-Suite bestand mit 51/56 Tests. Vier Fehler referenzieren bereits entfernte `/shop/produkt/...`- bzw. `/shop/gleiter-finder`-Routen und landen reproduzierbar auf der vorhandenen 404-Seite; ein weiterer bestehender Fokus-Test erwartet einen im leeren Warenkorb nicht vorhandenen Link. Diese fünf Testbestandsfehler wurden nicht durch WP19.1 verursacht und nicht durch produktfremde Änderungen kaschiert. Die übrigen Cart-/Inquiry-/Commerce-Tests, einschließlich der produktiven Angebotsanfrage, sind grün.
- **Manuelle Konfiguration erforderlich:** echter Mehrinstanztest mit provisioniertem Redis, Restart-/TTL-/Abusetest auf Vercel sowie SMTP-Stagingtest mit IONOS-Testpostfach.
- **Weiterhin offen:** Production-Netzwerk-/Logprüfung auf `dalemans.de`, komplette Rechtefreigabe des Medienbestands und rechtliche Endabnahme.

## Zentrale Raumplaner-Antwort

**Ja, ein Kunde kann den Raumplaner im geprüften aktiven Funktionspfad vollständig für Zeichnung, Speicherung, 2D/3D, JSON-Import/-Export und Druck/PDF verwenden, ohne dass die eigentliche Raumgeometrie oder ein Projekt an eine besondere externe Raumplaner-API übertragen wird.** Technisch notwendig bleiben Verbindungen zum Hostingserver/Vercel zum Laden der Seite, JavaScript-Bundles, lokalen Bilder, PDFs und GLB-Modelle. Vercel sieht dabei normale Verbindungs-/Requestdaten.

Die Pläne liegen im LocalStorage des jeweiligen Browsers und sind nicht über eine Projekt-ID-API öffentlich abrufbar. Andere Benutzer/Geräte erhalten keinen serverseitigen Planlink. Risiken bestehen lokal durch gemeinsam genutzte Browserprofile, Browser-Synchronisation außerhalb des Einflusses der Website, XSS/Browsererweiterungen, unverschlüsselt exportierte JSON/PDF-Dateien und bewusstes Teilen. Bei Klick auf „Angebot … anfordern“ wird **nicht die vollständige Geometrie**, aber eine Zusammenfassung samt frei gewähltem Projektname als Kontakt-URL an den Hostingserver übergeben (`src/components/room-planner/2d/RoomEditor2D.tsx:148-150`).

## Abschlussurteil

- **final_state:** Audit abgeschlossen; nur dieses Ergebnisdokument wurde erstellt, Anwendungscode blieb unverändert.
- **privacy_status:** technisch datensparsam, aber wegen Rechtstext-, Vertrags-, Formularschutz- und Public-Asset-Blockern nicht livegangbereit.
- **critical_findings:** nicht freigegebene Datenschutzerklärung; unklarer Verantwortlicher/Impressum; Vercel/IONOS-Verträge/Regionen/Logs offen; öffentlicher Assetbestand ungeprüft; instanzlokaler Formularschutz; automatische Preispräferenz; Raumplaner-Zusammenfassung in URL.
- **cookie_banner_required:** kein allgemeiner Tracking-Banner; bei unveränderter automatischer Preispräferenz besteht eine punktuelle Einwilligungsfrage. Bevorzugt Speicherung entfernen/begrenzen, damit ein Banner vermieden werden kann; juristisch bestätigen.
- **third_party_services:** aktiv/technisch erforderlich: Vercel als geplanter Hoster; SMTP-Anbieter erst bei konfiguriertem Versand (IONOS geplant, nicht verifiziert). Google Maps/Gesetze nur nach Klick. Shopify, Analytics, Speed Insights, externe Fonts, Social, Captcha und Marketing sind nicht aktiv.
- **contact_form_status:** Kontakt- und Angebotsmailversand sind generisch per Nodemailer/SMTP implementiert; lokale/Production-IONOS-Konfiguration und echte Zustellung nicht nachgewiesen; Schutz nicht mehrinstanzfest.
- **room_planner_privacy:** Kernverarbeitung lokal; keine externe Planer-API; lokale dauerhafte Projekte; vollständige Geometrie bleibt lokal, Anfrageklick überträgt nur eine URL-Zusammenfassung.
- **vercel_privacy:** Serverfunktionen und Hosting verarbeiten Verbindungs-/Formulardaten; Region, DPA/AVV, Logs, Retention, Kontoschalter und Drittlanddetails manuell offen.
- **legal_pages:** global erreichbar, aber Datenschutz ist nur technischer Entwurf; Impressum/Betreiberangaben und AGB/B2C-Kontext rechtlich zu prüfen.
- **go_live_blockers:** WP19-B01 bis B04 sowie Abschluss von SMTP/Hosting, Formularschutz, Preispräferenz, Query-Minimierung und finalem Stagingtest.
- **recommended_next_wp:** **WP19.1 – Kritische Datenschutzprobleme**, anschließend WP19.2 (IONOS/Formulare), WP19.3 (Rechtstexte), WP19.4 (Absicherung) und WP19.5 (Livegang-Test).
