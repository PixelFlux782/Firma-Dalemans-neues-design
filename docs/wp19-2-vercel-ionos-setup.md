# WP19.2 – Vercel-, Upstash- und IONOS-Vorbereitung

**Stand:** 28. Oktober 2026  
**Status:** technisch vorbereitet, nicht veröffentlicht, Zugangsdaten und externe Kontoeinstellungen nicht geprüft  
**Geltungsbereich:** zunächst ausschließlich eine geschützte Vercel-Preview; keine Tests auf `dalemans.de`

## 1. Ergebnis der Bestandsaufnahme

Die Anwendung ist mit Next.js 15.5.28 und React 19 aufgebaut. `npm run build` erzeugt eine Vercel-kompatible Next.js-Anwendung. Kontakt- und Inquiry-API deklarieren ausdrücklich die Node.js-Runtime; das ist wegen `nodemailer`, `node:crypto` und `node:net` erforderlich. Node.js 22 ist nun in `package.json` festgelegt und entspricht der bereits lokal und im Dockerfile verwendeten Hauptversion.

`vercel.json` legt `fra1` als Ausführungsregion der Vercel Functions fest. Frankfurt entspricht bei Vercel `fra1` beziehungsweise AWS `eu-central-1`. Das betrifft die Funktionsausführung, ist aber **keine Zusage einer vollständigen deutschen oder europäischen Datenresidenz**: CDN, Builds, Logs, Kontrollsysteme, Anbieterzugriffe, Unterauftragsverarbeiter, Backups und mögliche Failover-/Supportprozesse sind davon nicht automatisch umfasst.

Die beiden Formularrouten verwenden serverseitig SMTP. Kundenadressen werden nur als `Reply-To` beziehungsweise als Ziel der Inquiry-Bestätigung verwendet, nie als SMTP-Absender. Interne Empfänger kommen ausschließlich aus serverseitigen Variablen. Die Anwendung protokolliert bei Formularfehlern nur `component`, `route` und einen technischen Eventcode, nicht den Request-Body oder SMTP-Fehlerdetails.

Der Formularschutz unterstützt Upstash Redis über dessen REST-API. In Production ist die Anwendung ohne vollständige Redis-Konfiguration fail-closed und antwortet vor dem Mailversand mit HTTP 503. Lokaler Prozessspeicher wird nur außerhalb von `NODE_ENV=production` verwendet.

Quellen für die manuellen Plattformeinstellungen: [Vercel Function Regions](https://vercel.com/docs/functions/configuring-functions/region), [Vercel Node.js-Versionen](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Vercel Environment Variables](https://vercel.com/docs/environment-variables), [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection), [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi), [Upstash Global/Regional Database](https://upstash.com/docs/redis/features/globaldatabase), [IONOS SMTP-Serverdaten](https://www.ionos.de/hilfe/e-mail/allgemeine-themen/serverinformationen-fuer-imap-pop3-und-smtp/).

## 2. Vercel-Konfiguration

### Im Repository vorbereitet

- Framework: Next.js; keine abweichende Build-Konfiguration erforderlich.
- Build: `npm run build`; Install: `npm ci` oder Vercel-Standard.
- Runtime: Node.js 22.x über `engines.node`; Kontakt und Inquiry sind ausdrücklich `runtime = "nodejs"`.
- Region: `vercel.json` enthält ausschließlich `regions: ["fra1"]`.
- Serverfunktionen: `/api/contact`, `/api/inquiry`, `/api/search` und `/api/knowledge/preview`; nur die beiden Formularrouten verarbeiten Kontaktinhalte und versenden E-Mail.
- Origin-Schutz: JSON-Content-Type, Ablehnung von `Sec-Fetch-Site: cross-site`, exakter Vergleich erlaubter Origins und in Production Ablehnung eines fehlenden `Origin`-Headers.
- Logging: strukturierte technische Formularereignisse ohne Body, E-Mail-Adresse, Telefonnummer, Nachricht oder rohe SMTP-Fehler.
- CSP ist weiterhin nur `Content-Security-Policy-Report-Only`; dies ist ein bekannter Hardening-Punkt und kein durch WP19.2 behobener Datenschutzblocker.

### Manuell im Vercel-Dashboard

1. Das bereits verknüpfte Vercel-Projekt öffnen und unter **Settings → General / Build & Deployment** prüfen:
   - Framework Preset: Next.js
   - Root Directory: Repository-Wurzel
   - Node.js: 22.x; muss mit `package.json` übereinstimmen
   - keine eigenen Build- oder Output-Overrides, insbesondere nicht `.next/standalone` als manuelles Output-Verzeichnis eintragen
2. Unter **Settings → Functions → Function Regions** nur Frankfurt (`fra1`) auswählen. Nach dem Preview-Build in der Deployment-Zusammenfassung kontrollieren. Die Repository-Konfiguration ist die Sollvorgabe; eine widersprechende Dashboard-Einstellung ist zu beseitigen.
3. Unter **Settings → Git** eine geschützte, bewusst freizugebende Branch als Production Branch festlegen, zum Beispiel `production`. Der WP19.2-Testbranch darf nicht Production Branch sein. Keine CLI-Ausführung mit `--prod`.
4. Unter **Settings → Domains** sicherstellen, dass `dalemans.de` und `www.dalemans.de` noch nicht zugeordnet werden. Keine DNS-Einträge ändern.
5. Unter **Settings → Deployment Protection** Vercel Authentication mit **Standard Protection** aktivieren. Zugriff nur für freigegebene Teammitglieder. Shareable Links nur zeitlich und personell begrenzt verwenden. Passwortschutz oder Trusted IPs können je nach Tarif ergänzen, ersetzen aber nicht die Zugriffskontrolle.
6. In einem privaten Browserfenster verifizieren, dass die Preview ohne Berechtigung nicht geladen wird. Anschließend als berechtigtes Teammitglied testen.
7. Unter **Settings → Environment Variables** die Preview-Werte aus Abschnitt 3 ausschließlich für **Preview** und möglichst branch-spezifisch hinterlegen. Production zunächst leer beziehungsweise nicht funktionsfähig lassen. Änderungen gelten erst ab einem neuen Deployment.
8. Unter **Logs** während der Tests auf Environment `preview` und den Testbranch filtern. Keine Log-Drains oder Analytics-Dienste hinzufügen. Aufbewahrung, Zugriff und Löschung im gewählten Tarif manuell dokumentieren.

## 3. Tatsächlich verwendete Umgebungsvariablen

Keine der folgenden Secret-Variablen darf mit `NEXT_PUBLIC_` beginnen. Secret-Werte gehören ausschließlich in Vercel/Upstash/IONOS und einen freigegebenen Passwortmanager, nicht in Git, Tickets, Screenshots oder diese Datei.

| Variable | Preview-Soll | Production später | Verwendung |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | exakte geschützte Branch-Preview-URL | später exakte kanonische Domain | SEO-Basis und zusätzliche exakte Origin; kein `*.vercel.app` |
| `COMMERCE_PROVIDER` | `local` | `local`, solange Shopify nicht aktiviert ist | aktive Commerce-Quelle; ohne Wert ebenfalls `local` |
| `CONTACT_SMTP_HOST` | `smtp.ionos.de` | gleich | SMTP-Host |
| `CONTACT_SMTP_PORT` | `465` | gleich | SMTP-Port; alternativ 587 |
| `CONTACT_SMTP_SECURE` | `true` | gleich | implizites TLS auf 465; bei 587 `false` und STARTTLS wird erzwungen |
| `CONTACT_SMTP_USER` | IONOS-Test-/Website-Postfach | freigegebenes Website-Postfach | vollständiger IONOS-Kontoname, Secret |
| `CONTACT_SMTP_PASSWORD` | separates starkes Postfachpasswort | freigegebenes Secret | nur serverseitig, Secret |
| `CONTACT_FROM_EMAIL` | zum IONOS-Konto passende Absenderadresse | freigegebener Absender | niemals Kundenadresse |
| `CONTACT_TO_EMAIL` | intern konfigurierte Adresse; trotz Testumleitung syntaktisch erforderlich | freigegebener interner Empfänger | Kontakt-Empfänger |
| `CONTACT_MAIL_TEST_MODE` | zwingend `true` | später erst nach Freigabe `false` | erzwingt Preview-Umleitung |
| `CONTACT_TEST_TO_EMAIL` | kontrolliertes internes Testpostfach | leer oder kontrolliert | einziges Ziel des Kontaktformulars im Testbetrieb |
| `INQUIRY_TO_EMAIL` | intern konfigurierte Adresse; auch im Testmodus erforderlich | freigegebener interner Empfänger | interner Inquiry-Empfänger |
| `INQUIRY_MAIL_TEST_MODE` | zwingend `true` | später erst nach Freigabe `false` | leitet interne Mail und Kundenbestätigung um |
| `INQUIRY_TEST_TO_EMAIL` | kontrolliertes internes Testpostfach | leer oder kontrolliert | einziges Inquiry-Ziel im Testbetrieb |
| `FORM_CLIENT_IP_HEADER` | `x-forwarded-for` | gleich auf Vercel | nur ein von der Plattform normalisierter Einzel-IP-Wert wird akzeptiert |
| `FORM_RATE_LIMIT_HASH_SALT` | zufälliges, stabiles Secret | separates stabiles Production-Secret | pseudonymisiert IP/technische Kennung; muss instanzübergreifend gleich sein |
| `FORM_PROTECTION_REST_URL` | Upstash-REST-HTTPS-Endpunkt der Preview-DB | Endpunkt einer getrennten Production-DB | verteilter Formularschutz |
| `FORM_PROTECTION_REST_TOKEN` | schreibfähiger, minimal berechtigter REST-Token | separater Production-Token | serverseitiges Secret für `INCR`, TTL, `GET`, `SET`, `DEL`, `EVAL` |
| `FORM_ALLOWED_ORIGINS` | normalerweise leer; sonst nur exakte weitere freigegebene Origin(s) | exakte zusätzliche Origins | kommasepariert, keine Wildcards |

Alternativ erkennt der Code statt der beiden `FORM_PROTECTION_*`-Namen die offiziellen Upstash-Namen `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN`. Pro Umgebung **genau ein Namenspaar** verwenden, damit keine unklare Priorität entsteht.

Nur für eine spätere, derzeit nicht aktive Shopify-Anbindung existieren außerdem `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` und `SHOPIFY_STOREFRONT_API_VERSION`. Sie werden bei `COMMERCE_PROVIDER=local` nicht benötigt und sollen für WP19.2 nicht gesetzt werden.

## 4. Upstash Redis in Frankfurt

### Einrichtung

1. Im Upstash-Konto eine eigene Redis-Datenbank nur für die geschützte Preview anlegen, zum Beispiel `dalemans-form-preview`.
2. AWS als Plattform und Frankfurt als Primary Region (`eu-central-1`) wählen. Keine zusätzlichen Read Regions für diesen kleinen, schreiblastigen Schutz-Store aktivieren. Vercel `fra1` und Upstash `eu-central-1` liegen damit in derselben Zielregion.
3. TLS aktiv lassen. Eviction nach Möglichkeit deaktivieren; bei erschöpfter Kapazität soll der Schutz fehlschlagen und die Formulare fail-closed antworten, statt Idempotenzschlüssel still zu verdrängen.
4. Im Connect/REST-Bereich HTTPS-Endpunkt und einen schreibfähigen Token beziehen. Der Read-only-Token reicht wegen `INCR`, `SET`, `DEL` und `EVAL` nicht aus. Wenn der Tarif ACL-REST-Tokens unterstützt, einen Benutzer auf die tatsächlich verwendeten Befehle und den Präfix `form:*` begrenzen.
5. URL und Token ausschließlich als Preview-Secrets in Vercel hinterlegen. Danach Tokenanzeige schließen; keine Werte in lokale Shell-Historie oder Dokumentation kopieren.
6. Für Production später eine getrennte Datenbank und getrennte Tokens anlegen. Preview und Production dürfen weder Schlüsselraum noch Salt teilen.

### Verhalten der Implementierung

- Rate-Limit: atomarer Lua-Aufruf `INCR` plus `PEXPIRE` beim ersten Zugriff; maximal fünf Versuche je Route und gehashtem Client-Schlüssel in 15 Minuten. Der Redis-Schlüssel läuft nach 15 Minuten ab.
- Kontakt-Idempotenz: atomarer Claim mit 60 Sekunden Pending-TTL; nach Erfolg Ergebnis `accepted` für 10 Minuten.
- Inquiry-Idempotenz: atomarer Claim mit 2 Minuten Pending-TTL; nach Erfolg wird nur die technische Erfolgsantwort (Inquiry-ID und Bestätigungsstatus) 24 Stunden gespeichert.
- Mehrere Vercel-Instanzen teilen dieselben Redis-Schlüssel. Der Lua-Claim stellt sicher, dass dieselbe Idempotenz-ID nicht parallel zweimal angenommen wird.
- Redis-Inhalte enthalten keine Namen, E-Mail-Adressen, Telefonnummern, Nachrichten, Produktauswahl oder Raumplanerdaten. Rate-Schlüssel enthalten einen SHA-256-Hash aus Route, geheimem Salt und technischer Client-IP beziehungsweise `unattributed`; Idempotenzschlüssel enthalten nur einen SHA-256-Digest der zufälligen Submission-ID.
- Bei fehlender, unvollständiger, nicht erreichbarer oder nach drei Sekunden nicht antwortender Redis-Konfiguration werfen die Schutzfunktionen `FormProtectionUnavailable`. In Production antworten Kontakt und Inquiry mit 503, bevor SMTP aufgerufen wird.

### Bekannte Idempotenzgrenze

Die normale Doppelübermittlung und parallele Verarbeitung derselben Submission-ID werden verhindert. Es gibt jedoch ein unvermeidbares Fehlerfenster zwischen erfolgreicher SMTP-Annahme und dem anschließenden Speichern des Accepted-Ergebnisses in Redis. Fällt Redis genau dann aus, kann die Anwendung den bereits erfolgten Versand nicht transaktional zurückrollen; ein späterer Retry könnte erneut senden. SMTP und Redis bilden keine gemeinsame Transaktion. Vor Livegang ist zu entscheiden, ob die vorhandene At-least-once-Grenze akzeptiert wird oder in einem Folge-WP ein dauerhafter Outbox-/Provider-Idempotenzmechanismus eingeführt wird. Eine Exactly-once-Zustellung wird nicht behauptet.

## 5. IONOS-SMTP

### Empfohlene Konfiguration

- Host: `smtp.ionos.de`
- Port: `465`
- `CONTACT_SMTP_SECURE=true` für SSL/TLS ab Verbindungsbeginn
- Alternative: Port `587`, `CONTACT_SMTP_SECURE=false`; der Code setzt dann `requireTLS=true` und erzwingt STARTTLS
- TLS: Zertifikatsprüfung aktiv, Servername `smtp.ionos.de`, minimale TLS-Version 1.2
- Benutzername: vollständiges IONOS-E-Mail-Konto
- `CONTACT_FROM_EMAIL`: ein von IONOS für dieses Konto zugelassener Absender derselben Domain; IONOS kann abweichende Absender ablehnen
- `Reply-To`: beim Kontakt und bei der internen Inquiry-Mail darf die validierte Kundenadresse stehen; sie wird nicht als SMTP-Envelope-Absender verwendet
- Empfänger: ausschließlich die serverseitigen `*_TO_EMAIL`-Variablen; im Preview-Testmodus werden alle Ziele auf das jeweilige interne Testpostfach umgeleitet

### Manuelle Einrichtung und Nachweis

1. Ein geeignetes IONOS-Postfach bestimmen und dessen Versandberechtigung/Absenderdomain prüfen.
2. Zugangsdaten in Vercel nur für den Testbranch/Preview eintragen; keine Werte in Client-Code oder `NEXT_PUBLIC_*`.
3. Beide Testmodi auf `true` setzen und beide Testziele auf ein kontrolliertes internes Postfach setzen. Auch wenn im Formular eine synthetische Kundenadresse steht, darf keine Nachricht dorthin gehen.
4. Neues Preview-Deployment erzeugen und zunächst je eine Kontakt- und Inquiry-Mail senden.
5. Im Testpostfach vollständige Rohheader prüfen: korrekter `From`, `To`, `Reply-To`, Message-ID und serverseitige `Received`-/TLS-Angaben. Ein erfolgreicher UI-Status allein belegt die TLS-Verbindung nicht vollständig.
6. Port 465 ist die Hauptkonfiguration. Nur bei nachgewiesenem Verbindungsproblem kontrolliert auf 587/STARTTLS umstellen und erneut Header sowie Vercel-Eventcodes prüfen.

Es wurde in WP19.2 keine echte SMTP-Verbindung hergestellt und keine Zustellung nachgewiesen.

## 6. Preview-Sicherheitscheckliste

- [ ] Testbranch ist nicht der Vercel Production Branch.
- [ ] Kein `vercel --prod`, kein Production-Deployment und keine Production-Promotion ausgeführt.
- [ ] `dalemans.de`/`www.dalemans.de` sind nicht als Vercel-Domains angebunden; DNS bleibt unverändert.
- [ ] Vercel Authentication/Standard Protection ist aktiv und im Inkognito-Fenster geprüft.
- [ ] Zugriff erhalten nur benannte interne Tester; keine öffentlichen Shareable Links.
- [ ] Preview-Variablen sind branch-spezifisch; Production-Secrets bleiben getrennt.
- [ ] `NEXT_PUBLIC_SITE_URL` bezeichnet exakt die geschützte Preview-Branch-URL.
- [ ] `FORM_ALLOWED_ORIGINS` ist leer oder enthält nur exakte Origins; niemals `*.vercel.app` oder eine Liste aller Vercel-Domains.
- [ ] Beide Mail-Testmodi sind `true`; beide Testempfänger sind kontrollierte interne Postfächer.
- [ ] Preview verwendet eine eigene Upstash-Datenbank, eigenen Token und eigenen Salt.
- [ ] Nur synthetische Namen, Adressen, Telefonnummern, Nachrichten, Projekte und Produktauswahlen werden verwendet.
- [ ] Browser-Autofill ist für den Test deaktiviert; keine echten Kundenanfragen in Zwischenablage oder Screenshots.

## 7. Testanleitung nach manueller Aktivierung

Vor jedem Test Vercel-Logs auf den Preview-Branch filtern und im Testpostfach eine eigene Kennzeichnung verwenden, zum Beispiel `WP19.2-T01`. Niemals eine reale Kundenadresse in Formularfelder eintragen.

1. **Kontakt erfolgreich:** gültige synthetische Daten absenden; HTTP 200/UI-Erfolg, genau eine Mail im `CONTACT_TEST_TO_EMAIL`-Postfach und keine Mail an eine Formularadresse prüfen.
2. **Inquiry erfolgreich:** ein veröffentlichtes Produkt in die Auswahl legen und `/anfrage` vollständig absenden; HTTP 201/UI-Erfolg, interne Mail und umgeleitete Bestätigung ausschließlich bei `INQUIRY_TEST_TO_EMAIL` prüfen.
3. **Verschlüsselung:** Rohheader der Testnachricht sowie IONOS-Verbindungsdaten prüfen; Vercel-Konfiguration muss Port 465/`secure=true` oder 587/erzwungenes STARTTLS zeigen. Keine erfolgreiche TLS-Zustellung behaupten, bevor dieser Nachweis vorliegt.
4. **Empfänger:** `To` in den Rohheadern muss exakt dem Testziel entsprechen; `From` dem IONOS-Absender; synthetische Kundenadresse höchstens als `Reply-To`.
5. **Spam-Limit:** mit sechs synthetischen Requests derselben Route, Origin und Test-IP, aber unterschiedlichen Submission-IDs innerhalb von 15 Minuten testen. Höchstens fünf werden zugelassen; mindestens einer muss 429 plus `Retry-After` liefern. Nur gegen das interne Mail-Testziel.
6. **Mehrfachversand:** denselben Payload mit identischer Submission-/Idempotenz-ID parallel zweimal senden. Erwartet: einmal Verarbeitung, parallel 409/Pending oder gespeicherte Erfolgsantwort; im Postfach keine doppelte interne Mail. Danach innerhalb der Accepted-TTL erneut senden und Replay-Verhalten prüfen.
7. **Redis-Ausfall:** nur in Preview den Redis-Token vorübergehend ungültig machen oder den Endpunkt auf eine kontrolliert nicht erreichbare Testadresse setzen, neu deployen und Formular absenden. Erwartet: 503, Event `form_protection_unavailable`, keine Mail. Danach korrekte Secrets wiederherstellen und neu deployen.
8. **Parallelität/mehrere Instanzen:** 10–20 gleichzeitige Requests mit derselben Idempotenz-ID sowie eine zweite Serie mit unterschiedlichen IDs ausführen. Der atomare Claim darf nur eine identische Verarbeitung zulassen; das atomare Rate-Limit muss instanzunabhängig zählen. In Vercel Invocation-Details Region `fra1` prüfen.
9. **Raumplaner:** ausschließlich synthetischen Raum anlegen, über den vorgesehenen Kontakt-Handoff wechseln, Zusammenfassung prüfen und Kontakt absenden. Prüfen, dass keine vollständige Raumgeometrie serverseitig oder in Redis landet. Die bereits bekannte URL-Query-Zusammenfassung kann in URL-/Hostinglogs erscheinen und bleibt separat zu minimieren.
10. **Logs:** nach eindeutigen synthetischen Namen, E-Mail-Adressen, Telefonnummern und Nachrichtentexten in Runtime-/Build-Logs suchen. Erwartet: keine Treffer. Zulässig sind Route, Status, Dauer und die technischen Eventcodes. Auch Log-Drains und Retention prüfen.

Nach Redis- oder Environment-Tests die Preview neu deployen, weil Vercel-Variablen bestehende Deployments nicht rückwirkend ändern. Testmails und Testschlüssel nach Abschluss gemäß vereinbarter Testaufbewahrung löschen; keine Redis-Produktionsdaten per `FLUSHDB` löschen.

## 8. Datenschutz- und Vertragsprüfpunkte

- Vercel-DPA/AVV, Unterauftragsverarbeiter, Drittlandmechanismen, Supportzugriffe, Logdaten, Aufbewahrung und Löschmöglichkeiten fachkundig prüfen.
- Upstash-DPA/AVV, gewählter Cloudanbieter/Region, Backups, Supportzugriffe, Verschlüsselung, Token-/ACL-Modell, Aufbewahrung und Löschung dokumentieren.
- IONOS-Vertrag/AVV, Postfachzugriffe, Empfänger, Speicher- und Löschfristen, Spam-/Archivsysteme und technische Headerdaten prüfen.
- Verantwortlichen, Rechtsform, Impressum und die noch nicht freigegebene Datenschutzerklärung aus WP19 fachjuristisch abschließen. Vercel, Upstash, IONOS, Formulare, pseudonymisierte Rate-Limit-Kennung, Logs und Löschkriterien implementierungsgetreu benennen.
- Keine pauschale Aussage „alle Daten bleiben in Deutschland/EU“ allein aus `fra1`/`eu-central-1` ableiten.
- Öffentliche Assets, Raumplaner-Query-String und CSP-Härtung bleiben die im WP19-Audit beschriebenen separaten Prüfpunkte.

## 9. Verbleibende Blocker

1. Vercel-, Upstash- und IONOS-Kontozugriff sowie echte Secrets fehlen; Dashboardzustand, Region und Zustellung konnten nicht praktisch verifiziert werden.
2. Keine SMTP-Testzustellung und kein TLS-/Headernachweis durchgeführt.
3. Keine echte Upstash-Datenbank verbunden; atomare Abläufe und Ausfallsimulation sind bislang nur durch Codeprüfung/lokale Tests bewertet.
4. Preview Deployment Protection, Production Branch, Domains, Log-Retention und Teamrechte müssen manuell geprüft werden.
5. DPA/AVV, Unterauftragsverarbeiter, Drittlandmechanismen und Löschkonzepte sind nicht freigegeben.
6. Datenschutz und Impressum bleiben laut WP19-Audit Livegang-Blocker.
7. SMTP/Redis bieten keine gemeinsame Exactly-once-Transaktion; das dokumentierte Fehlerfenster nach SMTP-Annahme benötigt eine bewusste Freigabe oder ein Folge-WP.

Erst wenn alle Preview-Tests bestanden, die Vertrags-/Rechtspunkte freigegeben und getrennte Production-Secrets angelegt sind, darf ein eigener Livegang-WP die Production-Konfiguration, Domainzuordnung und DNS-Umstellung behandeln.
