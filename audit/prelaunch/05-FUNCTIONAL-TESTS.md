# 05 – Funktionale Tests

## Ausgeführte Prüfungen

| Prüfung | Ergebnis | Statusart |
|---|---|---|
| `next build --debug-prerender` | bestanden; 82 statische Seiten generiert | automatisiert |
| `npx tsc --noEmit` | bestanden | automatisiert |
| `npm run lint` | bestanden | automatisiert |
| Stoffkarten-Node-Tests | 11/11 bestanden | automatisiert |
| vollständige Playwright-Suite | 367/436 bestanden; 69 Fehler durch später nicht erreichbaren wiederverwendeten Server verfälscht | automatisiert, nicht als Endergebnis geeignet |
| gezielte Wiederholung, eigener stabiler Production-Server | 72/86 bestanden, 14 reproduzierbare Fehler | automatisiert + Browser |
| Shopnavigation/Stühle/Gestellbilder nach Wiederholung | 36/36 bestanden | automatisiert + Browser |
| Axe WCAG-Regeln, sieben Kernrouten, 390×844 und 1440×900 | nur Raumplaner verletzt `aria-prohibited-attr` (5–6 Nodes) | automatisiert + Browser |
| eigener Kernrouten-Crawl | 11/11 HTTP 200, keine gebrochenen Bilder, keine fehlenden `alt`, kein horizontaler Overflow | Browser |
| Kontakt-API mit lokaler, nicht versendbarer Auditadresse | 503 wegen fehlender SMTP-Konfiguration | API, keine Mail ausgelöst |

Der normale `npm run build` brach einmal nach erfolgreichem Kompilieren bei „Collecting page data“ ohne vollständige Diagnose ab. Der unmittelbar danach seriell und mit Debug-Prerendering ausgeführte Production-Build lief vollständig durch. Das bleibt als nicht reproduzierter Build-Risikohinweis, nicht als bestätigter Codefehler.

## Reproduzierbare rote Tests

- Homepage-Sortimentsbild-Bereitschaft: 1 Fehler; separater Browsercrawl fand später keine gebrochenen Bilder. Als Timing-/Lazy-Loading-Risiko offen.
- Wissensintegration: vier Fehler; erwartete Stoffgruppen-Infoauslöser fehlen, Tischkantenfluss läuft in Timeout.
- Sitemap-Crawl: 404-Konsolenfehler von `/api/knowledge/preview` für nicht vorhandene Tischkanten-Wissenseinträge.
- Mobile Touch-Ziele: zwei Preisumschalter nur 36 px hoch.
- Planner-Shop-Handoff: zwei Logiktests erwarten `canAddToCart=false`, tatsächlich `true`; Spezifikation und aktueller Inquiry-Modus widersprechen sich.
- Planner-Workspace: bei 1440×900 endet der Editor bei y=952 statt maximal 900 (zwei Tests).
- Suche: drei Rankingtests fehlgeschlagen (exakter Titel fehlt, Prefix als Synonym, Tippfehler priorisiert falsches Produkt).

## Routeinventar

64 URLs stehen in der Sitemap: Start, Produkte, Finder/Reihenverbinder, Raumplanung, Beratung, Sonderlösungen/-posten, Firma, Kontakt, Wissen, 3 generische Produktseiten, 7 Wissensartikel, 8 Sortimentseiten, 25 Artikel und 5 Stapelstuhlmodelle. Zusätzlich erreichbar, aber nicht in der Sitemap: `/anfrage`, `/datenschutz`, `/impressum`, `/produkte/suche`, `/raumplaner`, `/produkte/kategorien` (308 nach `/produkte`) und vier API-Routen.

| Routengruppe | Status | Einstufung |
|---|---|---|
| `/`, `/firma`, `/kontakt`, `/beratung*`, `/raeume-planung*`, `/raumloesungen/gemeindesaal`, `/sonderloesungen`, `/wissen*` | erreichbar; Kerncrawl 200 | produktiv vorgesehen |
| `/produkte`, `/produkte/stapelstuehle*`, `/produkte/artikel/*`, `/produkte/sortiment/*` | erreichbar; zentrale Tests überwiegend grün | produktiv vorgesehen, teilweise P0-Development-Daten/P1-Unfertigkeit |
| `/produkte/gleiter-finder` | erreichbar und funktional, Daten simuliert | **nicht veröffentlichen** |
| `/raumplaner` | erreichbar, Kernfunktionen weitgehend grün | produktiv vorgesehen, vor Freigabe P1 beheben |
| `/sonderposten` | erreichbar, nur Vorschau/Beispielware | unklar/bewusst verbergen erwägen |
| `/anfrage` | erreichbar, Inquiry statt Checkout | produktiv vorgesehen, SMTP/Datenschutz offen |
| `/produkte/suche` | dynamisch, `noindex` | produktiv als Utility |
| `/impressum`, `/datenschutz` | erreichbar, `noindex` | produktiv zwingend, Inhalt derzeit blockierend |
| `/api/contact`, `/api/inquiry` | schreibend; Validierung vorhanden | produktiv vorgesehen, Mail-/Abuse-Hardening offen |
| `/api/search`, `/api/knowledge/preview` | lesend | intern/Utility; Knowledge 404-Rauschen fehlerhaft |
| alte `/shop/*`- und Produktpfade | 301/308 auf neue Struktur | veraltet, korrekt umgeleitet |

## User Journeys

| Journey | Ergebnis | Bewertung |
|---|---|---|
| A – Neukunde | Navigation, Firma, Sortiment und Beratung erreichbar | technisch gut; Entwicklungsbanner und unfertige Produktkachel mindern Vertrauen |
| B – Gleiter kaufen | Finder, Menge und Warenkorb funktionieren technisch | **Blockiert:** simulierte Kompatibilitäten/Preise/Bestände; kein echter Checkout, sondern Anfrage |
| C – Gemeinde plant | Raum zeichnen, Bestuhlung, 2D/3D, Manipulation und Anfragepfad weitgehend getestet | Kern gut; Viewport, Accessibility, fachliche Freigabe offen |
| D – Ersatzteil | Suche/Finder/Produktseiten erreichbar | Suchranking regressiv; Finder-Daten nicht freigegeben |
| E – Mobil | Navigation, Produkt und Kontakt ohne horizontalen Overflow | zwei 36-px-Touch-Ziele; manuelle 200-%-Zoomprüfung offen |
| F – Wiederkehrender Kunde | Local-Storage-Projekte, Autosave, Duplikat, JSON-Import/-Export und Reload durch Tests abgedeckt | bestanden; Datenschutztext erwähnt Speicherung nicht |

## Nicht oder nur teilweise geprüft

- Firefox/WebKit: nicht getestet; Konfiguration verwendet ausschließlich lokales Chrome/Chromium.
- echte SMTP-Zustellung: bewusst nicht ausgelöst; sichere Staging-Umgebung erforderlich.
- echte Zahlung/Bestellung: nicht vorhanden und nicht ausgelöst.
- Browser-Zoom 200 %, Screenreader und Sprachsteuerung: manuell offen.
- Netzabbruch/Throttling und reale mobile Geräte: nur indirekt, nicht vollständig manuell verifiziert.
