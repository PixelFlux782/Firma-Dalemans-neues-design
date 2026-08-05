# Pre-Launch-Audit Dalemans

Stand: 5. August 2026

## A. Gesamturteil

**Nein, zunächst Blocker beheben.**

Der lokal geprüfte Code ist nach den Korrekturen technisch stabil und die automatisierten Chromium-Tests sind vollständig grün. Vor dem Livegang muss jedoch die produktive SMTP-Konfiguration in Vercel bestätigt und mit einem ausdrücklich freigegebenen internen Testempfänger geprüft werden. Lokal sind keine `CONTACT_SMTP_*`-Variablen konfiguriert; eine echte Nachricht an `info@dalemans.de` wurde entsprechend der Sicherheitsvorgabe nicht versendet. Nach diesem externen Nachweis lautet das technische Urteil **Ja, mit kleinen Restpunkten**.

## B. Bestandsaufnahme und durchgeführte Prüfungen

- Framework: Next.js 15.5.22, React 18.3.1, TypeScript 5.6, npm mit `package-lock.json`.
- Git-Ausgangslage: `main...origin/main`, Arbeitsbaum zu Beginn sauber.
- Build: 42 statisch beziehungsweise dynamisch generierte App-Routen einschließlich Icon, API, Sitemap, Robots und 404.
- HTTP-/SEO-Crawl: 35 öffentliche Inhaltsrouten aus Sitemap plus Rechtstexte, Redirect und 404; Status, H1, Canonical, Titel und interne Links geprüft.
- Browser: lokaler Produktionsbuild mit installiertem Google Chrome/Chromium; alle Sitemap-Routen auf Konsolen-, Request- und HTTP-Fehler geprüft.
- Viewports: 320, 360, 390, 430, 768, 1024, 1280, 1440 und 1920 px; kein horizontaler Überlauf auf der Startseite.
- Navigation: Desktop-Struktur statisch geprüft; mobiles Menü einschließlich Fokus, Escape-Taste und Scroll-Lock automatisiert geprüft.
- Formular: native Pflichtfeldvalidierung, E-Mail-Feldtyp, Längenlimits, Doppelabsenden-Sperre, Honeypot, ungültiger JSON-Body, ungültige Felder und >10-KB-Payload geprüft. Keine echte E-Mail versendet.
- Accessibility: `lang="de"`, Skip-Link, Main-Landmark, H1-Anzahl, Alt-Attribute auf der Startseite, Formularlabels, Statusrollen, Fokus nach Antwort und Reduced Motion geprüft.
- SEO: eindeutige Titel/Canonicals, Produktionsdomain, Sitemap, Robots, Open Graph, Twitter Cards, strukturierte Daten und genau eine H1 pro erreichbarer Inhaltsroute geprüft.
- Sicherheit: keine Client-Secrets oder hart codierten Preview-/localhost-URLs gefunden; Kontaktpayload begrenzt, Betreff von Zeilenumbrüchen bereinigt, SMTP-Timeouts ergänzt; `npm audit` nach Korrektur ohne Funde.
- Inhalte: zentrale Firmendaten, Telefonnummer, E-Mail, Gründung 1994, Hubert/Stefan Dalemans, Fertigungspartner-Formulierung, Zielgruppen und Sonderposten-Hinweise geprüft.
- Bilder: aktive Bildpfade im Browser-Crawl geprüft; Produktdarstellung verwendet überwiegend `contain` mit definierten Größen. Defektes Hero-Bild gefunden und ersetzt.

## C. Vollständige Routenliste

| Route | Status | Ergebnis |
|---|---:|---|
| `/` | 200 | geprüft |
| `/produkte` | 200 | geprüft |
| `/produkte/kategorien` | 308 → `/produkte` | beabsichtigter Redirect |
| `/produkte/kategorien/stapelstuehle` | 200 | geprüft |
| `/produkte/kategorien/klapptische` | 200 | geprüft |
| `/produkte/kategorien/transportwagen-zubehoer` | 200 | geprüft |
| `/produkte/rednerpulte` | 200 | geprüft |
| `/produkte/stapelstuhl-mod-1021c` | 200 | geprüft |
| `/produkte/stapelstuhl-1010i` | 200 | geprüft |
| `/produkte/stapelstuhl-1010a` | 200 | geprüft |
| `/produkte/stapelstuhl-1010b` | 200 | geprüft |
| `/produkte/stapelstuhl-e1000` | 200 | geprüft |
| `/produkte/klapptisch-310c` | 200 | geprüft |
| `/produkte/trapezklapptisch-310c` | 200 | geprüft |
| `/produkte/seminar-klapptisch` | 200 | geprüft |
| `/produkte/bistrotisch` | 200 | geprüft |
| `/produkte/stuhltransportwagen` | 200 | geprüft |
| `/produkte/tischtransportwagen` | 200 | geprüft |
| `/produkte/reihenverbinder` | 200 | geprüft |
| `/produkte/buchablage` | 200 | geprüft |
| `/produkte/schreibtablare` | 200 | geprüft |
| `/produkte/stuhlgleiter` | 200 | geprüft |
| `/produkte/tischfuesse-gestellteile` | 200 | geprüft |
| `/produkte/ersatzteile-kleinteile` | 200 | geprüft |
| `/raeume-planung` | 200 | geprüft |
| `/raeume-planung/raumplanung` | 200 | geprüft |
| `/raumloesungen/gemeindesaal` | 200 | geprüft |
| `/beratung-service` | 200 | geprüft |
| `/beratung/stapelstuehle-kaufen` | 200 | geprüft |
| `/sonderloesungen` | 200 | geprüft |
| `/sonderposten` | 200 | geprüft |
| `/firma` | 200 | geprüft |
| `/kontakt` | 200 | geprüft |
| `/impressum` | 200, noindex | geprüft |
| `/datenschutz` | 200, noindex | geprüft |
| `/robots.txt` | 200 | geprüft |
| `/sitemap.xml` | 200 | geprüft |
| beliebige unbekannte URL | 404 | markengerecht korrigiert |

Nicht öffentlich erzeugt werden die im Quellkatalog bewusst zurückgezogenen Produkte der entfernten Kategorie `gemeindestuehle-bankettmoebel`. Es wurden keine öffentlich erreichbaren Test-, Admin- oder Debug-Routen gefunden.

## D. Gefundene und behobene Probleme

| Priorität | Route | Problem und Auswirkung | Status | Datei |
|---|---|---|---|---|
| Hoch | `/` | Hero-PNG wurde vom Next-Image-Endpunkt mit HTTP 400 abgelehnt; sichtbares fehlendes Bild und Konsolenfehler. | behoben, als optimiertes JPEG neu ausgegeben | `src/components/home/HeroCarousel.tsx`, `public/images/optimized/hero/stapelstuehle-hero.jpg` |
| Hoch | Build-Werkzeuge | Zwei hohe transitive Schwachstellen in `brace-expansion` und `picomatch`. | behoben; `npm audit` 0 Funde | `package-lock.json` |
| Mittel | unbekannte URL | Generische 404 ohne markengerechte Hilfe, H1 oder sinnvolle nächste Schritte. | behoben und mit 404-Status verifiziert | `src/app/not-found.tsx` |
| Mittel | `/api/contact` | Keine frühe Payloadgrenze; potenziell unnötige Verarbeitung übergroßer Requests. | 10-KB-Grenze ergänzt, 413 automatisiert geprüft | `src/app/api/contact/route.ts` |
| Mittel | `/api/contact` | SMTP-Verbindung konnte ohne definierte Timeouts lange hängen. | Verbindungs-, Begrüßungs- und Socket-Timeout ergänzt | `src/app/api/contact/route.ts` |
| Mittel | `/api/contact` | Betreff erlaubte Zeilenumbrüche aus Benutzereingaben. | CR/LF vor Versand entfernt | `src/app/api/contact/route.ts` |
| Mittel | `/kontakt` | Pflichtfelder waren visuell nicht als solche markiert; Antwortstatus erhielt keinen Fokus. | Sternmarkierung, Feldlimits und Fokus auf Ergebnis ergänzt | `src/components/ContactForm.tsx` |
| Niedrig | global | Browser-Icon fehlte und konnte einen unnötigen 404 erzeugen. | kompaktes App-Icon ergänzt | `src/app/icon.png` |
| Niedrig | QA | Keine reproduzierbare Browser-Regressionssuite vorhanden. | Playwright-Suite und npm-Script ergänzt | `playwright.config.ts`, `tests/prelaunch.spec.ts`, `package.json` |

## E. Offene beziehungsweise nicht automatisch lösbare Punkte

### Blocker vor Livegang

1. In Vercel müssen `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD`, `CONTACT_FROM_EMAIL` und `CONTACT_TO_EMAIL` vorhanden und für Production gesetzt sein.
2. Danach Formular mit einem ausdrücklich freigegebenen internen Testempfänger prüfen: Eingang, Reply-To, Absenderfreigabe, Fehlerfall und Doppelversand. Keine Kundendaten verwenden.
3. Den aktuellen Code neu deployen; die geprüfte Preview-URL enthält bis dahin noch nicht automatisch die lokalen Korrekturen.

### Restpunkte

- Firefox und WebKit konnten nicht automatisiert installiert werden, weil der Playwright-Download an der lokalen Zertifikatskette scheiterte. Ein realer Safari-/iOS- und Firefox-Smoke-Test bleibt erforderlich.
- Rechtstexte sind technisch erreichbar und plausibel, ersetzen aber keine anwaltliche Endprüfung. Insbesondere Rechtsform/vertretungsberechtigte Person, Registerangaben (falls einschlägig), Rechtsgrundlagen, Speicherdauer, Hosting-Empfänger und Beschwerderecht sollten final geprüft werden.
- DNS, Domainzuordnung, Redirect von alternativen Hosts und TLS nach Domainwechsel wurden nicht verändert.
- Das Verzeichnis `public` umfasst rund 305 MB und enthält zahlreiche große, offenbar nicht aktive Altbilder (bis 33 MB). Sie belasten nicht unmittelbar die aktiven Seitenrequests, erhöhen aber Repository-/Deploymentumfang. Nach einer gesonderten Eigentümerfreigabe sollten nachweislich ungenutzte Assets archiviert werden.
- Lighthouse-Feldwerte für LCP, CLS und INP sowie reale Mobilgeräte/200-%-Browserzoom müssen nach dem finalen Deployment gemessen werden. Der aktive First-Load-JavaScript-Wert liegt laut Build je Route bei etwa 103–117 kB.
- Produktpreise, Verfügbarkeit und Sonderposten müssen vor Veröffentlichung redaktionell bestätigt bleiben; derzeit werden keine unbestätigten aktiven Sonderangebote ausgespielt.
- Monitoring, Fehleralarme und produktive Logs sind extern einzurichten beziehungsweise zu bestätigen.

## F. Manuelle Checkliste unmittelbar vor Veröffentlichung

- [ ] Production-Deployment aus dem geprüften Stand erfolgreich.
- [ ] Alle sechs SMTP-Variablen in Vercel Production vorhanden; keine Werte im Client-Bundle.
- [ ] Eine genehmigte interne Testanfrage empfangen; Reply-To und Absender geprüft.
- [ ] `https://stapelstuhl-klapptisch.de`, `robots.txt` und `sitemap.xml` nach Domainumschaltung erreichbar.
- [ ] Canonicals, Open-Graph-URLs und JSON-LD zeigen auf `https://stapelstuhl-klapptisch.de`.
- [ ] HTTP→HTTPS sowie gewünschte www-/Non-www-Weiterleitung ohne Schleife geprüft.
- [ ] Start, Produkte, drei Kategorien, ein Produkt, Planung, Kontakt, Impressum, Datenschutz und 404 auf echtem Smartphone geprüft.
- [ ] Mobile Navigation, Anruf- und E-Mail-Link auf iOS/Safari und Android/Chrome geprüft.
- [ ] Firefox- und Safari-Smoke-Test durchgeführt; 200-%-Zoom und Tastaturnavigation geprüft.
- [ ] Hero- und Produktbilder auf 320 px und großem Desktop vollständig/scharf kontrolliert.
- [ ] Rechtstexte und Unternehmensangaben final freigegeben.
- [ ] Vercel-Logs nach dem ersten produktiven Formularlauf auf Fehler geprüft.

## G. Von Codex geänderte Dateien

- `.gitignore`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `tests/prelaunch.spec.ts`
- `src/app/api/contact/route.ts`
- `src/app/icon.png`
- `src/app/not-found.tsx`
- `src/components/ContactForm.tsx`
- `src/components/home/HeroCarousel.tsx`
- `public/images/optimized/hero/stapelstuehle-hero.jpg`
- `PRELAUNCH-AUDIT.md`

Nicht von Codex angelegt und bewusst unverändert gelassen: `public/neue bilder/raum-im-alltag-2.png` (während des Audits als unversionierte Datei aufgetaucht).

## H. Testergebnisse

| Prüfung | Ergebnis |
|---|---|
| `npm ci` | erfolgreich |
| `npx tsc --noEmit` | erfolgreich, 0 Fehler |
| `npm run lint` | erfolgreich, 0 Fehler |
| `npm run build` | erfolgreich, 42 Routen/Assets generiert |
| `npm audit --audit-level=high` | 0 Schwachstellen nach Lockfile-Korrektur |
| `npm run test:prelaunch` | 15/15 Tests bestanden |
| Linkprüfung | 33 eindeutige interne Ziele, keine bekannten internen 404-Links |
| Routenprüfung | alle Sitemap-Routen plus Rechtstexte, Redirect und 404 geprüft |
| Browserkonsole/Netzwerk | nach Bildkorrektur keine Fehler auf Sitemap-Routen |
| Responsive | neun Breiten von 320 bis 1920 px ohne horizontalen Startseiten-Überlauf |
| Formular | Validierung und Negativfälle bestanden; kein realer Versand |
| Accessibility-Basis | bestanden; manueller Realgeräte-/Screenreader-Resttest offen |

Hinweis: Veraltete Browserslist-/Baseline-Daten werden als Wartungshinweis ausgegeben. Sie verursachen keinen Build- oder Testfehler und wurden nicht ohne fachliche Notwendigkeit aktualisiert.
