# Netlify Production Readiness und VPS-Portabilität (WP19.1)

Stand: 4. November 2026. Dieses Dokument beschreibt den tatsächlich geprüften lokalen Arbeitsstand. Es behauptet weder ein Netlify-Preview noch eine SMTP-Zustellung, weil dafür kein Zugang beziehungsweise keine Test-Secrets vorhanden waren.

## 1. Technischer Ausgangszustand

WP19 hatte bereits OpenNext-/Netlify-Konfiguration, einen Next.js-Standalone-Build, optimierte GLB-Dateien, kompakte Suchantworten und einen REST-basierten Formularschutz vorbereitet. Im Arbeitsverzeichnis lagen vor WP19.1 weitere nicht commitete Änderungen und gelöschte Katalog-/Quelldateien. Diese wurden nicht zurückgesetzt.

Die gemeldeten elf Suchfehler waren reproduzierbar. Vier deterministische Erwartungen referenzierten inzwischen ersetzte Produkte beziehungsweise den entfernten öffentlichen Gleiter-Finder. Sieben Browserfehler liefen gegen einen vorhandenen, aber veralteten `.next`-Build. Nach Aktualisierung der belegbar veralteten Erwartungen und frischem Build bestehen alle 23 Suchtests.

## 2. Behobene Fehler

- Suchtests verwenden die tatsächlich publizierten Gleiter, Artikelnummern und den aktuellen persönlichen Beratungsweg.
- Predictive Search besitzt jetzt explizite Tests für Debounce, Session-Cache, Leerzustand, Tastatur, Mobilansicht und kompakte API-Payloads.
- Kontakt- und Inquiry-Idempotenz verwenden atomare Claims im gemeinsamen TTL-Store. Ein laufender Claim bleibt für das gesamte Unterdrückungsfenster bestehen (Kontakt 10 Minuten, Inquiry 24 Stunden).
- Wenn SMTP bereits angenommen hat, aber das Speichern des Erfolgsstatus fehlschlägt, wird dem Client kein falscher Versandfehler mehr gemeldet. Der ausstehende Claim bleibt erhalten, statt einen sofortigen Doppelversand zu ermöglichen.
- Netlify erhält zusätzliche verteilte Edge-Limits für `/api/contact` und `/api/inquiry` (5 Requests je IP/Domain in 180 Sekunden). Der atomare Store bleibt für Idempotenz und andere Hosts erforderlich.
- Die globale Root-Canonical wurde aus dem Layout entfernt. Sie hatte auf Unterseiten zusätzlich zur seitenspezifischen Canonical erscheinen können. Der Sitemap-/Canonical-Test besteht wieder.
- Interne Links auf den in Produktion absichtlich nicht publizierten Development-Reihenverbinder führen nun zur erreichbaren Beratungsseite.
- Netlify-Buildartefakte sind in Git, ESLint und Docker ausgeschlossen.
- Ein standardmäßiges `compose.yaml`, ein Docker-Healthcheck und ein reproduzierbares Runtime-Prüfskript wurden ergänzt.

## 3. Suchtest-Ergebnisse

`tests/search.spec.ts`: **23/23 bestanden**.

Abgedeckt sind Produkttitel, Titel-Prefix/-Partial, exakte SKU, Variantenanzeige, Synonyme, Collections, strukturierte Maße mit unabhängiger Wortreihenfolge, Alias, Umlaute/Bindestriche, einfacher Tippfehler, Nulltreffer, Beratungsweg, Ausschluss von Development-Daten, Desktop/Mobil, Tastatur, noindex der Suchseite, Debounce und Request-Caching.

Die Antwort für `/api/search?q=gleiter` ist weiterhin **5.461 Bytes** groß. Der WP19-Wert vor Optimierung war 40.557 Bytes; die Einsparung von 86,5 % bleibt erhalten. Interne Indexfelder, Aliase und Variantenlisten werden nicht an den Browser ausgeliefert. Bei lokalem Katalog gelten `Cache-Control: public, max-age=60` und `CDN-Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. Ein neuer Deploy invalidiert den Netlify-CDN-Stand; der Serverprozess baut den Index pro Prozess einmal neu.

## 4. Kontaktformular-Sicherheit

Vorhanden und geprüft:

- serverseitige Feld-, E-Mail- und Längenvalidierung;
- tatsächlich gestreamte Body-Limits (Kontakt 10.000 Bytes, Inquiry 35.000 Bytes);
- Honeypot;
- Same-Origin-/Allowlist-Prüfung und Ablehnung fremder Origins;
- neutralisierte Betreff-Zeilenumbrüche;
- TLS 1.2+, SMTP-Timeouts und Prüfung akzeptierter Empfänger;
- isolierbarer Testempfängermodus;
- strukturierte technische Logs ohne Request-Body, Adresse, Telefonnummer oder SMTP-Daten;
- atomarer Redis-kompatibler REST-Store für Rate Limit und Idempotenz;
- Fail-closed in Produktion, wenn der verteilte Store nicht konfiguriert oder nicht erreichbar ist;
- Netlify-Edge-Rate-Limit als kostenlose erste Schutzschicht auf allen aktuellen Plänen.

Auf Netlify soll `FORM_CLIENT_IP_HEADER` leer bleiben: OpenNext Route Handler erhalten Netlifys vertrauenswürdiges `context.ip` nicht direkt. Dort gruppiert die Edge-Regel nach IP; der Anwendungsspeicher dient der Idempotenz. Auf Vercel oder einem VPS darf nur ein nachweislich vom Edge/Reverse Proxy bereinigter Single-IP-Header gesetzt werden.

Eine echte SMTP-Zustellung wurde nicht ausgeführt. Lokal fehlen freigegebene Zugangsdaten und ein isolierter Testempfänger. Es wurde keine Kundenmail versendet.

## 5. Netlify-Kompatibilität

Geprüft mit Netlify CLI / Build 37.7.5 und Next.js Runtime 5.16.6:

- `npx netlify-cli@latest build --context deploy-preview --offline`: bestanden;
- 74 statische Seiten erzeugt;
- OpenNext/Next Runtime automatisch angewendet;
- interner Server-Handler erfolgreich gebündelt;
- App Router, SSR, SSG, Route Handler, Redirects und `next/image` bleiben im Standardpfad;
- kein veraltetes `@netlify/plugin-nextjs` im Projekt gepinnt;
- Node 22 ist in `package.json` und `netlify.toml` festgelegt;
- `output: "standalone"` stört OpenNext nicht und bleibt für den VPS erhalten;
- Vercel-spezifischer Anwendungscode wurde nicht eingeführt.

Offizielle Grundlagen: [Next.js auf Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/), [Caching](https://docs.netlify.com/build/caching/caching-overview/) und [Rate Limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/).

## 6. Netlify-Preview

**Preview-URL: nicht vorhanden.** `netlify status` meldete `Not logged in`; es gibt weder `.netlify/state.json` noch eine Projektverknüpfung. Deshalb wurde kein Deployment behauptet und auch kein anonymes Ersatzprojekt erzeugt. Ein echtes Draft-Deployment benötigt einen Netlify-Login und eine ausgewählte Site; der erlaubte Befehl ist `netlify deploy`, niemals `--prod`.

Vor einem Preview sind kontextbezogene Secrets zu setzen, Testmodi zu aktivieren und der Preview-Origin in `FORM_ALLOWED_ORIGINS` aufzunehmen. Netlify setzt bei echten Deploy Previews standardmäßig `X-Robots-Tag: noindex`; zusätzlich wird ein privates oder passwortgeschütztes Preview empfohlen. Quelle: [Deploy Preview Indexierung](https://docs.netlify.com/deploy/deploy-overview/).

Da keine URL existiert, wurden Startseite, Navigation, Kategorien, Produktdetails, Varianten, Suche, Warenkorb, Formulare, 2D/3D, GLB, Persistenz, PDF, Mobile, SEO, Caching und Fehlerseiten nicht auf Netlify selbst getestet. Die entsprechenden lokalen Produktionsprüfungen sind unten dokumentiert.

## 7. Performance-Ergebnisse

| Ressource | vorher | aktuelle Web-Datei | Reduktion |
|---|---:|---:|---:|
| Stuhl | 11.214.628 B | 6.471.472 B | 42,3 % |
| Tisch 210 | 4.437.116 B | 1.432.480 B | 67,7 % |
| Tisch 310 | 5.419.060 B | 1.900.212 B | 64,9 % |
| Trapeztisch | 5.884.876 B | 1.718.320 B | 70,8 % |

Der zuvor gemessene komprimierte Stuhltransfer bleibt mit 10.313.210 → 5.583.396 Bytes dokumentiert. Die aktive 3D-Implementierung referenziert ausschließlich die `*-low-web.glb`-Dateien. Der 3D-View ist dynamisch aus dem 2D-Editor geladen; die relevanten WP19-/WP19.1-Browsertests bestätigen, dass 2D keinen GLB anfordert und die aktive 3D-Szene nur benötigte Modelle lädt.

Der Build meldet 103 kB gemeinsames First-Load-JavaScript. Raumplaner- und Three.js-Chunks bleiben codegesplittet. `next/image` bleibt aktiv und wird auf Netlify automatisch an das Image CDN angebunden.

## 8. HTTP-Caching

- GLB: `public, max-age=604800, stale-while-revalidate=86400`.
- Standalone liefert `Last-Modified` und einen schwachen ETag.
- `If-Modified-Since` liefert lokal 304 ohne Body.
- Der schwache ETag allein lieferte mit Next Standalone 200; darauf wird deshalb nicht als einziger Revalidierungsmechanismus vertraut.
- Netlify behandelt statische Assets als deploy-atomar und verwirft alte Edge-Antworten bei einem neuen Deploy.
- Browser können ein Modell bis zu sieben Tage weiterverwenden. Bei dringenden Modellkorrekturen ist der Dateiname zu versionieren; das ist die sichere hostunabhängige Invalidierung.
- Suche: kurzer Browsercache und einstündiger Shared Cache nur für den lokalen, beim Deploy feststehenden Katalog. Ein externer Commerce-Provider fällt auf privaten 30-Sekunden-Cache zurück.

## 9. VPS-Portabilität

Der normale Next.js-Produktionsbuild besteht. Der erzeugte Standalone-Server wurde auf Port 3200 geprüft:

- `/`, `/produkte`, Produktdetail, `/raumplaner`, `robots.txt`, `sitemap.xml`: 200;
- unbekannte URL: 404;
- Such-API: 200 / 5.461 Bytes;
- Kontakt ohne Store/SMTP: kontrolliert 503, kein Versand;
- GLB: 200, korrekte Größe und Cache-Header.

Die Anwendung benötigt keinen Vercel- oder Netlify-spezifischen Runtime-Aufruf. API-Routen, SMTP, Suche und Commerce laufen unter normalem Node.js. Warenkorb und Raumplanerprojekte liegen derzeit browserlokal. PDF wird im Browser erzeugt. Für einen VPS werden Caddy oder Nginx als TLS-Reverse-Proxy, ein dauerhaft laufender Container, Logrotation, Uptime-/Ressourcenalarme und ein externer beziehungsweise lokaler Valkey/Redis-REST-Endpunkt benötigt. Persistente Backups betreffen dann Secrets/Deploymentkonfiguration und den künftigen Store beziehungsweise eine spätere Bestell-/Amicron-Datenbank, nicht den heutigen Browser-Warenkorb.

## 10. Docker-Konfiguration

Vorhanden sind `Dockerfile`, `.dockerignore`, `compose.yaml`, `.env.docker.local.example` und ein Container-Healthcheck. Das Image ist Multi-Stage, verwendet Node 22 slim, `npm ci`, Next Standalone, einen nicht privilegierten Benutzer, read-only Root-FS im Compose-Betrieb, entfernte Linux-Capabilities, `no-new-privileges`, 768 MB RAM und 1 CPU als lokale Ausgangsgrenze.

Docker ist auf dem Prüfrechner nicht installiert; deshalb wurden weder Linux-Image noch Container real gebaut. Der gleiche Standalone-Artefaktpfad wurde unter Windows erfolgreich gestartet. Vor VPS-Freigabe sind `docker compose build`, Healthcheck, Restart, Logs und ein Last-/Speichertest auf Linux nachzuholen.

## 11. SEO-Sicherheit beim Hostingwechsel

- Canonicals und Open Graph verwenden ausschließlich `NEXT_PUBLIC_SITE_URL`, standardmäßig `https://stapelstuhl-klapptisch.de`.
- Keine Canonical verweist auf Netlify, Vercel, localhost oder eine VPS-IP.
- Sitemap, robots.txt, Metadata API, strukturierte Product-/Breadcrumb-/FAQ-Daten, 301/308-Redirects und 404 wurden lokal geprüft.
- Die versehentliche doppelte Canonical auf Unterseiten ist behoben; alle Sitemap-Routen bestanden den Canonical-Test.
- Nicht publizierte Development-Produkte werden in Produktion gefiltert; interne Links darauf wurden entfernt.

Checkliste Netlify → VPS:

1. identischen Git-Stand als Standalone-Image bauen und Staging-Host testen;
2. alle Server-Secrets getrennt im VPS setzen, niemals ins Image kopieren;
3. SMTP, Store, Origin-Allowlist und bereinigten Proxy-IP-Header testen;
4. Hauptdomain in `NEXT_PUBLIC_SITE_URL` unverändert lassen;
5. Sitemap, Canonicals, OG, Redirects, Statuscodes und Bild-URLs vergleichen;
6. DNS-TTL reduzieren, TLS vorprüfen und DNS erst nach Smoke-Test umschalten;
7. Vercel/Netlify während mindestens eines TTL-Zeitraums als Rollback erhalten;
8. nach Umschaltung Formulare, Suche, Cart, 2D/3D, GLB, PDF und Logs erneut prüfen.

## 12. Amicron-Kompatibilität

Es wurde keine produktive Amicron-Anbindung gebaut oder aufgerufen. Der vorbereitete Ansatz bleibt hosterunabhängig: ausschließlich serverseitige HTTPS-/Datei- beziehungsweise XML-Integrationsschicht, unveränderliche Auftrags-ID, atomare Idempotenz, Cursor/`order_from`, Statusmaschine, begrenzte Retries und dauerhafte Speicherung. Browser erhalten keine Zugangsdaten. Eine allgemeine REST-API wird nicht vorausgesetzt; Version, Lizenz, XML-Schema, Authentifizierung, Statusrückkanal und konkrete Artikel-/Bestandsfähigkeiten müssen vor Implementierung mit Amicron bestätigt werden.

Für eine echte Bestellübertragung ist eine persistente hosterunabhängige Outbox erforderlich. Netlify Functions, Vercel Functions und mehrere Node-Prozesse dürfen nicht allein auf Prozessspeicher vertrauen.

## 13. Fehlende Umgebungsvariablen

| Variable | Zweck |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | öffentliche Hauptdomain / Canonicals |
| `COMMERCE_PROVIDER=local` | aktiver Commerce-Pfad |
| `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE` | SMTP-Endpunkt/TLS |
| `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD` | SMTP-Secrets |
| `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `INQUIRY_TO_EMAIL` | autorisierte Adressen |
| `CONTACT_MAIL_TEST_MODE`, `CONTACT_TEST_TO_EMAIL` | isolierter Preview-Test |
| `INQUIRY_MAIL_TEST_MODE`, `INQUIRY_TEST_TO_EMAIL` | isolierter Inquiry-Test |
| `FORM_RATE_LIMIT_HASH_SALT` | stabiler geheimer Hash-Salt |
| `FORM_PROTECTION_REST_URL`, `FORM_PROTECTION_REST_TOKEN` | atomarer TTL-Store |
| `FORM_ALLOWED_ORIGINS` | explizit erlaubte Preview-Origins |
| `FORM_CLIENT_IP_HEADER` | nur nach verifiziertem Proxyvertrag; auf Netlify leer |

## 14. Testprotokoll

| Prüfung | Ergebnis |
|---|---|
| ESLint | bestanden |
| TypeScript `tsc --noEmit` | bestanden |
| Next.js Production Build | bestanden, 74 statische Seiten |
| Netlify Preview-Kontext Build | bestanden, Runtime 5.16.6, Function gebündelt |
| Suchtests | 23/23 bestanden |
| Relevante Regression (Suche, Cart, Inquiry, Wissen, WP16.1, Datenschutz) | 73/73 bestanden |
| Sitemap-/Canonical-Test | 1/1 bestanden |
| Vollständige Playwright-Suite | 432/464 bestanden |
| Node-Standalone-Smoke | bestanden |
| Docker-Build | nicht möglich: Docker nicht installiert |
| Netlify-Preview | nicht möglich: nicht eingeloggt/nicht verknüpft |
| SMTP-Zustellung | nicht möglich: keine freigegebenen Test-Secrets |

Die 32 Fehler der Vollsuite wurden nicht versteckt oder global deaktiviert. Ursachen: 9 veraltete Finder-/Development-Produkt- und Navigationsannahmen; 4 alte Daten-/Preis-/Hinweis-/Cart-Annahmen; 3 alte GLB-Pfade beziehungsweise 3D-Request-Annahmen; 9 koordinatenbasierte visuelle Raumplaner-Tests mit Pointer-Interception durch aktuelle Toolbar/Fußzeile; 3 API-Tests ohne den in Produktion verpflichtenden Origin; 1 Performancegrenze (5,736 s statt 5 s unter paralleler Vollsuite); 1 alter URL-Test nach datenschutzfreundlichem Entfernen von Kontaktdetails aus der Adresszeile; sowie 2 weitere alte Raumplaner-/UI-Annahmen. Der echte Canonical- und tote-Link-Fehler aus diesem Lauf wurde behoben und separat grün nachgetestet.

## 15. Offene Blocker

1. Netlify-Login, Site-Link und echtes Draft-/Deploy-Preview fehlen.
2. Freigegebene Preview-Secrets für atomaren Store und isoliertes SMTP-Testpostfach fehlen.
3. SMTP-Zustellung, Reject, Timeout, Bounce, SPF/DKIM/DMARC und Alarmweg sind extern nicht nachgewiesen.
4. Docker/Linux-Containerbuild ist mangels Docker nicht ausgeführt.
5. Die 32 historischen Vollsuite-Tests benötigen ein separates fachliches Testbereinigungspaket; die Tests widersprechen teilweise bewusst dem aktuellen P0-Produktionsfilter.
6. Netlify-Edge-Rate-Limit, OpenNext-Headers, Image CDN und Cache-Hit/Invalidierung müssen auf einer echten Preview-URL verifiziert werden.
7. Der CSP läuft weiterhin im Report-only-Modus und benötigt vor Enforce eine ausgewertete Preview-Phase.

## 16. Hosting-Empfehlung

Aktuelle offizielle Planbasis: [Netlify Preise](https://www.netlify.com/pricing/) und [Credit-Pläne](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).

| Option | Eignung für Dalemans |
|---|---|
| Netlify Free | Gut für Preview und einen kontrollierten Start: 300 Credits/Monat, harte Grenze, Deploy Previews, CDN, Functions, Blob/Database und grundlegendes Rate Limiting. Risiko: Bei Erreichen der Grenze pausiert das Konto. |
| Netlify Personal | Beste kurzfristige Produktionsoption nach erfolgreichem Preview: offiziell 1.000 Credits/Monat, Secret Detection, längere Analytics und optionales Auto-Recharge. Die im Dashboard tatsächlich angebotene lokale Währung/Steuer ist vor Abschluss zu prüfen. |
| Kleiner VPS | Sinnvoll langfristig bei planbarem Betrieb und vorhandener Linux-/Security-Kompetenz. Volle Kontrolle und gute Amicron-Nähe, aber Verantwortung für Patches, TLS, Backups, Monitoring, Redis/Valkey, Mail-Egress und Bereitschaft. Kein VPS wurde bestellt oder verändert. |

Empfehlung: zuerst ein privates Netlify-Draft-Preview mit Test-Store und Test-SMTP abschließen. Für einen risikoarmen kurzfristigen Livebetrieb ist Personal gegenüber Free robuster, sobald reale Nutzung die harte Free-Grenze gefährdet. Parallel den vorhandenen Standalone-/Docker-Pfad auf einem Linux-Testsystem abnehmen; danach kann ein kleiner VPS die langfristige hosterunabhängige Zielplattform sein.

Es wurden keine Commits, Pushes, Vercel-Deployments, produktiven Netlify-Deployments, DNS-Änderungen, Bestellungen, SMTP-Nachrichten oder Amicron-Aufrufe ausgeführt.
