# Netlify Live Preview Report (WP19.2)

Stand: 4. November 2026, Europe/Berlin

```text
final_state: BLOCKED_NO_NETLIFY_PROJECT_ACCESS_OR_DEPLOY_PREVIEW
github_branch: feature/netlify-wp19-preview
github_pull_request: https://github.com/PixelFlux782/Firma-Dalemans-neues-design/pull/1 (OPEN, nicht gemergt)
netlify_site: nicht ermittelbar; keine lokale Site-ID und kein authentifizierter Netlify-Zugriff
netlify_preview_url: nicht vorhanden
preview_deployment_status: nicht gestartet; GitHub meldet keinen Netlify-Check
website_tests: lokaler Production-Build und Vollsuite bestanden; Netlify-Live-Test blockiert
shop_tests: lokale Produkt-, Varianten-, Preis-, Mengen-, Such- und Warenkorbtests bestanden; Netlify-Live-Test blockiert
room_planner_tests: lokale 2D-/3D-, Auto-Bestuhlungs-, Tisch-, Speicher-, PDF- und GLB-Tests bestanden; Netlify-Live-Test blockiert
contact_form: kontrollierter 503 ohne verteilten Store verifiziert; kein SMTP-Versand; kein Test-Store/Test-SMTP verfügbar
search_tests: lokale Logik-, UI-, Debounce-, Cache- und API-Tests bestanden; Netlify-Live-Test blockiert
total_tests: 464/464 bestanden
netlify_resource_usage: keine realen Netlify-Messdaten; kein Deploy und keine Preview-URL
estimated_monthly_credits: 54,3 / 127,2 / 273,0 / 516,0 bei 500 / 2.000 / 5.000 / 10.000 Besuchern (Hochrechnung, 5 % 3D, 2 Production Deploys)
security_status: Code-/Secret-Prüfung bestanden; Preview-Privatsphäre, X-Robots-Tag und ENV-Kontexte mangels Preview nicht verifizierbar
remaining_blockers: Netlify-Login/Site-Link; Deploy-Preview-Integration; private Preview-Zugriffsbeschränkung; Deploy-Preview-ENV; Test-Redis/Valkey; Test-SMTP; reale Netlify-Live- und Verbrauchsmessung
production_recommendation: NO-GO; weder nach main mergen noch Netlify produktiv schalten
```

## 1. GitHub- und Netlify-Bestand

- GitHub-Repository: `PixelFlux782/Firma-Dalemans-neues-design`, Standardbranch `main`.
- Preview-Branch `feature/netlify-wp19-preview` wurde ausschließlich nach GitHub gepusht.
- Pull Request #1 ist offen und nicht gemergt.
- `main`, DNS, Custom Domain und produktive Shopdaten wurden nicht geändert.
- Die lokale Netlify CLI meldet `Not logged in`.
- `.netlify/state.json` fehlt; damit ist lokal keine Netlify-Site verknüpft.
- Der vorhandene Browser steht auf einer Netlify-Sign-up-/Repository-Connect-URL und enthält keine nutzbare authentifizierte Sitzung.
- Nach Öffnen des PR erschienen auf GitHub nur Vercel-Checks. Ein Netlify-Status, Netlify-Kommentar oder Netlify-Deployment wurde nicht erzeugt. Die automatisch von der bestehenden GitHub-Integration ausgelöste Vercel-Preview ist kein Produktions-Deployment; die Vercel-Produktionsseite wurde nicht verändert.
- Eine öffentliche Suche ergab keine eindeutig diesem Repository zuordenbare Netlify-Site.

Damit widerspricht der beobachtbare Zustand der Annahme, dass dieses Repository bereits funktionsfähig mit einem zugänglichen Netlify-Projekt verbunden ist. Ohne Netlify-Login, Site-ID oder GitHub-Deploy-Status darf keine Site geraten oder ein neues unkontrolliertes Projekt angelegt werden.

## 2. Übernommener Umfang und Schutz fremder Änderungen

Der Commit enthält die geprüften WP19-/WP19.1-Änderungen, Netlify-/VPS-Portabilität, optimierte GLBs, Formularschutz, Datenschutzkorrekturen, die Testbereinigung und den während der Prüfung behobenen Canonical-Fehler.

Nicht committed und lokal erhalten blieben:

- sieben bereits vorher vorhandene Löschungen von Katalog-/Quell-/Arbeitsdateien;
- `docs/wp19-2-vercel-ionos-setup.md`;
- `vercel.json`.

Die Secret-Prüfung fand keinen Zugangswert. Der einzige Pattern-Treffer war eine Quellcode-Referenz auf den Variablennamen `FORM_PROTECTION_REST_TOKEN`, nicht dessen Wert. Private `.env`-Dateien wurden nicht committed.

## 3. Build und vollständige Testsuite

| Prüfung | Ergebnis |
|---|---|
| ESLint | bestanden |
| Next.js Production Build | bestanden; 74 statische Seiten; ca. 52–54 s lokal |
| Gemeinsames First-Load-JavaScript | 103 kB laut Buildausgabe |
| Historische Vollsuite vor Bereinigung | 433/464, 31 Fehler |
| Erster vollständiger Lauf nach Bereinigung | 463/464; eine CPU-abhängige 5-s-Grenze um 23 ms überschritten |
| Finaler vollständiger Lauf | **464/464 bestanden in 2,4 min** |

Die Tests wurden nicht deaktiviert. Veraltete Erwartungen wurden an den bereits aktiven Produktionsfilter, die datenschutzfreundliche Kontaktübergabe und die neuen GLB-Pfade angepasst. Koordinatenbasierte Raumplanertests erhielten realistische Viewports. API-Tests senden nun den produktiv verpflichtenden Same-Origin-Header.

Ein echter SEO-Fehler wurde behoben: Die router-aware Aktualisierung der Konfigurator-URL konnte nach der Hydrierung ein zweites Canonical-Element erzeugen. Die URL wird nun ohne App-Router-Metadaten-Render aktualisiert; der Sitemap-/Canonical-Lauf ist grün.

## 4. Umgebungsvariablen und Formulare

Für einen echten Deploy-Preview-Kontext fehlen nachweisbar freigegebene Werte beziehungsweise die Dashboard-Sicht auf:

- `NEXT_PUBLIC_SITE_URL`, `COMMERCE_PROVIDER=local`;
- `FORM_ALLOWED_ORIGINS` für die konkrete Preview-URL;
- `FORM_RATE_LIMIT_HASH_SALT`;
- `FORM_PROTECTION_REST_URL`, `FORM_PROTECTION_REST_TOKEN`;
- SMTP-Verbindung und Absender;
- ausschließlich für Preview bestimmte Testempfänger und aktivierte Testmodi.

Der Kontakt- und Anfragepfad benötigt einen atomaren, mehrinstanzfähigen Redis-/Valkey-kompatiblen REST-Store. Ohne Store wird in Produktion kontrolliert mit HTTP 503 abgelehnt; Sicherheitsmechanismen wurden nicht umgangen und es gibt keine Fake-Erfolgsmeldung. Die Tests bestätigen außerdem Origin-Prüfung, Body-Limits, Honeypot, Doppelklickschutz und fehlenden Versand ohne Store.

Empfehlung: ein isolierter Upstash-Redis-Testbestand in einer EU-Region oder ein gleichwertiger Valkey/Redis-REST-Dienst mit atomarem `SET NX PX`/TTL-Verhalten. Die Credentials nur im Netlify-Kontext `Deploy Previews` hinterlegen. SMTP ebenfalls ausschließlich mit Testpostfach und Testempfänger aktivieren. Es wurde keine Nachricht versendet.

## 5. Nicht mögliche Netlify-Live-Tests

Ohne Preview-URL konnten folgende Prüfungen nicht als Netlify-Messung ausgegeben werden:

- Website, Navigation, Unternehmensseiten, Kategorien und Responsive Layout;
- Produktlisten, Suche, Artikelnummern, Details, Varianten, Warenkorb, Preise und Mengen;
- Raumplaner 2D/3D, Modelle, Speichern/Laden und PDF;
- reale Statuscodes, Cache-Hits, Function-Aufrufe, API-Latenzen, GLB-Transfer und Builddauer;
- Canonicals, Sitemap, `robots.txt`, strukturierte Daten und interne Links auf Netlify;
- `X-Robots-Tag: noindex` und echte Zugriffsbeschränkung.

Netlify dokumentiert, dass Deploy Previews normalerweise einen GitHub-Status und eine eindeutige `deploy-preview-…`-URL erzeugen. Netlify setzt zwar `X-Robots-Tag: noindex`, weist aber ausdrücklich darauf hin, dass dies keine Zugriffsbeschränkung ist. Vor Tests muss das Projekt privat oder für Non-Production-Deploys passwortgeschützt sein:

- https://docs.netlify.com/deploy/deploy-types/deploy-previews/
- https://docs.netlify.com/deploy/protect-deploys/

## 6. Ressourcen und Hochrechnung

Reale Netlify-Werte für Credits, Compute, Bandbreite, Requests, Function-Aufrufe und Builddauer sind **nicht vorhanden**, weil kein Netlify-Deploy ausgelöst wurde.

Die Hochrechnung verwendet die lokalen WP19-Messungen und Netlifys aktuelle Credit-Meter: 20 Credits/GB Bandbreite, 2 Credits/10.000 Web Requests und 10 Credits/GB-Stunde Compute. Deploy Previews sind als Deployments kostenlos; Traffic, Requests und Compute bleiben verbrauchsabhängig. Für die Vergleichbarkeit der Monatswerte sind weiterhin zwei spätere Production Deploys zu je 15 Credits eingerechnet.

Annahme: 1,4 MB Basis je Besucher, 72 Requests, 5 % 3D-Nutzung mit 5,92 MB und 10 Zusatzrequests, 0,0001833 Compute-Credits je Besucher.

| Besucher/Monat | Bandbreite | Requests | Compute-Cr. | 2 Prod.-Deploys | Gesamt-Credits |
|---:|---:|---:|---:|---:|---:|
| 500 | 0,848 GB | 36.250 | 0,09 | 30 | **54,3** |
| 2.000 | 3,392 GB | 145.000 | 0,37 | 30 | **127,2** |
| 5.000 | 8,480 GB | 362.500 | 0,92 | 30 | **273,0** |
| 10.000 | 16,960 GB | 725.000 | 1,83 | 30 | **516,0** |

Quelle für aktuelle Meter und kostenlose Preview-Deployments:
https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/

## 7. Nächste kontrollierte Schritte

1. Netlify-Teamzugriff bereitstellen und die existierende Site-ID bestätigen.
2. Repository und Produktionsbranch `main` im Netlify-Dashboard prüfen; keine Domain zuweisen und keinen Production Deploy auslösen.
3. Deploy Previews für PRs aktivieren und Preview-Sichtbarkeit auf privat oder passwortgeschützt setzen.
4. Deploy-Preview-ENV getrennt und mit Test-Store/Test-SMTP konfigurieren.
5. Den vorhandenen PR erneut bauen lassen und erst dann die vollständige Live-Matrix sowie reale Usage-Daten erfassen.
6. PR nicht mergen, bis alle Live-, Security-, SMTP- und rechtlichen Blocker geschlossen sind.

