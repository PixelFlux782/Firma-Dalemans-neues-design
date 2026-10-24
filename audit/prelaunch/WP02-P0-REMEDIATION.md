# WP02 – P0-Remediation

Stand: 23. Oktober 2026  
Arbeitsumfang: ausschließlich P0-001 bis P0-003 aus dem vorhandenen Pre-Launch-Audit  
Release-Entscheidung: **NO-GO / Freigabe weiterhin ausgesetzt**

## Zusammenfassung

| P0 | Technischer Status | Ergebnis |
|---|---|---|
| P0-001 – simulierte Gleiter-Produkte | **behoben** | Development-Produkte werden am produktiven Provider-Rand ausgeschlossen; Finder, Direktlinks, Suche, Navigation und Sitemap veröffentlichen die simulierten Daten nicht mehr. Nicht freigegebene Preise der verbleibenden, quellbasierten Gleiter wurden entfernt und durch eine Angebotsanfrage ersetzt. |
| P0-002 – kritische Dependency-Sicherheitslücken | **behoben (Produktionsabhängigkeiten)** | Die vier dokumentierten Produktionsbefunde wurden mit kontrollierten Updates behoben. `npm audit --omit=dev` meldet 0 Schwachstellen. Befunde der reinen Dev-Toolchain bleiben separat dokumentiert. |
| P0-003 – Datenschutz und technische Realität | **teilweise behoben** | Die öffentliche technische Beschreibung entspricht jetzt dem geprüften Implementierungsstand. Juristische Pflichtangaben, Rechtsgrundlagen, Dienstleister und Fristen sind bewusst nicht erfunden worden und benötigen eine fachjuristische Freigabe. |

## P0-001 – Simulierte Gleiter-Produkte

### Ursprünglicher Befund

Öffentlich erreichbare Commerce- und Finder-Pfade verwendeten Development-Fixtures mit `DEV-`-SKUs, simulierten Maßbereichen, Preisen, Verfügbarkeit und Kompatibilitäten. Die Daten konnten über Kategorien, Produktsuche, Direktlinks, Finder, Warenkorb und Sitemap wie echte Angebote wirken.

### Identifizierte Ursache

- `src/lib/commerce/providers/local-data.ts` bindet bewusst Development-Fixtures ein.
- Der lokale Commerce-Provider gab diese Daten bisher ohne Publication-Gate aus.
- Der Gleiter-Finder war öffentlich geroutet und in Navigation, Hilfetexten, Suche und Sitemap verlinkt.
- Quellbasierte Gleiter enthielten numerische, aber nicht als Verkaufspreise freigegebene Werte.

### Korrektur

- Zentrale Publication-Policy in `src/lib/commerce/publication.ts`: Produkte mit `DEV-`-SKU, `priceDataStatus: development` oder `finderAttributes.dataStatus: development` werden in Production vollständig ausgeschlossen.
- Sämtliche Produkt-, Kategorie-, Collection- und Direktlink-Abfragen des lokalen Providers laufen über diese Policy.
- `/produkte/gleiter-finder` enthält keine Finder-/Fixture-Imports mehr und liefert immer 404.
- Finder aus Sitemap, Navigation, Suche, Wissensartikeln, Produkt-CTAs und Warenkorbhinweisen entfernt beziehungsweise durch eine allgemeine Gleiter-Beratung über das Kontaktformular ersetzt.
- Nicht freigegebene numerische Gleiterpreise wurden aus `local-glider-products.ts` entfernt. Preis und Verfügbarkeit stehen auf `on_request`; die bestehende unverbindliche Angebotsauswahl bleibt nutzbar.
- Unbetroffene Produktfamilien und Commerce-Funktionen blieben erhalten.
- Regressionstests prüfen Publication-Policy, DEV-SKUs, direkte Produkt-URL, Finder-URL, Sitemap und Anfragepreis.

### Geänderte Dateien

- `src/lib/commerce/publication.ts`
- `src/lib/commerce/providers/local.ts`
- `src/lib/commerce/providers/local-glider-products.ts`
- `src/app/produkte/gleiter-finder/page.tsx`
- `src/app/sitemap.ts`
- `src/components/Header.tsx`
- `src/components/AccessoriesHub.tsx`
- `src/components/shop/ShopNavigation.tsx`
- `src/components/commerce/cart/CartDrawer.tsx`
- `src/components/commerce/ProductVariantSelector.tsx`
- `src/components/search/SearchResultGroups.tsx`
- `src/app/wissen/page.tsx`
- `src/lib/knowledge/guides.ts`
- `src/lib/product-detail-data.ts`
- `src/lib/search/support-documents.ts`
- `tests/p0-release-blockers.spec.ts`
- `tests/commerce.spec.ts`

### Verifikation

- Production-Policy-Test: Development-Produkte vorhanden, aber im Production-Ergebnis vollständig entfernt.
- `/produkte/gleiter-finder`: HTTP 404.
- Development-Direktlink `/produkte/artikel/filzgleiter-fuer-rundrohr`: HTTP 404.
- Sitemap enthält weder Finder noch Development-Produkt.
- Quellbasierte Gleiter zeigen `Auf Anfrage`, keinen unveröffentlichten Zahlenpreis und die bestehende unverbindliche Angebotsauswahl.
- Production-Build erzeugt 74 statische Seiten; gegenüber dem Audit-Stand werden die acht Development-Produktseiten nicht mehr generiert.

### Verbleibende Risiken und Freigaben

- Die Development-Fixtures verbleiben absichtlich für isolierte Entwicklungs-/Logiktests im Repository. Die Production-Provider-Grenze und Regressionstests verhindern ihre Veröffentlichung. Änderungen an Commerce-Providern müssen diese Grenze beibehalten.
- Artikelnummern, Beschreibungen und Kompatibilitäten der verbleibenden quellbasierten Gleiter sind vor Verkaufsfreigabe kaufmännisch zu bestätigen. Es wurden keine neuen Werte erfunden.

## P0-002 – Dependency-Sicherheitslücken

### Ursprünglicher Befund und Analyse

Die tatsächlich installierte Dependency-Struktur und `package-lock.json` wurden mit npm geprüft. Vor der Änderung reproduzierte `npm audit --omit=dev` vier betroffene Produktionspaketgruppen.

| Paket | Vorher | Art / Produktionsrelevanz | Sicherheitsmeldungen | Einstufung | Sichere Version / Änderung | Technische Auswirkung |
|---|---:|---|---|---|---|---|
| `next` | 15.5.22 | direkt; Framework, Server, Routing und Image-Pipeline | GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4, GHSA-4jqv-mc3x-m676, GHSA-mcj8-r9mp-w47p, GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r | bis **kritisch** | 15.5.28 | Patch innerhalb 15.5; Build, Routing und Browsertests bestanden. |
| `nodemailer` | 9.0.3 | direkt; Kontakt- und Angebotsversand über SMTP | GHSA-8m3c-c648-2xjj, GHSA-wmmp-3585-3rmp, GHSA-2x7j-588g-ccc2, GHSA-cc9r-2j5m-2m83, GHSA-6vj9-mwq6-2f5v, GHSA-8vvx-rff5-p5rq, GHSA-v53p-9fqp-m79j, GHSA-39m8-27wv-hr27 | bis **hoch** | 10.2.1 | Kontrollierter Major-Schritt war erforderlich, da sichere Stände oberhalb 10.0.9 liegen. Die verwendete Transport-/Send-API blieb kompatibel; sechs Inquiry-Regressionstests bestanden. |
| `sharp` | 0.35.3 | direkt und über Next; produktive Bildverarbeitung | GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w (einschließlich CVE-2026-96889) | **hoch** | 0.35.5 | Patch aktualisiert die betroffenen nativen Bibliotheken; Build und Bild-Pipeline kompilierten erfolgreich. |
| `source-map-js` | 1.2.1 | transitiv über `postcss`; im installierten Produktionsbaum enthalten | GHSA-68fv-2mgg-jv7q | **hoch** | 1.2.2 per gezieltem Override | Kein API-Umbau; TypeScript, Lint und Production-Build bestanden. |

### Korrektur

- Versionen in `package.json` auf die kleinsten geprüften sicheren Zielstände fixiert.
- `package-lock.json` kontrolliert aktualisiert; keine pauschale Neuinstallation und kein Framework-Major-Upgrade.
- `sharp` und `source-map-js` über enge Overrides gegen transitive Rückstufungen abgesichert.

Installierter Endstand:

- `next@15.5.28`
- `nodemailer@10.2.1`
- `sharp@0.35.5` (auch unter Next dedupliziert)
- `source-map-js@1.2.2` (transitiv unter PostCSS, Override aktiv)

### Verifikation

- `npm audit --omit=dev --json`: **0** Produktionsschwachstellen (0 kritisch, 0 hoch, 0 moderat, 0 niedrig).
- TypeScript, gezieltes ESLint, Production-Build und relevante Inquiry-/Commerce-Tests bestanden.

### Verbleibende Risiken

Der vollständige Audit einschließlich Dev-Dependencies meldet 12 Dev-Toolchain-Gruppen (10 hoch, 2 moderat), unter anderem in den Abhängigkeitsketten von `eslint-config-next` und Tailwind CSS 3. Diese Pakete sind laut `npm audit --omit=dev` nicht Bestandteil des Produktionsbaums. Die angebotenen Sammelfixes verlangen unter anderem ein Tailwind-4-Major-Upgrade beziehungsweise eine ungeeignete ESLint-Konfigurations-Rückstufung und wurden deshalb nicht unkontrolliert in diesen P0-Patch aufgenommen. Sie sind als separates Toolchain-Upgrade mit eigener Migrations- und Teststrecke offen; sie werden hier ausdrücklich **nicht** als behoben bezeichnet.

## P0-003 – Datenschutz und technische Realität

### Ursprünglicher Befund

Die öffentliche Datenschutzerklärung beschrieb unter anderem Google Analytics, Google Ads, Wordfence, iThemes und Cookies, obwohl der Audit-Crawl dafür keine technische Integration fand. Gleichzeitig fehlten die tatsächlich vorhandenen LocalStorage-Nutzungen, SMTP-Formulare und die Raumplaner-Persistenz; außerdem war eine abweichende Telefonnummer genannt.

### Identifizierte technische Realität

- Keine aktive Analytics-, Ads-, Wordfence-, iThemes- oder sonstige Tracking-Integration in der geprüften Anwendung.
- Keine durch die Anwendung gesetzten Cookies im geprüften Stand.
- LocalStorage-Schlüssel: `dlmns-commerce-cart`, `dlmns-customer-price-mode`, `dalemans-room-planner-projects-v1`, `dlmns-room-planner-help-v1`.
- Kontakt- und Angebotsformulare senden über konfiguriertes SMTP; Angebotsanfragen verwenden eine technische Anfragekennung und einen instanzlokalen, aus der Proxy-IP abgeleiteten Hash zur Ratenbegrenzung.
- Schriftarten, Bilder, Produktmedien und 3D-Modelle werden lokal ausgeliefert; externe Links lösen erst nach Nutzeraktion Requests aus.
- Shopify-Konfiguration ist vorhanden, aber der externe Provider ist nicht aktiv.
- Hostinganbieter, SMTP-Anbieter, Standorte, Empfängerkreise, Speicher-/Löschfristen, Rechtsgrundlagen und Auftragsverarbeitungsverträge sind nicht vollständig aus dem Quellcode ableitbar.

### Korrektur

- Die öffentliche Datenschutzseite rendert eine neue technische Ist-Beschreibung aus `src/lib/privacy-technical.ts`.
- Nicht implementierte Dienste und pauschale Cookie-/Tracking-Behauptungen wurden aus der öffentlich gerenderten Fassung entfernt.
- Tatsächliche Browser-Speicherung, Formulardaten, SMTP-Flüsse, lokale Medien, externe Links, Shop-Status und offene Deployment-Fragen wurden präzise dokumentiert.
- Die aktuell verwendete Telefonnummer wurde auf `+49 9342 9153-53` vereinheitlicht.
- Die Fassung kennzeichnet ausdrücklich, dass sie technisch aktualisiert, aber nicht fachjuristisch freigegeben ist.

### Geänderte Dateien

- `src/app/datenschutz/page.tsx`
- `src/lib/privacy-technical.ts`
- `tests/p0-release-blockers.spec.ts`

### Verifikation

Der Browser-Regressionscheck bestätigt die Darstellung der tatsächlichen LocalStorage-Schlüssel und des juristischen Freigabehinweises sowie das Fehlen der alten EU-/Google-Analytics-Behauptungen auf der öffentlichen Seite.

### Offene manuelle und juristische Freigaben

Vor Release sind mindestens zu klären und fachjuristisch freizugeben:

1. exakte verantwortliche Rechtseinheit und Pflichtangaben im Abgleich mit dem Impressum;
2. Hostinganbieter, Serverstandorte, Log-Inhalte und Log-Fristen;
3. SMTP-Anbieter, Empfänger, Auftragsverarbeitung und mögliche Drittlandtransfers;
4. Rechtsgrundlagen, Speicher- und Löschfristen für Kontakt- und Angebotsanfragen;
5. Rechtsgrundlage und technische Ausgestaltung der Ratenbegrenzung;
6. Betroffenenrechte, zuständige Aufsichtsbehörde und vollständige Pflichtinformationen;
7. abschließende Entscheidung, ob für den finalen Deployment-Stand ein Consent-Management erforderlich ist.

## Gesamtverifikation

| Prüfung | Ergebnis |
|---|---|
| `npx tsc --noEmit` | bestanden |
| `npx eslint src tests` | bestanden |
| `npm run build` | bestanden mit Next 15.5.28; 74 statische Seiten |
| `npm audit --omit=dev --json` | bestanden; 0 Produktionsschwachstellen |
| P0-Policy/Datenschutz Playwright | 3/3 bestanden |
| Inquiry Playwright | 6/6 bestanden |
| gezielte Commerce-Regression | 2/2 bestanden |

Hinweise ohne P0-Fehlerstatus: Der Build meldet veraltete Browserslist-/Baseline-Metadaten. Der vollständige Dependency-Audit enthält die oben beschriebenen reinen Dev-Toolchain-Befunde.

## Release-Entscheidung

Die technischen P0-Produkt- und Produktionsdependency-Blocker sind behoben. P0-003 bleibt wegen der ausstehenden fachjuristischen und betrieblichen Bestätigung teilweise offen. Zusätzlich bleiben die bereits im Pre-Launch-Audit genannten P1–P3-Themen und nicht im WP02 beauftragten vollständigen Release-Tests unberührt. Daher wird **keine Release-Freigabe** erteilt.

Es wurden keine Commits, Pushes oder Deployments durchgeführt.
