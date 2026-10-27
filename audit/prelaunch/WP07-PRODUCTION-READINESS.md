# WP07 – Production & Staging Readiness

Stand: 24. Oktober 2026  
Scope: DLMNS-P1-005, DLMNS-P1-011 und DLMNS-P1-006  
Entscheidung: **keine Release-Freigabe; Staging-, Infrastruktur- und manuelle Freigaben bleiben erforderlich**

## 1. Ergebnis

| Befund | Lokal erreicht | Verbleibender Abschlussnachweis |
|---|---|---|
| DLMNS-P1-005 | SMTP-Konfiguration und Adressen werden strenger validiert; Kontakt und Inquiry besitzen isolierte Testempfänger-Modi; Fehlerlogs enthalten nur technische Ereigniscodes. | Autorisiertes Staging-SMTP, DNS-Authentifizierung, Zustell-/Fehlernachweis, Providerlimits sowie Monitoring und Alarmweg. |
| DLMNS-P1-011 | Beide APIs prüfen die tatsächlich gelesene Body-Größe, validieren serverseitig, verwenden Honeypot und instanzlokales Rate-Limit. Unkonfigurierte Forwarded-Header werden nicht mehr vertraut. Kontakt besitzt zusätzlich eine technische Doppelsende-Sperre. | Zielplattform, bereinigter Einzel-IP-Header und gemeinsamer atomarer TTL-Store für Rate-Limit und Idempotenz; Mehrinstanz-/Abusetest. |
| DLMNS-P1-006 | Bestehende sieben Header und Report-only-CSP blieben unverändert aktiv; lokale kritische Browserpfade zeigen keine CSP-Verletzung. | Reale Domain, TLS/Edge, HSTS-Weitergabe, CSP-Reportempfang und repräsentative Auswertung; Enforcing nur nach gesonderter Freigabe. |

P1-001 und P1-010 wurden nicht rechtlich bewertet oder freigegeben. Es gibt aus WP07 ausdrücklich **kein GO**.

## 2. Umgesetzte Maßnahmen

### SMTP und E-Mail

- SMTP-Zugangsdaten bleiben ausschließlich serverseitige Environment-Variablen; `.env*` ist ignoriert, `.env.example` enthält keine Secret-Werte.
- Host, Port, Secure-Modus, Absender und Empfänger werden vor dem Versand geprüft. Fehlende oder inkonsistente Angaben führen kontrolliert zu HTTP 503.
- `CONTACT_MAIL_TEST_MODE=true` erzwingt beim Kontaktformular `CONTACT_TEST_TO_EMAIL`. Inquiry besitzt weiterhin `INQUIRY_MAIL_TEST_MODE=true` mit `INQUIRY_TEST_TO_EMAIL`; dabei werden interne Nachricht und Kundenbestätigung nur an den Testempfänger umgeleitet.
- Ein Kontaktversand gilt nur bei mindestens einem vom SMTP-Transport akzeptierten Empfänger als angenommen.
- SMTP-Fehler werden nicht mehr mitsamt möglicherweise personenbezogenen Transport-/Nachrichtendaten geloggt. Strukturierte Ereignisse enthalten nur Komponente, Route und Ereigniscode.
- Nutzer erhalten weiterhin verständliche 429-/502-/503-Rückmeldungen; Formulareingaben beziehungsweise Warenkorb bleiben im Fehlerfall erhalten.
- Es wurde keine echte E-Mail gesendet und keine Test- oder Produktivzugangsdaten angelegt.

### Formularschutz, Proxy und Rate-Limit

- Beide APIs begrenzen jetzt auch den tatsächlich gestreamten Request-Body (`contact`: 10.000 Byte, `inquiry`: 35.000 Byte). Ein fehlender oder gefälschter `Content-Length` umgeht das Limit nicht.
- Kontakt und Inquiry besitzen gemeinsam ein lokales Limit von fünf validen Sendeversuchen je 15 Minuten und liefern bei Überschreitung HTTP 429 mit `Retry-After`.
- `FORM_CLIENT_IP_HEADER` ist standardmäßig leer. Dadurch werden `x-forwarded-for`, `x-real-ip` und andere vom Client manipulierbare Header nicht automatisch vertraut. Nach Plattformprüfung darf ausschließlich der Name eines vom Edge überschriebenen/bereinigten Headers konfiguriert werden, dessen Wert genau eine gültige IP enthält; Listen werden verworfen.
- IP-basierte Schlüssel werden mit `FORM_RATE_LIMIT_HASH_SALT` gesalzen. Fehlt das Salt lokal, wird pro Prozess ein zufälliges Salt verwendet. In Staging/Produktion muss es als stabiles Secret gesetzt werden.
- Das Kontaktformular übermittelt eine zufällige technische Anfragekennung. Parallele Wiederholungen werden zusammengeführt und erfolgreiche Wiederholungen zehn Minuten instanzlokal beantwortet. Inquiry behält seinen 24-Stunden-Idempotenzcache.
- Die Schutzspeicher bleiben absichtlich als **instanzlokal** bezeichnet. Neustarts und parallele Serverinstanzen umgehen beziehungsweise fragmentieren diese Grenzen.

Für Produktion ist ein von allen Instanzen erreichbarer Store mit atomarem Increment plus TTL erforderlich. Zusätzlich braucht die Inquiry-Idempotenz eine atomare Reservierung und Speicherung des Ergebnisses; dieselbe Entscheidung ist für die Kontakt-Idempotenz zu treffen. Geeignet ist beispielsweise ein von der Zielplattform unterstützter Redis-/KV-Dienst mit atomaren Operationen. Anbieter, Region, Kosten, AV-Vertrag, Aufbewahrung, Schlüsselrotation, Ausfallverhalten (fail-open/fail-closed), Alarmierung und Verantwortliche sind vor einer Implementierung festzulegen. Es wurde kein externer Dienst eingerichtet.

### Security Header, CSP, TLS und Edge

Anwendungsseitig bleiben global gesetzt:

- `Content-Security-Policy-Report-Only`
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`
- `Cross-Origin-Opener-Policy: same-origin`

Die CSP wurde nicht verschärft und erhielt keine pauschale Ausnahme. Browserseitig sind keine neuen Drittquellen bekannt; Shopify wird serverseitig angesprochen. `'unsafe-inline'` für Skripte und Styles bleibt als bekannter, vor Enforcing weiter zu reduzierender Restpunkt bestehen. Ohne festgelegten Reportempfänger wurde keine wirkungslose `report-uri`-/`report-to`-Adresse erfunden.

Die lokale `.vercel/project.json` weist auf ein verknüpftes Vercel-Projekt hin, belegt aber weder die endgültige Hostingwahl noch Domain-, Proxy-, TLS-, Edge- oder Environment-Einstellungen. TLS-Versionen, Zertifikatskette, HTTP→HTTPS, HSTS am Edge, Header-Überschreibungen und CSP-Reports sind deshalb extern offen.

## 3. Geänderte Dateien

- `.env.example` – Staging-Testempfänger, Proxy-Header und Hash-Salt dokumentiert.
- `src/lib/server/form-protection.ts` – tatsächliches Body-Limit, konservative Clientkennung, lokales Limit und PII-arme Betriebsereignisse.
- `src/app/api/contact/route.ts` – Testmodus, SMTP-Prüfung, Rate-Limit, Doppelsende-Sperre und reduzierte Fehlerlogs.
- `src/app/api/inquiry/route.ts` – gemeinsamer Body-/Rate-Schutz und reduzierte Fehlerlogs.
- `src/lib/inquiry/server.ts` – strengere SMTP-, Absender- und Empfängerprüfung.
- `src/components/ContactForm.tsx` – technische Anfragekennung und clientseitiger Doppelklickschutz.
- `src/lib/privacy-technical.ts` – technische Beschreibung an den tatsächlichen Schutz angepasst; keine rechtliche Freigabe.
- `tests/wp07-production-readiness.spec.ts` – nicht versendende API-, Header- und Kontaktformularregressionen.
- `tests/product-detail-system.spec.ts` – der Production-Routencrawl verwendet denselben Publikationsfilter wie der Production-Provider und erwartet keine öffentliche Route für Development-Fixtures.
- `audit/prelaunch/WP07-PRODUCTION-READINESS.md` – dieser Bericht.

## 4. Environment-Variablen ohne Werte

| Variable | Umgebung / Zweck |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Staging- bzw. finale kanonische HTTPS-Origin. |
| `COMMERCE_PROVIDER` | Freigegebene Commerce-Quelle; aktueller lokaler Modus bleibt ohne externe Secrets lauffähig. |
| `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE` | SMTP-Endpunkt und mit dem Provider abgestimmter TLS-Modus. |
| `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD` | Nur im Plattform-Secret-Store. |
| `CONTACT_FROM_EMAIL` | Beim Provider/DNS autorisierter Absender. |
| `CONTACT_TO_EMAIL`, `INQUIRY_TO_EMAIL` | Erst für Produktion freigegebene interne Empfänger. |
| `CONTACT_MAIL_TEST_MODE`, `CONTACT_TEST_TO_EMAIL` | In Staging `true` und ausschließlich isolierter Testempfänger. |
| `INQUIRY_MAIL_TEST_MODE`, `INQUIRY_TEST_TO_EMAIL` | In Staging `true`; interne Mail und Bestätigung gehen ausschließlich an den Testempfänger. |
| `FORM_CLIENT_IP_HEADER` | Erst nach dokumentiertem Edge-Vertrag setzen; exakt ein bereinigter Single-IP-Header. |
| `FORM_RATE_LIMIT_HASH_SALT` | Stabiles zufälliges Secret, getrennt nach Umgebung. |
| `SHOPIFY_*` | Nur erforderlich, falls die separate Commerce-Entscheidung Shopify aktiviert. |

Der noch auszuwählende zentrale Store und der CSP-/Fehler-Monitoringdienst benötigen voraussichtlich weitere anbieterspezifische Variablen. Ihre Namen werden erst nach der Infrastrukturentscheidung festgelegt.

## 5. Staging-Checkliste

### Lokal fertig

- [x] TypeScript, gezieltes ESLint und Production Build ausführen.
- [x] Body-Limits unabhängig von `Content-Length`, ungültiges JSON und Honeypot ohne Versand prüfen.
- [x] Kontakt-Doppelklick und technische Anfragekennung mit abgefangenem Request prüfen.
- [x] CSP im Report-only-Modus sowie alle vorhandenen Security Header prüfen.
- [x] Shop-/Anfrage-, Raumplaner- und Bildregressionen einschließlich aller 20 WP06-Redirects prüfen.
- [x] Keine produktive E-Mail, kein Deployment, kein Commit und kein Push ausführen.

### Externe Konfiguration erforderlich

- [ ] Zielplattform und getrennte Preview/Staging-/Production-Environments verbindlich festlegen.
- [ ] Alle oben aufgeführten Secrets ausschließlich im jeweiligen Plattform-Secret-Store hinterlegen; Preview-Secrets nicht unkontrolliert für fremde Branches bereitstellen.
- [ ] Autorisierten SMTP-Anbieter, Datenstandort/AV-Vertrag, Port/TLS-Modus und Test-Sandbox festlegen.
- [ ] Für Staging beide Mail-Testmodi aktivieren und beide Testempfänger auf ein kontrolliertes Postfach/Sink setzen.
- [ ] SPF, DKIM und DMARC für die Absenderdomain durch Verantwortliche konfigurieren und auswerten; keine DNS-Werte raten.
- [ ] Vom Hosting-Edge bereinigten Single-IP-Header dokumentieren. Erst danach `FORM_CLIENT_IP_HEADER` setzen; alle übrigen Forwarded-Header am Edge überschreiben/entfernen.
- [ ] Zentralen atomaren TTL-Store auswählen und Rate-Limit plus Idempotenz für beide APIs anbinden. Instanzlokale Maps nicht als Produktionslösung abnehmen.
- [ ] Log-Drain/APM mit Alarmen für 429, `mail_not_configured`, `mail_config_invalid`, `delivery_failed` und erhöhte 5xx-Raten einrichten; keine Request-Bodies, E-Mail-Adressen, Telefonnummern, IP-Adressen oder SMTP-Secrets aufnehmen.
- [ ] CSP-Reportempfänger inklusive Aufbewahrung, Sampling, Zugriff und Datenschutz festlegen.
- [ ] Staging- und Produktionsdomain, DNS, Zertifikate und HTTP→HTTPS-Redirect konfigurieren.

### Auf Staging zu prüfen

1. [ ] Konfigurations-Selbsttest: Testmodi sind `true`, Empfänger sind Testadressen, Produktionsziele werden nicht verwendet.
2. [ ] Kontakt und Inquiry jeweils einmal zustellen; beim Inquiry müssen interne Mail und Kundenbestätigung im Testpostfach landen. Absender, Reply-To, Zeichensätze und Anfrage-ID prüfen.
3. [ ] SMTP-Timeout, falsche Authentifizierung, abgelehnter Empfänger und nicht akzeptierte Nachricht kontrolliert simulieren. UI muss Eingaben behalten; Alarm muss ohne PII auslösen.
4. [ ] Bounce-/Spamordner-Verhalten sowie SPF/DKIM/DMARC-Ergebnisse im Testpostfach prüfen. Providerlimits und Eskalationsweg dokumentieren.
5. [ ] Mit mindestens zwei Instanzen und einem Neustart dieselben Rate-Limit- und Idempotenzschlüssel testen. Parallelanfragen dürfen das atomare Limit und die Doppelsende-Sperre nicht umgehen.
6. [ ] Den vertrauenswürdigen IP-Header mit echten Requests prüfen; vom Client gesetzte `Forwarded`, `x-forwarded-for`, `x-real-ip` und ähnlich benannte Header dürfen die Plattformkennung nicht manipulieren.
7. [ ] Grenzwerttest für beide APIs: 429 und plausibles `Retry-After`; Body-Limits ohne und mit falschem `Content-Length`; Store-Ausfall gemäß freigegebener Fail-Strategie.
8. [ ] Finalen Host per HTTP und HTTPS prüfen: Redirect, Zertifikatsname/-kette, unterstützte TLS-Versionen, HSTS und sämtliche Header nach CDN/Edge. Doppelte oder abgeschwächte Header ausschließen.
9. [ ] CSP-Reports über einen vereinbarten repräsentativen Zeitraum sammeln: Startseite, Shop, Produktkonfiguration, Kontakt, Anfrage sowie Raumplaner 2D/3D auf Desktop und Mobil. Erst nach bereinigten Reports separat über Enforcing entscheiden.
10. [ ] Funktionstests für Shop/Warenkorb/Anfrage, Kontakt, Raumplaner 2D↔3D, Produktbilder und Navigation auf der Zielplattform durchführen.
11. [ ] Alle 20 Altbild-URLs aus `next.config.mjs` bis zum neuen WebP verfolgen: Redirectstatus, finale 200-Antwort, `image/webp`, Cache/CDN und keine Schleife. Zusätzlich neue Pfade und gerenderte Kernseiten auf Bild-404 prüfen.
12. [ ] Alarmtest mit Betriebsverantwortlichen durchführen und Runbook für SMTP-, Store-, CSP- und 5xx-Ereignisse hinterlegen.

### Manuelle Freigabe erforderlich

- [ ] Hosting-/Security-Verantwortliche geben Proxy-Vertrauen, zentralen Store, Fail-Strategie, TLS/HSTS und Edge-Header frei.
- [ ] Mail-/Datenschutzverantwortliche geben Anbieter, AV-Vertrag, Absender, Empfänger, Logging, Aufbewahrung und Löschung frei.
- [ ] Fachverantwortliche bestätigen erfolgreiche Formularzustellung und sichtbare Nutzertexte in Staging.
- [ ] Security-Verantwortliche entscheiden nach CSP-Reportauswertung gesondert über Enforcing und eine Reduktion von `'unsafe-inline'`.
- [ ] P1-001 erhält die gesonderte fachjuristische Freigabe.
- [ ] P1-010 erhält vollständige Bildrechte-, Lizenz-, Personen- und Kundenfreigaben einschließlich der WP06-Medien.
- [ ] Erst nach allen Nachweisen eine eigene GO/NO-GO-Entscheidung dokumentieren.

## 6. Verifikation

| Prüfung | Ergebnis |
|---|---|
| TypeScript (`tsc --noEmit`) | bestanden |
| Gezieltes ESLint für alle geänderten TS-/TSX-Dateien und WP07-Test | bestanden, 0 Fehler/Warnungen |
| `git diff --check` | bestanden; nur erwartete Git-Hinweise zur lokalen LF→CRLF-Konvertierung |
| Production Build | bestanden; 74 statische Seiten |
| Finaler gezielter Browserlauf | **29/29 bestanden** |
| WP07 API/Header/Kontakt | 4/4 bestanden; Requests wurden abgefangen beziehungsweise endeten vor SMTP |
| Inquiry-Regressionen | 6/6 bestanden |
| CSP/Axe/Tastatur aus WP05 | 4/4 bestanden |
| WP06 Bilder und Redirects | 5/5 bestanden; 20/20 neue Pfade und 20/20 Altpfade geprüft |
| Produktdetail-/Shopregressionen | 8/8 bestanden |
| Raumplaner 2D↔3D/Persistenz | 2/2 bestanden |

Der erste gebündelte Lauf fand eine bereits im Test liegende Inkonsistenz: Der Produktdetail-Crawl verwendete rohe Development-Fixtures, obwohl der Production-Provider sie absichtlich nicht veröffentlicht, und erwartete deshalb für `/produkte/artikel/filzgleiter-fuer-rundrohr` fälschlich HTTP 200 statt 404. Der Test verwendet nun denselben Production-Publikationsfilter wie die Anwendung. Der isolierte Nachlauf und anschließend der vollständige finale Lauf bestanden. Produktcode oder öffentliche Produktauswahl wurden dafür nicht verändert.

Kein Test in WP07 verwendete reale SMTP-Zugangsdaten oder löste einen E-Mail-Versand aus.

## 7. Offene P1-Befunde und Zugangsdaten/Entscheidungen

- **P1-005 offen:** SMTP-Credentials, autorisierter Testempfänger, Absenderauthentifizierung, tatsächliche Zustellung, Bounce-/Fehlerpfad und Monitoring fehlen extern.
- **P1-011 offen:** finaler Proxyvertrag, zentraler atomarer Store, Mehrinstanznachweis, Abuse-Grenzwerte, Ausfallstrategie und Alarmierung fehlen.
- **P1-006 offen:** reale Domain/TLS/Edge, CSP-Reporting und spätere Enforcing-Entscheidung fehlen.
- **P1-001 offen:** AGB sowie B2B-/B2C-Modell benötigen gesonderte Freigabe.
- **P1-010 offen:** Bildrechte, Lizenzen, Personen- und Kundenfreigaben benötigen gesonderte Freigabe.

Damit ist die lokale Vorbereitung verbessert, aber die Website noch nicht als produktionsbereit freigegeben.
