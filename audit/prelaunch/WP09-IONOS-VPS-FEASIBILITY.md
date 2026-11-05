# WP09 – IONOS VPS Feasibility Audit

Stand: 27. Oktober 2026

Gegenstand: technische, wirtschaftliche und betriebliche Machbarkeit; kein Deployment, keine Migration, keine DNS- oder Produktionsänderung.

## A. Zusammenfassung

**Abschlussbewertung: CONDITIONAL GO – geeignet mit notwendigen Anpassungen.**

Die Dalemans-Anwendung ist als dauerhaft laufender Next.js-Node-Prozess auf einem Linux-VPS technisch betreibbar. Die untersuchte Codebasis enthält keine zwingende Vercel-Laufzeitbindung: vier App-Router-API-Routen, Nodemailer, Next.js Image Optimization mit Sharp, statische/SSG-Seiten, dynamische Wissens- und Suchrouten sowie die 3D-Assets funktionieren mit dem Next.js Production Server. Ein statischer HTML-Export ist wegen API-Routen, serverseitiger Produktauflösung, SMTP und Bildoptimierung keine gleichwertige Alternative.

Der lokale `next build` mit Node 22 und `output: "standalone"` bestand (74 statische Seiten); der erzeugte Standalone-Server wurde unter Windows im Production-Modus erfolgreich geprüft. Docker selbst ist lokal nicht installiert, daher fehlen ein realer Linux-Containerbuild, Containergrößen- und cgroup-Messungen. Dafür wurden eine minimale Multi-Stage-Konfiguration und eine gehärtete lokale Compose-Testdefinition erstellt.

Ein **VPS L+ (4 vCores, 8 GB RAM, 240 GB NVMe)** ist die sinnvolle Einstiegsklasse für Dalemans plus zwei bis drei kleinere Next.js-Websites, sofern Images in GitHub Actions gebaut, persistente Dienste sparsam dimensioniert und je Container Limits gesetzt werden. Der Engpass wäre zuerst RAM/CPU bei parallelen Builds, Bildtransformationen oder zusätzlichen datenbanklastigen Apps, nicht der Dalemans-Leerlauf. Builds auf dem Produktions-VPS werden nicht empfohlen. M+ ist für Dalemans allein grundsätzlich ausreichend, bietet für mehrere Apps und Wartung aber wenig Reserve; XL+ ist aktuell ohne zusätzliche schwere Dienste oder nachgewiesene Last nicht gerechtfertigt.

Vor öffentlicher Freigabe zwingend: zentraler atomarer TTL-Store für Rate-Limit/Idempotenz, vertraglich sauberer Proxy-IP-Header, SMTP-Stagingtest, Monitoring/Alarmierung, Backup/Restore-Test, Server-Härtung sowie die weiterhin offenen fachlichen/rechtlichen Freigaben aus WP07.

## B. Kompatibilität

### Unverändert beziehungsweise mit Standard-Node-Laufzeit nutzbar

| Bestandteil | Befund für den VPS |
|---|---|
| Next.js 15.5.28 / React 19.2 | Production Server und Standalone-Build funktionieren. Vier dynamische API-Routen und weitere dynamische Seiten bleiben erhalten. |
| Node.js | Lokal `v22.15.0`; GitHub Workflow nutzt Node 22. Für Server/CI Node 22 LTS festschreiben. Ein `engines`-Feld fehlt derzeit, ist aber kein Laufzeithindernis. |
| Sharp 0.35.5 / `next/image` | Direkte Abhängigkeit und Override sind vorhanden. Native lokale Transformation lieferte HTTP 200. Das Debian-basierte Docker-Image vermeidet Alpine/musl-Sonderfälle; der tatsächliche Linux-Build bleibt nachzuholen. |
| API-Routen | `/api/contact`, `/api/inquiry`, `/api/search`, `/api/knowledge/preview` laufen im Node-Server. Kontakt und Anfrage deklarieren explizit `runtime = "nodejs"`. |
| Server Components/SSG | Production-Build erzeugte 74 statische Seiten; dynamische Routen werden vom Node-Server bedient. Keine Edge-only-Komponente gefunden. |
| Server Actions | Keine `"use server"`-Actions gefunden. |
| Middleware/Proxy | Keine Next-Middleware und kein projektspezifischer Proxy vorhanden. Caddy wird neu vorgeschaltet. |
| Statische Assets und 3D | `public/` wird in den Runner kopiert. Der getestete GLB-Pfad lieferte 200 und `model/gltf-binary`. Die Raumplaner-Projekte liegen clientseitig in `localStorage`; dafür ist kein Servervolume nötig. |
| Redirects | Die Redirects liegen in `next.config.mjs` und werden vom Next-Server ausgeführt. Ein Altbildpfad wurde im neuen Standalone-Lauf mit 308 geprüft; WP07 hatte alle 20 Bildredirects mit finalem WebP 20/20 geprüft. |
| Security Header | Die vorhandenen Header wurden lokal bestätigt. HSTS ist am finalen HTTPS-Endpunkt erneut zu prüfen. |
| Produktdaten/Shop | Standard ist `COMMERCE_PROVIDER=local`; Produktdaten sind in der Anwendung. Shopify-Code ist vorbereitet, der Provider aber absichtlich noch nicht aktiv. Eine spätere Aktivierung benötigt ausgehendes HTTPS und Secrets. |
| Dateizugriffe/Uploads | Keine serverseitigen Uploads oder produktiven Dateischreibzugriffe gefunden. Der App-Container kann read-only laufen; nur `/tmp` wird als kleines tmpfs bereitgestellt. |

### Anpassungen und Vercel-Unterschiede

- `output: "standalone"` wurde für den portablen Node-Runner ergänzt. `public/` und `.next/static/` müssen zusätzlich in das Runtime-Image kopiert werden; der Dockerfile tut dies.
- Vercels CDN, Edge-Schutz, Preview Deployments, Build-Infrastruktur und Plattform-Observability entfallen. Caddy liefert TLS und Reverse Proxy, ersetzt aber kein CDN/WAF und keine Anwendungsmetriken.
- Next Image Optimization läuft nun auf dem eigenen CPU-/RAM-Budget. Der Cache liegt in `.next/cache`; der read-only Runner persistiert ihn in der Testkonfiguration nicht. Das ist funktional korrekt, kann aber wiederholte Transformationen verursachen. Für Produktion entweder ein begrenztes beschreibbares Cache-Volume je App vorsehen oder alle wichtigen Bilder voroptimieren und Cachewirkung messen.
- Die In-Memory-Maps für Formularlimits und Idempotenz sind instanzlokal, gehen beim Neustart verloren und funktionieren nicht konsistent über mehrere Replikate. Vor öffentlichem Betrieb ist ein gemeinsamer atomarer Redis-/Valkey-TTL-Store erforderlich.
- Ohne korrekt gesetztes `FORM_CLIENT_IP_HEADER` erhalten alle Requests den Schlüssel `unattributed` und teilen sich ein Limit. Ein Client darf den gewählten Header nicht selbst bestimmen können. Caddy muss eingehende Werte entfernen und aus der tatsächlichen Verbindung kontrolliert neu setzen; bei vorgeschaltetem CDN sind ausschließlich dokumentierte Proxy-CIDRs zu vertrauen.
- Die CSP ist weiterhin nur `Content-Security-Policy-Report-Only` und enthält bei Script/Style `'unsafe-inline'`. Das ist kein Migrationshindernis, aber keine abgeschlossene CSP-Härtung.
- Linux ist case-sensitive. Die Builds und bisherigen WP06/WP07-Pfadtests zeigen keinen belegten Fehler; wegen zahlreicher Umlaute, Leerzeichen und gemischter Großschreibung in Altassets bleibt ein Linux-Crawl Teil von WP10.

## C. Lokaler Docker-Test

### Tatsächlich durchgeführt

| Prüfung | Ergebnis |
|---|---|
| Docker-Verfügbarkeit | `docker` und `docker compose` nicht installiert beziehungsweise nicht im PATH. Keine fremden Container oder Volumes berührt. |
| Native Production Build | Bestanden mit Node 22.15.0 / npm 10.9.2; Next.js 15.5.28; 74 statische Seiten. |
| Standalone-Start | Bestanden; Ready nach ca. 360 ms (Windows-Host, Warm-/Lokalwert). |
| Kernseiten | `/`, `/produkte`, `/raumplaner`: jeweils HTTP 200. |
| API ohne externe Wirkung | `/api/search?q=stuhl`: 200. Ungültige leere POSTs an Kontakt und Anfrage: jeweils 422; kein SMTP-Versand. |
| 3D-Asset | `/models/dalemans-chair-low.glb`: 200, 11.214.628 Bytes, `model/gltf-binary`. |
| Image Optimization | `/_next/image?...&w=640&q=75`: 200, 37.884 Bytes, `image/jpeg`, lokal ca. 462 ms beim geprüften Aufruf. |
| Redirect | `/neue%20bilder/produkte-hero.png`: 308 zum neuen WebP. Vollständige 20/20-Abdeckung stammt aus WP07 und wurde nicht unnötig wiederholt. |
| Header | CSP Report-Only, HSTS, nosniff, DENY, Referrer-, Permissions- und COOP-Header vorhanden. |
| Begrenzter Lastimpuls | 120 GETs, Parallelität 12, 120/120 erfolgreich, ca. 574 ms beziehungsweise 209 Requests/s lokal/warm. Kein öffentlicher Endpunkt wurde belastet. Dieser Wert ist kein Kapazitätsversprechen. |

### Nicht durchgeführt

- Kein Linux-/Docker-Build, keine Prüfung des tatsächlich im Image installierten Sharp-Binaries und keine Compose-/cgroup-Messung.
- Keine echten E-Mails, keine produktiven API-Schreiboperationen, keine externen Lasttests.
- Kein vollständiger Browserlauf im Container und keine TLS-/Caddy-Prüfung, da weder Container noch echte Stagingdomain existieren.
- Keine belastbare Docker-Imagegröße; sie wird unten nur geschätzt.

Erstellte Testdateien: `Dockerfile`, `.dockerignore`, `compose.feasibility.yml`, `.env.docker.local.example`. Vor einem lokalen Dockerlauf die Beispieldatei nach `.env.docker.local` kopieren und alle Mailfelder leer beziehungsweise Testmodi aktiv lassen.

## D. Ressourcenbedarf

### Messwerte dieser Untersuchung

| Größe | Messwert |
|---|---:|
| Standalone-Prozess nach Start/Requests, Working Set | ca. 101–131 MB |
| Standalone-Prozess, Private Memory | ca. 103–139 MB |
| CPU-Zeit bis nach 120 Requests plus Einzeltests | ca. 2,53 s Prozess-CPU; davon rund 0,94 s Zuwachs während Lastimpuls/Bildtest |
| `public/` | 520,8 MiB, 429 Dateien |
| `public/models/` | 39,3 MiB, 5 GLB-Dateien |
| Erzeugtes Standalone-Verzeichnis inklusive kopiertem `public/` | 592,1 MiB |
| Standalone-Anteil ohne `public/` | 71,2 MiB |

Der größte Speicherposten ist nicht die Anwendung, sondern öffentlich ausgeliefertes Altmaterial: `public/neue bilder` ca. 335,4 MiB und `public/pictures` ca. 113,3 MiB. Eine einzelne PNG-Datei belegt ca. 87,3 MiB. Das ist funktional zulässig, vergrößert jedoch Image, Registrytransfer, Backup und Deploymentzeit.

### Schätzwerte und Kapazität

| Größe | Konservative Planung | Einordnung |
|---|---:|---|
| Dalemans Runtime-RAM | Limit 768 MB; typisch voraussichtlich 150–400 MB | Reserve für Sharp, Cache und Lastspitzen; Linux-Container noch messen. |
| Dalemans CPU | 0,5–1 vCPU Limit/Reservation nach Messung feinjustieren | Statische/SSG-Antworten leicht; uncached Bildtransformationen sind CPU-lastiger. |
| Build-RAM | ca. 2–4 GB bereitstellen | Nicht als Messwert belegt; Next-Build deshalb in GitHub Actions statt auf Production. |
| Docker-Image | grob 0,7–1,0 GB | Schätzung aus 592 MiB Runtime-Dateien plus Debian/Node-Layern; erst ein Linux-Build liefert den exakten komprimierten Registrywert. |
| Serverdisk für Dalemans | 5–10 GB Betriebsbudget | Mehrere Imageversionen, Logs und Cache zusätzlich zum aktuellen Runtimeinhalt. |
| Mehrere Apps auf L+ | ca. 3–5 GB für App-Container, Caddy, Monitoring und Redis reservieren; Rest als Puffer | Für Dalemans plus 2–3 kleine Apps realistisch, solange keine lokalen Datenbanken/Builds dominieren. |

**Antwort auf die Kernfrage:** Ja, 8 GB RAM reichen voraussichtlich für Dalemans und zwei bis drei kleinere Websites. Voraussetzung sind externe CI-Builds, Containerlimits, Logrotation und Monitoring. Ein Upgrade wird nötig, wenn KAVONA eigene speicherintensive Datenbanken/Worker, hohe Bildtransformationslast, Browserprozesse oder regelmäßig parallele Builds auf demselben Host benötigt. Vorher messen statt vorsorglich XL+ kaufen.

## E. Infrastrukturarchitektur

Empfohlenes Zielbild auf Ubuntu 24.04 LTS:

```text
Internet :80/:443
        │
      Caddy  ── persistentes caddy_data/caddy_config
        │ gemeinsames internes proxy-Netz, keine App-Ports öffentlich
        ├── dalemans:3000      (read-only, eigener User, Limits, eigenes env)
        ├── dlmns-main:3000    (separates Compose-Projekt/Container)
        ├── dlmns-digital:3000 (separates Compose-Projekt/Container)
        └── kavona-front:3000  (später, nur Architektur)
                 │
             Redis/Valkey (intern, ACL/Passwort, persistiert nur falls fachlich nötig)
```

- Caddy als eigener, versionsfixierter Container; Ports 80/443 allein öffentlich. Automatisches HTTPS benötigt korrekte DNS-Ziele, offene Ports 80/443 und persistenten Caddy-Datenspeicher.
- Je Anwendung eigenes Compose-Projekt, internes Netz, Env-Datei mit restriktiven Dateirechten, Healthcheck, `restart: unless-stopped`, `read_only`, `no-new-privileges`, entfernte Linux-Capabilities und CPU/RAM-Limits.
- Ein bewusst angelegtes externes Docker-Netz verbindet Caddy nur mit den Frontends. Datenbanken/Redis liegen in separaten internen Netzen und sind nicht direkt öffentlich.
- Keine Host-Pfade für Anwendungscode. Images sind unveränderlich und per Digest/Release-Tag referenziert. Persistenz nur für Caddy-Zertifikate, Redis/Datenbanken, Uploads (derzeit keine) und eventuell einen begrenzten Next-Image-Cache.
- Logs an stdout/stderr; Docker-Logrotation (`max-size`, `max-file`) plus zentraler Export/Alarmierung. Keine PII oder Request-Bodies protokollieren.
- Caddy reicht standardmäßig Proxy-Header weiter. Der IP-Vertrag muss konkret festlegen, welcher von Caddy neu gesetzte Single-IP-Header in der App gelesen wird. Bei einem zusätzlichen CDN gelten dessen offizielle IP-Ranges und strikte Proxy-Vertrauenskette.

Caddy automatisiert Zertifikatsbeschaffung/-erneuerung und HTTP→HTTPS für gültige Domains ([Caddy Automatic HTTPS](https://caddyserver.com/docs/automatic-https)). Seine Proxy-Vertrauenseinstellungen sind explizit zu konfigurieren; standardmäßig wird kein vorgeschalteter Proxy vertraut ([Caddy global options](https://caddyserver.com/docs/caddyfile/options)).

## F. Multi-App-Fähigkeit

- Updates sind je App unabhängig: eigenes Image, eigener Release-Tag, eigene Env-Datei und eigener Healthcheck. Ein fehlgeschlagenes App-Deployment darf Caddy und andere Compose-Projekte nicht neu erstellen.
- Ressourcenlimits verhindern, dass eine einzelne App den gesamten Host planmäßig verbraucht. Sie bieten aber keine vollständige Mandantenisolation; Kernel, Disk, Netzwerk und Host bleiben gemeinsam.
- Gemeinsame Dienste nur bei klarem Nutzen: Caddy, Monitoring-Agent und gegebenenfalls Redis/Valkey. Datenbanken besser logisch und zugriffsseitig je App trennen; Credentials nie teilen.
- Das größte betriebliche Risiko ist der **gemeinsame Serverausfall**: Hardware-/Hostfehler, Fehlkonfiguration, volle Disk, kompromittierter Root-Zugang oder IONOS-Störung treffen alle Domains gleichzeitig. Backups verkürzen Wiederherstellung, schaffen aber keine Hochverfügbarkeit. Für geschäftskritisches KAVONA später separaten VPS oder Managed-Dienste erwägen.
- Ein L+ ist eine gute Konsolidierungsplattform, aber kein HA-Cluster. Statusseite und Backups müssen außerhalb dieses VPS liegen.

## G. Sicherheit

Vor öffentlichem Release zwingend:

1. Ubuntu minimal installieren; eigener sudo-Admin; SSH nur mit Keys, `PermitRootLogin no`, Passwortlogin deaktivieren; Recovery-Zugang dokumentieren.
2. IONOS-Hardware-Firewall und Host-Firewall auf 22 (idealerweise Admin-IP/VPN), 80 und 443 begrenzen. Die IONOS-Standardregeln können weitere Ports enthalten und müssen bereinigt werden ([IONOS VPS – erste Schritte](https://www.ionos.de/hilfe/index.php?id=5334)).
3. Automatische Security Updates, regelmäßige Reboots nach Kernelupdates und Versionspflege für Docker, Caddy, Node-Basisimage und App-Abhängigkeiten.
4. Container ohne Root, ohne zusätzliche Capabilities, read-only, keine Docker-Socket-Mounts, Ressourcenlimits und gepinnte Images/Digests. Secrets außerhalb von Git mit `0600`; kein Secret in Image-Layern oder CI-Logs.
5. Zentraler Redis-/Valkey-Store für atomare Rate-Limits und Idempotenz, getrennte Schlüsselräume/ACLs und definierte Fail-Strategie. Die lokalen Maps sind nicht produktionsfest.
6. Caddy darf clientseitige Forwarded-/Real-IP-Werte nicht ungeprüft zur App durchreichen. Der einzige von der App akzeptierte Header wird am Proxy überschrieben und enthält exakt eine validierte IP.
7. Formularschutz ergänzen: bestehender Honeypot, Bodylimits und Validierung beibehalten; Grenzwerte beobachten; bei Missbrauch optional Turnstile/hCaptcha datenschutzgeprüft ergänzen. Caddy allein ist ohne zusätzliches Modul kein verteilter Redis-Rate-Limiter.
8. TLS/Redirect/HSTS auf echter Stagingdomain prüfen. CSP zunächst Reports sammeln, dann nach Bereinigung möglichst enforcing und ohne unnötiges `'unsafe-inline'` ausrollen.
9. Externes Uptime-Monitoring, Host-/Container-Metriken, Disk-/RAM-/CPU-Alarme sowie Alarmierung für 429, SMTP-Fehler und 5xx. Zugriff und Aufbewahrung datenschutzgerecht begrenzen.

## H. Deployment

Empfohlener Low-Maintenance-Workflow:

1. Codex/lokale Entwicklung → Pull Request → Lint, TypeScript, Tests und `next build` in GitHub Actions.
2. Multi-Arch ist derzeit nicht nötig; ein Linux/amd64-Image bauen, SBOM/Vulnerability-Scan durchführen und mit unveränderlichem Commit-SHA in GHCR veröffentlichen.
3. Staging-Deployment automatisch oder per geschützter Umgebung auf separater Domain/Compose-Projekt; Mail-Testmodi zwingend aktiv.
4. Production über GitHub Environment manuell freigeben. VPS zieht ausschließlich das bereits getestete Image; kein Source-Build auf Production.
5. `docker compose pull` und gezieltes Update nur der betroffenen App. Erst nach bestandenem Healthcheck Caddy auf die neue Instanz schalten. Für echtes Low-Downtime Blue/Green mit zwei verschieden benannten App-Services/Ports verwenden; ein einfacher Compose-Recreate verursacht typischerweise kurze Unterbrechung.
6. Vorherigen Digest/Release-Tag behalten. Rollback heißt: Caddy zurückschalten beziehungsweise vorherigen Image-Digest starten; Datenmigrationen separat rückwärtskompatibel planen.

Builds außerhalb des VPS sind klar vorzuziehen: Sie vermeiden RAM-/CPU-Spitzen und die Installation von Dev-Abhängigkeiten auf Production. GitHub Actions ist im Repository bereits etabliert, aktuell allerdings nur für den Stoffkarten-Workflow. Eine neue Deployment-Pipeline wird erst in WP10 erstellt und hier nicht ausgelöst.

## I. Kosten

Preisstand der folgenden Anbieterangaben: am 27. Oktober 2026 abgerufen; Angebote können sich ändern. Domain/E-Mail bleiben laut Auftrag bei IONOS und sind deshalb bei allen Varianten als bestehende, hier nicht neu bezifferte Kosten zu behandeln.

| Variante | Verifizierte Grundangabe | Zusatzkosten/Einordnung |
|---|---:|---|
| A. Vercel Pro | 20 USD/Monat Plattformgebühr, 1 Deploying Seat und 20 USD Usage Credit; Mehrverbrauch nutzungsabhängig, Preise zzgl. Steuern | Managed CDN, WAF/DDoS-Basis, CI/CD, Previews und Plattformbetrieb reduzieren Eigenwartung. Optionale Observability/Web Analytics je 10 USD/Monat; weitere Usage möglich. [Vercel Pro](https://vercel.com/docs/plans/pro-plan), [Pricing](https://vercel.com/pricing) |
| B. IONOS VPS M+ | 12 EUR/Monat regulär; aktuell 4 EUR/Monat für 3 Monate plus 10 EUR Einrichtung, inkl. MwSt. | 2 vCores, 4 GB, 120 GB. Dalemans allein wahrscheinlich ausreichend, für Multi-App wenig Betriebsreserve. |
| C. IONOS VPS L+ | 22 EUR/Monat regulär; aktuell 7 EUR/Monat für 3 Monate plus 10 EUR Einrichtung, inkl. MwSt. | 4 vCores, 8 GB, 240 GB. Empfohlener Start für 3–4 kleine Apps. |
| D. IONOS VPS XL+ | 41 EUR/Monat regulär; aktuell 12 EUR/Monat für 3 Monate plus 10 EUR Einrichtung, inkl. MwSt. | 8 vCores, 16 GB, 480 GB. Mehr Reserve, aktuell aber nicht durch Messwerte erforderlich. |

IONOS-Quelle und Tarifdetails: [IONOS VPS](https://www.ionos.de/server/vps). Die sichtbaren Aktionspreise gelten nur für drei Monate; für die Entscheidung ist der reguläre Preis maßgeblich.

Ein optionaler IONOS Cloud Backup Service wird mit 0,07 EUR/GB/30 Tage ausgewiesen; je nach gewählter Betriebsart können weitere Gebühren anfallen, etwa 5,88 EUR/Gerät/30 Tage für „Direkt Backup in der Cloud“ ([IONOS Backup Service](https://cloud.ionos.de/storage/backup)). Das konkrete VPS-Backup-Produkt und Retention vor Kauf schriftlich bestätigen. Alternativ verursachen S3-kompatibler Offsite-Speicher, Monitoring und gegebenenfalls Managed Redis/Datenbank eigene, hier nicht belastbar bezifferte Kosten.

Wirtschaftlich ist der L+ bei mehreren Websites beim reinen Infrastrukturpreis attraktiv. Die Rechnung kippt zugunsten Vercel, wenn Administration, Patchen, Bereitschaft, Restore-Tests und Sicherheitsbetrieb als Arbeitszeit hoch bewertet werden. VPS-Kosten sind planbarer, aber der Betreiber übernimmt diese Leistungen selbst.

## J. Risiken

| Risiko | Auswirkung | Maßnahme |
|---|---|---|
| Docker/Linux noch nicht praktisch geprüft | Native Sharp-/Pfadproblem könnte erst in WP10 auftreten | Image in CI auf Linux bauen, Container-Crawl und 20 Redirects wiederholen. |
| Gemeinsamer Host ist Single Point of Failure | Alle Websites gleichzeitig offline | Externe Backups/Monitoring, dokumentierter Neuaufbau; kritische Apps später trennen. |
| Instanzlokales Rate-Limit/Idempotenz | Umgehung bei Replikaten/Restart oder globales Limit ohne Proxy-IP | Redis/Valkey atomar implementieren; Proxyvertrag testen. |
| Große Assets/Image | Langsamere Pulls, Diskbedarf und Deployments | Unreferenzierte Altassets nach gesonderter Prüfung aus `public/` entfernen oder externisieren; keine Löschung in WP09. |
| Self-hosted Image Optimization | CPU-Spitzen und Cache-Wachstum | Cachelimit/Volume, Voroptimierung, Metriken; gegebenenfalls CDN später. |
| SMTP-Zustellung unbewiesen | Formulare können trotz Build fehlschlagen | Staging-Sink/Testpostfach, Timeout/Reject/Bounce und SPF/DKIM/DMARC prüfen. |
| Fehlende Managed-WAF/Edge-Funktionen | Größere Angriffs- und Betriebsfläche als Vercel | Firewall, Proxy-Härtung, App-Limits, Patchprozess, optional vorgeschalteter CDN/WAF. |
| Preis-/Angebotsänderung | Budgetabweichung | Regulärpreise kalkulieren, Angebot und Vertragslaufzeit vor Bestellung bestätigen. |
| Offene WP07-Freigaben | Hosting-Migration macht Website nicht releasefähig | Recht, Bildrechte, CSP, SMTP, Monitoring und Security separat schließen. |

## K. Empfehlung

**VPS L+ wählen, aber erst nach einem kurzen WP10-Linux-Staging-Gate produktiv migrieren.**

Der konkrete Code zeigt eine moderate Node-Laufzeit, überwiegend statische Seiten und keine lokale Datenbank beziehungsweise Uploadpersistenz. Das passt gut zu einem Container-VPS. 8 GB bieten genug Reserve für Dalemans, Caddy, Redis/Valkey, Monitoring und zwei bis drei kleine weitere Apps, ohne den deutlichen Aufpreis des XL+. Das M+-Paket spart Geld, würde aber bei vier Apps, Image-Spitzen, Updates und Incident-Diagnose unnötig knapp. XL+ erst bei gemessener anhaltender RAM-Auslastung über etwa 70 %, CPU-Sättigung, lokalen Datenbanken/Workern oder konkreten KAVONA-Anforderungen wählen.

Diese Hostingfreigabe ist unabhängig von der bisherigen öffentlichen Releasefreigabe: WP07s offene rechtliche, Mail-, Proxy-/Store- und Security-Punkte bleiben bestehen.

## L. Nächste Schritte – WP10 VPS-Einrichtung

1. L+ Vertragsdetails, regulären Preis, Laufzeit, Backupoption, Rechenzentrumsstandort und Restore-Leistung vor Kauf bestätigen.
2. Ubuntu 24.04 LTS bereitstellen; Admin-/SSH-/Firewall-/Update-Baseline härten und dokumentieren.
3. GitHub Action für Linux-Imagebuild, Tests, SBOM/Scan und GHCR erstellen; keine Secrets in Builds geben.
4. Docker-Konfiguration auf Linux bauen; exakte Imagegröße, Build-Peak, Startzeit, Idle-/Last-RAM und Sharp-Binary messen.
5. Caddy, persistente Zertifikatsdaten, internes Proxy-Netz und eine isolierte Stagingdomain einrichten; Header-/IP-Vertrag testen.
6. Redis/Valkey-Abstraktion für Rate-Limit und Idempotenz implementieren und Mehrinstanz-/Restart-Tests durchführen.
7. Vollständigen sicheren Container-Crawl ausführen: Kernseiten, alle APIs ohne realen Versand, 20 Redirects, Bildoptimierung, PDFs, 5 GLBs, Raumplaner 2D/3D, Shop und Security Header.
8. IONOS SMTP ausschließlich im Staging-Testmodus prüfen: `smtp.ionos.de`, Port 465, `secure=true`; alternativ Port 587 mit STARTTLS falls 465 blockiert ist. Absenderdomain, Limits, SPF/DKIM/DMARC, Reject/Timeout/Bounce testen. IONOS nennt 465/SSL-TLS als Standard und 587/STARTTLS als Alternative ([IONOS SMTP-Daten](https://www.ionos.de/hilfe/e-mail/allgemeine-themen/serverinformationen-fuer-imap-pop3-und-smtp/)). Port 25 ist für ausgehenden VPS-Verkehr standardmäßig gesperrt, für diesen authentifizierten 465/587-Plan aber nicht erforderlich.
9. Offsite-Backup für Konfiguration, Secrets (verschlüsselt), Caddy-Daten und alle künftigen persistenten Appdaten einrichten. Täglich automatisieren, Retention definieren und monatlich einen Restore in isolierter Umgebung testen. Images und Code sind aus Registry/Git reproduzierbar und gehören nicht zur einzigen Datensicherung.
10. Externes Uptime-Monitoring, Metriken, Logrotation und Alarme aktivieren; Runbooks für volle Disk, 5xx, Zertifikat, SMTP, Redis und Rollback schreiben.
11. Staging fachlich abnehmen; erst danach manuell freigegebenes Blue/Green-Production-Deployment, DNS-Umschaltung und dokumentierter Rollback. Diese Schritte wurden in WP09 ausdrücklich nicht ausgeführt.

## Änderungen und Nachweisgrenze

WP09 änderte ausschließlich lokale Machbarkeitsartefakte und `next.config.mjs` für Standalone-Ausgabe. Es wurden keine Commits, Pushes, Deployments, DNS-Änderungen, Käufe, realen E-Mails oder Änderungen an KAVONA vorgenommen. Der bestehende Worktree war vor WP09 sauber; alle nun sichtbaren Änderungen gehören zu diesem Arbeitspaket.
