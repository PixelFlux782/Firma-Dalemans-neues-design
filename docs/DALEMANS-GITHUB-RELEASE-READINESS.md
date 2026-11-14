# Dalemans GitHub Release Readiness

## Aktueller Abgleich - 14.11.2026

**READY FOR GITHUB RELEASE - lokaler Commit.** Dieser Abschnitt ersetzt widersprechende Freigabeangaben im historischen Text darunter fuer den aktuellen Commitauftrag. Staging und Commit der exakt 81 Aenderungen/Loeschungen und 48 neuen Manifest-Dateien sind ausdruecklich autorisiert. Kein Push, Deploy, Restore, weiterer Build oder echter Mailversand.

Die 129 Pfade wurden mit dem Arbeitsbaum abgeglichen; alle neuen Assets und benoetigten lokalen Quellmodule sind vorhanden. Die staged Dateiliste muss vor Commit exakt mit dem Manifest uebereinstimmen. Nur diese drei Statusdokumente werden redaktionell aktualisiert; Code, Produktdaten, Rechtstexte und Netlify-Konfiguration bleiben unveraendert.

Vorhandene Belege: audit/github-release/local-inventory.json (Secretpruefung und 96 Bildreferenzen), catalog.json (22 Produkte, 113 Varianten, 119 Bildreferenzen, keine fehlenden Bilder), image-files.json (415 Rasterbilder, keine ungueltigen Dateien). Ergaenzende Originalprotokolle: audit/final-release/tsc-release.log, lint-release-final.log, vitest-release.log (26 Tests), rc-playwright.json (131 erwartet, keine unerwarteten oder uebersprungenen Tests) und netlify-release-build.log (Adapterbuild abgeschlossen). Die historischen 54/16 Tests sind separate dokumentierte Laeufe und werden damit nicht gleichgesetzt oder neu ausgefuehrt.

Der bestehende Bericht docs/DALEMANS-P0-PRODUCTION-RECOVERY.md bestaetigt authentifiziert elf Production-Variablen samt Functions-/Builds-/Runtime-Scope, ohne konkurrierende Mail-Testmodus-/Upstash-Schluessel in der damaligen Antwort. Maskierte Werte belegen keine konkreten SMTP-/Redis-Werte. Keine neue Netlify-CLI-Abfrage, kein Token-Export, keine TLS- oder Konfigurationsaenderung.

**Keine nachgewiesenen Blocker fuer den lokalen Commit.** Aktuelle private Git-/Build-/Publishing-Einstellungen, SMTP-/Redis-Semantik, echte Zustellung und Abnahme einer neuen Plattformlaufzeit bleiben Nachweisgrenzen fuer den spaeteren Produktionsablauf. Sie werden nicht als erfolgreiche Pruefung behauptet und erfordern fuer diesen Commit keine erneute Plattformabfrage. Push und Deployment benoetigen einen gesonderten Auftrag.

## Historischer Pruefstand

Prüfung: 14.11.2026, Europe/Berlin. Entscheidung: **BLOCKED**.

Der lokale Build ist erfolgreich. Eine Freigabe für den automatischen Produktionsbuild ist noch nicht belastbar: aktuelle Netlify-Buildsettings und Produktionsvariablen sind ohne authentifizierten Zugriff nicht erneut prüfbar. Kein Commit, Push, Deploy, Restore, Kontoeingriff oder Formularversand durchgeführt.

## A. Fehleranalyse

| Stand | Deploy-ID | Kontext | Nachweis |
|---|---|---|---|
| Erfolgreiches Preview | `6af859c4755e42c32ac9966f` | deploy-preview | HTML, Logo, Hero, neues Produktbild, Bildoptimierung und alle 10 Startseiten-JS-Chunks HTTP 200 |
| Fehlerhafter CLI-Deploy | `6af87fa393612675aad819e8` | production | 14.11.2026 16:34:59 erstellt, 16:36:21 veröffentlicht |
| Wiederhergestellte aktive Produktion | `6aecd4a064d442928cff3f53` | production | API published_deploy; am 14.11.2026 16:41:44 wieder veröffentlicht; Git-Commit `4a996fd287e793df0dc820574a6a8fb2c26f5b90` |

Quelle: öffentliche Netlify-API, selektierte Metadaten in `audit/github-release/netlify-readonly.json`. Dateilisten erfordern Authentifizierung (HTTP 401). Die dort gespeicherten leeren Dateilisten/Anzahl 0 bedeuten **nicht**, dass der Deploy keine Dateien enthält. Buildsettings fehlen in der öffentlichen Antwort. Environment-Abfrage war ohne Account-ID/Authentifizierung nicht verwertbar; keine Aussage über fehlende Konto-Variablen.

**Nachgewiesener Auslieferungsfehler:** Beim fehlerhaften Deploy liegen JS-Dateien unter dem falschen URL-Präfix. `/static/chunks/webpack-f296f5065f442e4e.js` und `/static/chunks/app/page-f26706f93a62fc28.js` liefern 200, dieselben Dateien unter dem im HTML referenzierten `/_next/static/chunks/` liefern 404. `/server/app/index.html` liefert 200; bei Preview und alter Produktion 404. Das belegt eine öffentlich ausgelieferte rohe Next-Buildverzeichnisstruktur anstelle des erwarteten statischen Netlify-Assetlayouts. Die Deploy-Zusammenfassung nennt 46 generierte Seiten, 107 geänderte Assets, keine Redirects und keine Headerregeln. Preview/alte Produktion haben jeweils drei Redirectregeln und eine Headerregel. Alle drei melden eine Function. Eine vorhandene Function allein beweist keinen vollständigen Adapterdeploy.

**Bilder:** `/images/branding/dalemans-logo.webp`, `/images/optimized/hero/klapptische-hero.webp` und `/neue%20bilder/Tische/t210.webp` liefern nur beim fehlerhaften Deploy 404; dieselben URLs funktionieren im Preview. Sie existieren lokal. Das neue Produktbild fehlt erwartungsgemäß auch im alten Release. Keine fehlerhafte Schreibweise dieser drei Pfade nachgewiesen. Fehlende Veröffentlichung am vorgesehenen Pfad ist belegt; physisch fehlende Datei und falsche interne Platzierung sind für die Bilder ohne historische Dateiliste nicht vollständig trennbar.

`/_next/image` für das Logo liefert im Fehlerdeploy 400, sonst 200. Das Quellbild liefert dort bereits 404; ein unabhängiger Image-CDN-Ausfall ist nicht belegt. Fehlende Redirectmetadaten sind belegt, eine konkrete fehlerhafte historische Next-Rewrite-Regel jedoch nicht auslesbar.

**JavaScript:** Alle zehn Startseiten-Chunks liefern im Fehlerdeploy 404 und text/plain; im Preview und im wiederhergestellten Stand 200 mit JavaScript-MIME-Typ. Chromium reproduziert MIME-Ausführungsverweigerungen und fehlendes CSS. Damit ist die Unterbrechung des Clientstarts durch fehlgeleitete Assets nachgewiesen. Ein zusätzlicher Hydrationfehler oder ein konkreter historischer Exception-Stack ist nicht nachgewiesen. Keine Belege für gemischte Client-/Server-Builds; die verglichenen Chunknamen des Fehlerdeploys entsprechen denen des Preview. API-Build-ID bei beiden CLI-Deploys null bedeutet fehlender Netlify-Cloud-Buildbezug, nicht fehlende Next-Build-ID. Historische Next-Build-IDs bleiben offen.

**Ursachengrenze:** Falsches veröffentlichtes Assetlayout/unvollständige Adapter-Paketierung ist aus HTTP und Metadaten belastbar abgeleitet. Welcher konkrete CLI-Aufruf oder welcher interne Paketierungsschritt das verursachte, ist ohne dessen vollständiges Protokoll nicht abschließend belegt. Die TOML-Einstellung `.next` ist für einen vollständigen Git-basierten Adapterbuild korrekt und kein eigenständiger Fehlernachweis. Kein spekulativer Konfigurationsfix vorgenommen.

Belege: `audit/github-release/http.json`, `browser.json`, `netlify-readonly.json`.

## B. Repository und Sicherheit

Branch `main`; origin `https://github.com/PixelFlux782/Firma-Dalemans-neues-design.git`. Lokaler HEAD und über `git ls-remote` abgefragter Remote-main: `4a996fd287e793df0dc820574a6a8fb2c26f5b90`. Keine unaufgelösten Indexkonflikte. Kein Fetch, Staging oder Commit durchgeführt. Bestehende Änderungen erhalten.

Zu Prüfungsbeginn 81 geänderte/getilgte versionierte Dateien; die Anzahl neuer Dateien verändert sich durch Berichte und Prüfarbeitsdateien. Vollständige Einzellisten und Kategorien stehen im Release-Manifest. Acht neue Produkt-WebP-Dateien, Favicon, Rechtstextdateien, neue Quellmodule und Tests müssen explizit mitgenommen werden. `.env` ist ignoriert, `.env.example` enthält leere Secretfelder und Beispieldaten. Keine `.gitignore`-Änderung notwendig.

Secretprüfung: geplante Dateien gegen lokal vorhandene geheime Token-/Passwort-/Saltwerte sowie Private-Key-/GitHub-Tokenmuster geprüft, keine Treffer. Dies ist keine Garantie gegen unbekannte Credentialformate oder personenbezogene Inhalte. Interne Auditdaten, temporäre Dateien und lokale Testdaten sind vom vorgeschlagenen Commit ausgeschlossen; sie müssen vor einer eventuellen späteren Veröffentlichung gesondert geprüft werden. Prüfergebnis und genaue Dateiauswahl: `audit/github-release/local-inventory.json`. Keine Secretwerte ausgegeben.

## C. Netlify / Formularschutz

`netlify.toml`: Node 22, `npm run build`, Publish `.next`, `@netlify/plugin-nextjs`. Next 15.5.28; package-lock vorhanden. Diese Kombination entspricht dem dokumentierten Git-Buildverfahren. Nicht auf `out`, `public` oder ein manuell hochgeladenes `.next` umstellen. Adapter erzeugt SSR-/API-Function, Routing und Image-CDN-Integration. Aktueller lokaler Next-Build enthält `/api/contact`, `/api/inquiry` und weitere dynamische Routen.

Vorheriger lokaler Adapterbuild laut `docs/DALEMANS-P0-PRODUCTION-RECOVERY.md`: Runtime 5.16.6, Handler-ZIP und Image-CDN-Regeln erzeugt. Im aktuellen Auftrag wurde genau ein Next-Produktionsbuild ausgeführt; kein weiterer Adapterbuild und kein Upload. Aktuelle Cloud-Adapterversion und vollständiges künftiges Linux-Buildartefakt daher noch nicht unabhängig bestätigt.

GitHub-Verknüpfung und Produktionsbranch sind vom Betreiber vorgegeben; historische API-Deploys bestätigen `main` und den Commitbezug. Aktuelle private Site-Buildsettings, Auto-Publishing/Build-Sperren, Base-/Package-Verzeichnis und Repositoryanbindung müssen authentifiziert lesend bestätigt werden. Die öffentliche Antwort erlaubt dies nicht.

Elf zu bestätigende Production-/Functions-Schlüssel: `FORM_PROTECTION_REST_URL`, `FORM_PROTECTION_REST_TOKEN`, `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE`, `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `INQUIRY_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

Der vorhandene P0-Bericht bestätigt deren damalige nichtleere Production-Auswahl mit Functions-, Builds- und Runtime-Scope. Maskierte Werte erlaubten keine semantische Prüfung. Im aktuellen Auftrag keine erneute authentifizierte Bestätigung möglich. Auch keine unbeabsichtigten Testmodus-/Preview-Overrides aktuell ausgeschlossen. Das ist ein Freigabeblocker, kein behaupteter Konfigurationsfehler.

Code: vollständiges zusammengehörendes Redis-Paar erforderlich; Custom-Paar hat Vorrang. SMTP validiert Port/Secure-Wert, nutzt bei secure=false `requireTLS=true` (STARTTLS); keine Änderung erforderlich. Erwartete Port-587-/secure=false-Kombination muss aus tatsächlicher Production-Konfiguration bestätigt werden. Keine echten Redis-/SMTP-Anfragen oder E-Mails erzeugt.

Referenzen: [Next.js auf Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), [Image CDN](https://docs.netlify.com/build/image-cdn/overview/), [Functions-Variablen](https://docs.netlify.com/build/functions/environment-variables/).

## D. Aktuelle lokale Prüfungen

- `npx --no-install tsc --noEmit`: Exit 0.
- `npm run lint`: Exit 0.
- `npx --no-install vitest run`: 54/54 Tests, 6 Dateien erfolgreich; einschließlich Formularschutz, Konfiguration, SMTP-Mocks, Adresslogik, Gleiter und Navigation.
- `npm run build`: Exit 0, 75 statische Seiten; SSR/API-Routen vorhanden. Verwendet lokale ignorierte `.env`, ersetzt daher keine Prüfung der Cloud-Production-Konfiguration.
- Next-Build-ID `_isGoyf7SqrDqngx-49BN`, 72 statische JS-Dateien erzeugt; keine fehlenden Imports beim Build.
- Playwright: Hero-Bildladen, responsive globale Navigation, WP24-Produktbilder/SEO: 16/16 erfolgreich gegen lokalen Produktionsserver.
- Zusätzliche Katalogprüfung: siehe `audit/github-release/catalog.json`; alle öffentlichen Produkt-/Variantenbildreferenzen vorhanden.
- 96 direkt aus Quellcode extrahierte Bildreferenzen vorhanden und nicht ignoriert. Dynamische Referenzen zusätzlich über Katalogprüfung erfasst; keine Behauptung einer vollständigen Laufzeitpfadbeweisführung für jede Seite.
- 415 Rasterbilder unter public: Sharp-Metadaten erfolgreich; keine ungültigen Dateien. Logo, alle statisch referenzierten Hero-Bilder und neue Produktbilder vorhanden.
- Nicht blockierende Vite-Konfigurationswarnung; keine erneute vollständige Testkampagne.

## E. Freigabeentscheidung

**BLOCKED**, bis folgende Nachweise vorliegen:

1. Authentifiziert lesend aktuelle GitHub-Anbindung, main als Productionbranch, Build-/Publish-/Base-Einstellungen und automatischen Build-/Publishingstatus bestätigen.
2. Elf Produktionsvariablen einschließlich Functions-Scope, SMTP/STARTTLS-Semantik und fehlender Testmodus-Overrides aktuell bestätigen; keine Werte dokumentieren.
3. Finale explizite Dateiauswahl einschließlich neuer Assets/Legal-Dateien erneut prüfen und freigeben. Erst danach separat autorisierter Commit und später ausdrücklich freigegebener Push.

Der Defekt im bisherigen Upload ist nachgewiesen; ein korrekter vollständiger Git-Adapterbuild ist der vorgesehene Wiederholschutz. Ein erfolgreicher künftiger Produktionsdeploy samt Formularzustellung kann ohne Deployment nicht vorweg bestätigt werden. Vorliegende Berichte erlauben deshalb noch kein READY.
