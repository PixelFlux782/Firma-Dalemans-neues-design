# Netlify Readiness und Kostenmodell (WP19)

Stand: 4. November 2026. Dieser Bericht beschreibt den lokal geprüften Repository-Zustand. Es wurden weder ein Netlify-Projekt angelegt noch ein Deployment, DNS-Wechsel, Commit oder Push ausgeführt.

## 1. Ausgangszustand

- Next.js 15.5.28, React 19.2, App Router, Node.js 22.x.
- Der Production-Build erzeugt 74 statische Seiten. Dynamisch ausgeführt werden die vier Route Handler (`contact`, `inquiry`, `knowledge/preview`, `search`) sowie die im Build mit `ƒ` ausgewiesenen Seiten `/produkte/suche`, `/wissen/[category]` und `/wissen/[category]/[slug]`.
- Es gibt keine Middleware und keine Server Actions.
- Aktiver Commerce-Provider ist `local`. Produkt- und Preisdaten liegen im Repository und werden serverseitig in statische Seiten bzw. Suchantworten überführt. Der Shopify-Client ist vorbereitet, aber kein Shopify-Provider aktiviert.
- Der Warenkorb läuft vollständig im Browser und wird versioniert in `localStorage` gespeichert. Hinzufügen, Ändern und Entfernen erzeugen keine API-Requests.
- Kontakt- und Angebotsanfrage verwenden Node.js Route Handler und SMTP über Nodemailer. Validierung, Größenlimit, Origin-Prüfung, Rate Limit und Idempotenz sind vorhanden.
- Der PDF-Export verwendet `window.print()` und die Browserfunktion „Als PDF speichern“; er erzeugt keine Serverlast.
- Der Raumplaner, Projektzustand, JSON-Import/-Export und 2D/3D-Synchronisation laufen clientseitig. Der 3D-Renderer wird mit `next/dynamic(..., { ssr: false })` erst für die 3D-Ansicht geladen.
- Stühle und Tische werden mit `THREE.InstancedMesh` gerendert. Ein GLB wird pro URL durch `useGLTF` wiederverwendet; identische Stühle werden nicht einzeln übertragen.
- `public/` enthält 426 Dateien mit zusammen 531,10 MiB. Das ist nicht gleichbedeutend mit Besuchertransfer: Nicht angeforderte Dateien erzeugen keine Bandbreite. Größte Einzeldateien sind unter anderem `Tischkante_Kunststoff.PNG` (87,321 MiB), `Logo_Stage1.png` (33,244 MiB), `Logo_v1.png` (16,565 MiB) und die Original-GLBs. Diese Dateien sind ein Risiko bei direkter Verlinkung, wurden in WP19 aber nicht ohne Nutzungsnachweis verändert oder gelöscht.

## 2. Implementierte Optimierungen

1. `netlify.toml` mit `npm run build`, Publish-Verzeichnis `.next` und Node 22. Der moderne, automatisch angewendete OpenNext-Adapter wird nicht installiert oder festgepinnt.
2. Web-Varianten aller aktiven GLBs mit unveränderter Geometrie, Indizes, UVs, Modellgrenzen, Texturauflösung und Rotation. Nur die vorhandenen 2048×2048-JPEGs wurden effizienter kodiert. Originale bleiben erhalten.
3. Reproduzierbares Skript `npm run optimize:glb` für die Web-GLBs.
4. Siebentägiger Browser-Cache mit Stale-While-Revalidate für `/models/*.glb`, in `next.config.mjs` und damit auch unter Vercel wirksam.
5. Predictive Search: 180-ms-Debounce, kein Request für Ein-Zeichen-Suchen, maximal 50 Antworten im Browser-Cache und keine Wiederholungsabfrage für denselben normalisierten Suchtext innerhalb der Sitzung.
6. Der öffentliche lokale Katalog erhält 60 Sekunden Browser-Cache und eine Stunde Shared-CDN-Cache mit Stale-While-Revalidate. Bei einem späteren nichtlokalen Commerce-Provider bleibt die Antwort bewusst privat.
7. Die Such-API überträgt keine internen Ranking-Felder, Aliaslisten oder vollständigen Variantenindizes mehr; dargestellte Daten, Treffer und Preise bleiben erhalten.

Keine Meshopt-, Draco- oder KTX2-Laufzeitabhängigkeit wurde ergänzt. Das vermeidet Decoder-Downloads und Kompatibilitätsrisiken. KTX2 wäre ein möglicher späterer Schritt, braucht aber einen visuellen Freigabeprozess für alle Materialkanäle.

## 3. Next.js- und Netlify-Kompatibilität

Netlify unterstützt App Router, React Server Components, SSG, SSR, ISR, Route Handler, Redirects, Rewrites und `next/image` über den aktuellen OpenNext-Adapter. Netlify empfiehlt ausdrücklich, die Adapterversion nicht festzupinnen. Quellen: [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) und [Framework setup](https://docs.netlify.com/start/framework-setup/).

| Bereich | Status | Bewertung |
|---|---|---|
| App Router / Server Components | kompatibel | Standardfunktionen, keine experimentelle Runtime nötig |
| Statische Seiten / SSG | kompatibel | 74 Seiten im lokalen Build erzeugt |
| SSR / dynamische Seiten | kompatibel | OpenNext stellt die Serverfunktion bereit |
| Route Handler | kompatibel | Node-Runtime für SMTP ausdrücklich gesetzt |
| `next/image` | kompatibel | Netlify Image CDN wird vom Adapter angebunden |
| Redirects / Header | kompatibel | in `next.config.mjs`, daher Vercel und Netlify |
| ISR / Revalidation | kompatibel, derzeit kaum genutzt | keine anwendungsspezifische On-Demand-Revalidation gefunden |
| Middleware | nicht vorhanden | kein Prüf- oder Migrationsbedarf |
| Static Export / SPA Catch-all | absichtlich nicht verwendet | Serverfunktionen bleiben erhalten |
| Vercel | erhalten | keine Netlify-spezifische Runtime im Anwendungscode |

`output: "standalone"` bleibt für den vorhandenen Docker-/VPS-Pfad bestehen. Der lokale Netlify-Build wurde nicht ausgeführt, weil keine Netlify CLI im Projekt installiert ist und keine Anmeldung oder zusätzliche Projektabhängigkeit erzwungen werden sollte. Der normale Next.js-Production-Build ist erfolgreich.

## 4. Hosting-Kostenkalkulation

### Offizielle Tarifeinheiten

Am Stichtag gelten laut [Netlify Billing FAQ](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/) und [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/):

- Free: 300 Credits/Monat.
- Production Deploy: 15 Credits.
- Bandbreite: 20 Credits pro GB.
- Compute: 10 Credits pro GB-Stunde.
- Web Requests: 2 Credits pro 10.000 Requests.
- Form Submissions: kostenlos; die zugehörigen Function-Requests und Compute-Zeit bleiben messbar.

### Lokale Messwerte

Gemessen mit Chrome, deaktiviertem Cache, lokalem Production-Server und `Network.encodedDataLength`:

| Ablauf | Requests | Transfer |
|---|---:|---:|
| Startseite, Cold Load | 39 | 768.736 Bytes (0,733 MiB) |
| Produktseite Klapptisch 310c, Cold Load | 42 | 363.494 Bytes (0,347 MiB) |
| Raumplaner nur 2D, Cold Load | 31 | 357.373 Bytes (0,341 MiB) |
| Raumplaner bis aktive 3D-Bestuhlung | 41 | 6.563.452 Bytes (6,259 MiB) |
| aktive Stuhl-GLB vorher, HTTP-komprimiert | 1 | 10.313.210 Bytes |
| aktive Stuhl-GLB nachher, HTTP-komprimiert | 1 | 5.583.396 Bytes |

Lokale Messungen bilden Netlifys Edge-Cache und Bild-CDN nicht exakt ab. Sie sind eine reproduzierbare Größenbasis, keine Produktionsmessung.

### Rechenannahmen

- Dezimale Abrechnung: 1 GB = 1.000 MB.
- Pro Besucher: 1,4 MB Basisbandbreite. Das enthält normale Seiten, einen gewichteten Shopanteil von 40 % und Browser-Cache-Effekte. Es ist bewusst höher als der gemessene Startseiten-Cold-Load.
- Basis: 72 Web Requests pro Besucher einschließlich gewichteter Shop-/API-Nutzung.
- Raumplaner „leicht“: 5 % der Besucher laden 3D; „hoch“: 20 %. Zusatz je 3D-Nutzung: 5,92 MB und 10 Requests.
- Compute ist eine Annahme, kein Messwert: 1 GB Standard-RAM, Such-API 1,2 Aufrufe/Besucher × 30 ms, dynamische Suchseite 10 % × 100 ms, Kontakt 1 % × 1 s, Anfrage 0,5 % × 1,5 s, Knowledge Preview 5 % × 50 ms. Daraus entstehen 0,0001833 Compute-Credits pro Besucher.
- Browser-PDF: 0 Server-Requests zusätzlich.
- Eine spätere Amicron-Synchronisation mit täglich einem 5-Sekunden-Lauf bei 1 GB würde rund 0,42 Compute-Credits/Monat hinzufügen. Dieser Zukunftswert ist in der Tabelle nicht enthalten.

Formeln:

```text
Bandbreite_GB = Besucher × (1,4 MB + 3D_Quote × 5,92 MB) / 1.000
Bandbreite_Credits = Bandbreite_GB × 20
Requests = Besucher × (72 + 3D_Quote × 10)
Request_Credits = Requests / 10.000 × 2
Compute_Credits = Besucher × 0,0001833
Gesamt = Bandbreite + Requests + Compute + Deployments × 15
```

### Szenarien

Die letzten drei Spalten enthalten bereits 2, 5 bzw. 10 Production Deployments.

| Besucher | 3D-Quote | GB | Bandbreite-Cr. | Requests | Request-Cr. | Compute-Cr. | Gesamt 2 Deploys | Gesamt 5 Deploys | Gesamt 10 Deploys |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 500 | 0 % | 0,700 | 14,0 | 36.000 | 7,2 | 0,09 | 51,3 | 96,3 | 171,3 |
| 500 | 5 % | 0,848 | 17,0 | 36.250 | 7,3 | 0,09 | 54,3 | 99,3 | 174,3 |
| 500 | 20 % | 1,292 | 25,8 | 37.000 | 7,4 | 0,09 | 63,3 | 108,3 | 183,3 |
| 2.000 | 0 % | 2,800 | 56,0 | 144.000 | 28,8 | 0,37 | 115,2 | 160,2 | 235,2 |
| 2.000 | 5 % | 3,392 | 67,8 | 145.000 | 29,0 | 0,37 | 127,2 | 172,2 | 247,2 |
| 2.000 | 20 % | 5,168 | 103,4 | 148.000 | 29,6 | 0,37 | 163,3 | 208,3 | 283,3 |
| 5.000 | 0 % | 7,000 | 140,0 | 360.000 | 72,0 | 0,92 | 242,9 | 287,9 | 362,9 |
| 5.000 | 5 % | 8,480 | 169,6 | 362.500 | 72,5 | 0,92 | 273,0 | 318,0 | 393,0 |
| 5.000 | 20 % | 12,920 | 258,4 | 370.000 | 74,0 | 0,92 | 363,3 | 408,3 | 483,3 |
| 10.000 | 0 % | 14,000 | 280,0 | 720.000 | 144,0 | 1,83 | 455,8 | 500,8 | 575,8 |
| 10.000 | 5 % | 16,960 | 339,2 | 725.000 | 145,0 | 1,83 | 516,0 | 561,0 | 636,0 |
| 10.000 | 20 % | 25,840 | 516,8 | 740.000 | 148,0 | 1,83 | 696,6 | 741,6 | 816,6 |

Bewertung:

- 500 und 2.000 Besucher passen in allen modellierten Varianten selbst mit 10 Deployments in Free.
- 5.000 Besucher passen nur bei niedriger 3D-Nutzung und begrenzten Production Deployments verlässlich unter 300 Credits. Bereits 5 % 3D plus 5 Deployments liegt modelliert bei 318 Credits.
- 10.000 Besucher überschreiten Free schon ohne 3D. Dafür ist der Pro-Tarif mit mindestens 3.000 Credits die passende Ausgangsstufe; Netlify nennt Pro ab 20 USD/Monat. Quelle: [Pro vs Free](https://www.netlify.com/pricing/pro-vs-free/).
- Größte Einsparpotenziale sind GLB-Transfer, Anzahl produktiver Deployments, Bildbandbreite und Request-Anzahl. Compute ist bei dieser Architektur nicht der Kostentreiber.

## 5. Performance vorher/nachher

| Modell | vorher | nachher | Ersparnis |
|---|---:|---:|---:|
| Stuhl Low | 11.214.628 B | 6.471.472 B | 42 % |
| Tisch 210 Low | 4.437.116 B | 1.432.480 B | 68 % |
| Tisch 310 Low | 5.419.060 B | 1.900.212 B | 65 % |
| Trapeztisch Low | 5.884.876 B | 1.718.320 B | 71 % |

Die nichtbildlichen Buffer der Vorher-/Nachher-Dateien sind byteidentisch. Die JPEG-Mittelabweichung liegt je Textur zwischen 0,49 und 2,61 von 255. Der tatsächliche komprimierte HTTP-Transfer der Stuhl-GLB sinkt um 45,9 %. Ein 2D-Aufruf erzeugt nachweislich keinen GLB-Request; beim Wechsel zu einer 3D-Ansicht mit berechneten Sitzen wird genau eine Stuhl-GLB angefordert.

## 6. Formular- und API-Verhalten

| Aktion | Ort | Requests pro Aktion | Daten / Laufzeit | Optimierung |
|---|---|---:|---|---|
| Produktübersicht / Produktdetail | überwiegend statisch | Seitennavigation + Assets | lokaler Katalog im Build | bereits CDN-fähig |
| Predictive Search, leer | Server Route Handler | 1 beim Öffnen | öffentliche Featured-Einstiege | Browser- und CDN-Cache |
| Predictive Search, 1 Zeichen | Client | 0 | lokale „zu kurz“-Antwort | implementiert |
| Predictive Search, neue Abfrage | Server Route Handler | 1 nach 180 ms | `gleiter`: 40.557 B vorher, 5.461 B nachher (−86,5 %) | implementiert |
| Wiederholte identische Suche | Client | 0 innerhalb Sitzung | aus Map mit max. 50 Einträgen | implementiert |
| Variantenwechsel / Preisstaffel | Client | 0 | vorhandene Produktdaten | bereits optimal |
| Warenkorb add/update/remove | Client | 0 | `localStorage` | bereits optimal |
| Angebotsanfrage | Server Route Handler | 1 POST | SMTP; typischerweise 1–1,5 s angenommen, nicht gemessen | Validierung, Idempotenz, Rate Limit vorhanden |
| Kontaktformular | Server Route Handler | 1 POST | SMTP; 1 s angenommen, nicht gemessen | Validierung, Idempotenz, Rate Limit vorhanden |
| Knowledge Preview | Server Route Handler | 1 GET | lokale Wissensdaten | klein; kein Umbau nötig |
| PDF | Client | 0 | Browserdruck | bereits optimal |

Preis- und Bestandsdaten werden nicht öffentlich über einen vertraulichen Cache gespeichert. Der Shared Cache gilt nur, solange `COMMERCE_PROVIDER=local` ist. Ein späterer externer Provider fällt automatisch auf `private, max-age=30` zurück.

Netlify Forms bringt derzeit keinen belegten Vorteil: Die vorhandene SMTP-Lösung verschickt Kontakt und strukturierte Angebotsanfragen, während Netlify Forms zusätzliche Next.js-Anpassungen benötigen würde. Sie wurde deshalb nicht ersetzt.

## 7. Shop-Kompatibilität

- Der lokale Katalog hat keine externen Laufzeitabhängigkeiten und ist daher besonders günstig für Netlify.
- Preise werden aus derselben lokalen Quelle für Seite, Konfigurator und Warenkorb übernommen. WP19 verändert keine Preis- oder Bestandslogik.
- Shopify ist nur als Client vorbereitet; `COMMERCE_PROVIDER=shopify` führt derzeit absichtlich zu einem Fehler und ist kein produktiver Pfad.
- Es gibt keinen Zahlungscheckout. Der „Checkout“-Pfad ist eine Angebotsanfrage. WP19 ergänzt keine Zahlungs- oder Bestelllogik.

## 8. 3D-Ressourcenverbrauch

- 3D-Code: dynamischer Client-Chunk, nicht Teil des initialen 2D-Transfers.
- GLB: erst bei tatsächlich vorhandenen, in 3D darzustellenden Stühlen/Tischen.
- Wiederverwendung: `useGLTF` cached pro URL; `InstancedMesh` nutzt eine Geometrie und ein Material für viele Instanzen.
- Stuhlrotation: unveränderte `chairDisplayAngle`-Logik.
- Tischgeometrie und `MODEL_BOUNDS`: unverändert.
- Browser-Cache: sieben Tage, ein Tag Stale-While-Revalidate. Netlify cached unveränderte statische Assets zusätzlich am Edge und invalidiert bei Deployments; siehe [Caching overview](https://docs.netlify.com/build/caching/caching-overview/).

## 9. Amicron-Integrationskonzept

Bestätigt ist für Amicron-Faktura Professional eine offene Shop-Schnittstelle: Aufträge können in einem anpassbaren XML-Format aus Dateien oder per HTTPS importiert werden. Amicron kann die letzte Auftrags-ID als `order_from` übergeben, um nur neue Aufträge abzurufen. Artikelimport/-export und Bestandsabgleich sind je nach Shopanbindung verfügbar. Eine allgemeine, öffentlich erreichbare Amicron-REST-API ist in den geprüften Unterlagen nicht bestätigt. Quellen: [Shop-Schnittstelle und Auftragsimport](https://amicron.de/onlinehilfe/amicron-faktura14/auftrage-importieren.htm), [Webshop-Einstellungen](https://amicron.de/onlinehilfe/amicron-faktura14/einstellungen-shops.htm) und [Artikel-Shop-Schnittstelle](https://amicron.de/onlinehilfe/amicron-faktura14/artikel-shop-schnittstelle.htm).

Empfohlene spätere Architektur:

1. Eine serverseitige Integrationsschicht stellt authentifizierte HTTPS-Endpunkte bereit; Browser greifen nie direkt auf Amicron zu.
2. Bestellungen erhalten eine unveränderliche Shop-ID und einen Idempotenzschlüssel. Exportzustände sind `pending`, `leased`, `exported`, `failed`; ein Abruf bestätigt nicht automatisch den erfolgreichen Import.
3. Amicron ruft nur Bestellungen nach Cursor/`order_from` ab. Wiederholungen liefern dieselbe Bestellung, ohne Duplikate anzulegen.
4. Artikel, Preise und Bestände werden gebündelt und zeitgesteuert synchronisiert. Preise werden vor Angebots-/Bestellabschluss gegen die führende Quelle validiert.
5. Kunden werden nicht als unabhängige Browseroperation synchronisiert, sondern zusammen mit dem Auftrag übertragen und in Amicron zugeordnet.
6. Statusänderungen verwenden eine erlaubte Zustandsmaschine und eine signierte serverseitige Anfrage.
7. Pro Lauf werden Korrelations-ID, Cursor, Datensatzanzahl, Ergebnis und Fehlercode ohne Geheimnisse oder unnötige personenbezogene Daten protokolliert.
8. Retries: exponentiell, begrenzt, mit Dead-Letter-Status und manueller Wiederaufnahme. Netzfehler dürfen keine doppelte Bestellung erzeugen.

Vor Implementierung zu klären: eingesetzte Amicron-Version/Lizenz, unterstütztes XML-Schema, Authentifizierungsverfahren, Statusrückkanal, Artikel-/Bestandsfähigkeiten der konkreten Anbindung und die dauerhafte Datenhaltung. Es wurden keine Endpunkte erfunden und keine produktiven Aufrufe ausgeführt.

## 10. Verbleibende Risiken und Blocker

1. Ein echtes Netlify Deploy Preview wurde nicht erstellt. Adapter, Image CDN, SMTP-Egress und reale Cache-Header müssen dort abschließend geprüft werden.
2. Produktion lehnt Kontakt-/Anfrageversand kontrolliert ab, solange kein verteilter Idempotenz-/Rate-Limit-Store konfiguriert ist. WP19 führt keinen neuen kostenpflichtigen Dienst ein. Vor Netlify-Produktion muss die bereits vorgesehene REST-Store-Konfiguration bereitstehen oder die Schutzarchitektur separat entschieden werden.
3. Der Client-IP-Vertrag ist für den OpenNext-Route-Handler im Deploy Preview zu verifizieren und `FORM_CLIENT_IP_HEADER` entsprechend zu setzen. Netlify dokumentiert die vertrauenswürdige IP über den Functions-Kontext; der App-Route-Handler sieht diesen Kontext nicht direkt.
4. SMTP-Zugangsdaten fehlen lokal; eine echte Zustellung wurde absichtlich nicht ausgelöst.
5. Die Arbeitskopie enthielt vor WP19 fremde Änderungen und gelöschte Katalogdateien. Dadurch schlagen 11 bestehende Suchtests bereits in der reinen lokalen Ranking-Logik fehl. WP19 hat diese fachfremden Änderungen nicht zurückgesetzt.
6. Die sehr großen unreferenzierten Originalbilder in `public/` bleiben erreichbar, falls ihre URL bekannt ist. Vor Produktion empfiehlt sich ein separater Referenz-/Lösch-Audit statt einer pauschalen Entfernung.

## 11. Erforderliche Umgebungsvariablen

Keine Werte oder Geheimnisse gehören ins Repository.

| Variable | Zweck | erforderlich |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL / Origin-Allowlist | ja |
| `COMMERCE_PROVIDER` | derzeit `local` | ja |
| `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE` | SMTP-Verbindung | für Formulare |
| `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD` | SMTP-Authentifizierung | für Formulare, geheim |
| `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `INQUIRY_TO_EMAIL` | Absender/Empfänger | für Formulare |
| `FORM_RATE_LIMIT_HASH_SALT` | stabile pseudonyme Rate-Limit-Schlüssel | Produktion, geheim |
| `FORM_PROTECTION_REST_URL`, `FORM_PROTECTION_REST_TOKEN` | verteilter TTL-/Idempotenz-Store | aktueller Produktionscode, Token geheim |
| `FORM_ALLOWED_ORIGINS` | zusätzliche Preview-Origins | bei freigegebenen Previews |
| `FORM_CLIENT_IP_HEADER` | vertrauenswürdiger Plattform-IP-Header | nach Preview-Prüfung |
| `SHOPIFY_*` | reserviert, derzeit nicht aktiv | nein |

Testmodusvariablen (`CONTACT_MAIL_TEST_MODE`, `CONTACT_TEST_TO_EMAIL`, `INQUIRY_MAIL_TEST_MODE`, `INQUIRY_TEST_TO_EMAIL`) nur in isolierten Preview-Kontexten verwenden.

## 12. Netlify-Preview

1. Repository in Netlify importieren und nur einen Deploy Preview/Branch Deploy verwenden; noch keine Custom Domain setzen.
2. Build wird aus `netlify.toml` gelesen: `npm run build`, Publish `.next`, Node 22.
3. Umgebungsvariablen im Netlify UI nach Deploy Context trennen. Geheimnisse nie mit `NEXT_PUBLIC_` präfixen.
4. Preview-Origin in `FORM_ALLOWED_ORIGINS` aufnehmen. Formulare zunächst mit Testempfänger und Testmodus prüfen.
5. Build-Log muss den automatisch angewendeten aktuellen OpenNext-Adapter zeigen; kein `@netlify/plugin-nextjs` hinzufügen.
6. Smoke-Test: statische Seiten, dynamische Suche, Warenkorb/Reload, Kontakt/Anfrage im Testmodus, 2D/3D, GLB nur nach 3D-Wechsel, PDF, Projekt speichern/laden.
7. Response-Header prüfen: GLB-Cache, Such-Cache, CSP-Report-Only und Sicherheitsheader.
8. Netlify Usage Insights nach einem realistischen Testlauf mit den Annahmen dieses Dokuments vergleichen.

## 13. Späterer Produktivwechsel

1. Erfolgreichen Preview-Stand eindeutig markieren und Deployment sperren/freigeben.
2. Alle Produktionsvariablen setzen, Testmodi deaktivieren, Formularschutz und SMTP mit kontrollierten Testadressen verifizieren.
3. Custom Domain zunächst ohne Löschung des Vercel-Projekts hinzufügen; DNS-TTL vorher reduzieren.
4. DNS nach Netlify-Anleitung umstellen und TLS, Canonical URL, Redirects, Sitemap, Robots, Formulare und 3D prüfen.
5. Mindestens einen vollständigen DNS-TTL-Zeitraum beobachten. Vercel erst danach optional abbauen.
6. Production Deployments bündeln: jeder erfolgreiche Production Deploy kostet 15 Credits; Deploy Previews sind im Credit-Modell kostenlos.

## 14. Rollback zu Vercel

- Anwendungscode und `next.config.mjs` bleiben Vercel-kompatibel; `netlify.toml` wird von Vercel ignoriert.
- DNS auf die vorherigen Vercel-Einträge zurückstellen.
- `NEXT_PUBLIC_SITE_URL` und Origin-Allowlist im Vercel-Projekt auf die Produktivdomain prüfen.
- Den letzten verifizierten Vercel-Deploy erneut als Production markieren. Ein Netlify-Rollback selbst kostet laut Netlify keine zusätzlichen Production-Deploy-Credits, sofern nur ein früherer Deploy wiederhergestellt wird.
- Keine Datenmigration des Warenkorbs ist nötig, weil er browserlokal gespeichert wird. SMTP-/Formularschutz-Secrets müssen auf der aktiven Plattform vorhanden sein.

## 15. Lokale Verifikation

- `npm run lint`: bestanden.
- `npx tsc --noEmit`: bestanden.
- `npm run build`: bestanden; 74 statische Seiten erzeugt.
- Playwright-Auswahl: 43 bestanden (Warenkorb, Inquiry, 2D/3D-Umschaltung und Raumplanerzustand), 11 bestehende Suchtests wegen vorbestehendem Katalog-/Erwartungsdrift fehlgeschlagen.
- GLB-Strukturprüfung: Geometrie-/Accessor-Buffer vor/nachher byteidentisch.
- Netzwerktest: 0 GLB-Requests in 2D, exakt 1 Stuhl-GLB nach berechneter Bestuhlung und 3D-Wechsel; Cache-Control korrekt.
- Netlify CLI: nicht im Projekt vorhanden, deshalb kein `netlify dev` und keine Anmeldung erzwungen.
