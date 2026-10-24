# WP05 – Technische Release-Bereitschaft

Stand: 23. Oktober 2026  
Scope: DLMNS-P1-005, DLMNS-P1-006, DLMNS-P1-007, DLMNS-P1-011 und der offene Raumplaner-Smoke  
Release-Entscheidung: **keine Freigabe; externe Restprüfungen und die fachjuristischen Freigaben bleiben offen**

## Ergebnisübersicht

| Befund | Status nach WP05 | Nachweis / nächster Schritt |
|---|---|---|
| DLMNS-P1-005 | **offen – externes Staging/SMTP erforderlich** | Lokaler Fehlerpfad erneut mit HTTP 503 verifiziert; keine Zugangsdaten erfunden und keine E-Mail versendet. End-to-End-Zustellung, Fehlerpfad und Monitoring in isoliertem Staging prüfen. |
| DLMNS-P1-011 | **offen – Zielplattform und verteiltes Rate-Limit fehlen** | Validierung, Honeypot und Größenlimits sind vorhanden. Inquiry-Limit und Idempotenzcache bleiben instanzlokal; Kontakt besitzt kein belastbares verteiltes Limit. Vertrauenswürdige Proxy-IP und zentraler Store sind extern festzulegen. |
| DLMNS-P1-006 | **lokal verifiziert, release-seitig offen** | Sieben Header am Production-Server vorhanden; fünf kritische Browserrouten einschließlich 3D ohne CSP-Verletzung. TLS-/Edge-Verhalten, CSP-Reporting und späteres Enforcing bleiben offen. |
| DLMNS-P1-007 | **technischer Axe-Befund behoben, Abschlussverifikation offen** | Axe: 0 Verstöße bei 1440×900 und 390×844; Tastatur-, Auswahl- und Transformationsprüfungen bestanden. Ein Test mit echter assistiver Technologie war nicht verfügbar und bleibt erforderlich. |
| Raumplaner-Smoke | **geschlossen** | Ursache war ausschließlich eine außerhalb des gerenderten SVG liegende feste Testkoordinate. Größenrelative Nutzerklicks sowie explizite Tür-/Hindernis-Persistenzprüfung sind grün. |

P1-001 und P1-010 wurden nicht verändert oder fachlich/rechtlich neu bewertet.

## DLMNS-P1-005 – SMTP-Betriebsbereitschaft

### Maßgeblicher Befund und vorhandene Maßnahmen

`/api/contact` und `/api/inquiry` benötigen die in `.env.example` dokumentierte SMTP-Konfiguration. Ohne diese Konfiguration muss eine gültige Anfrage kontrolliert scheitern. Die Routen validieren Eingaben, begrenzen Verbindungszeiten und liefern verständliche 5xx-Fehler; die Oberflächen behalten Eingaben beziehungsweise Warenkorb bei einem Annahmefehler.

Ein lokaler Production-Request mit der nicht zustellbaren Auditadresse `wp05@example.invalid` ergab erneut HTTP 503 mit dem vorgesehenen Hinweis. Es wurde keine E-Mail versendet.

### Einordnung

- **Lokal vollständig geprüft:** Validierungs-/Größenfehler, UI-Fehlerbehandlung und fehlende Konfiguration führen zu kontrollierten Antworten.
- **Konfiguration erforderlich:** SMTP-Host, Port, Transportverschlüsselung, Benutzer, Passwort, Absender und freigegebener Testempfänger.
- **Erst nach Staging/Deployment prüfbar:** tatsächliche Zustellung, Absenderauthentifizierung, Bounce-/Timeout-Verhalten, Providerlimits, Logs und Alarmierung.
- **Externe Entscheidung/Zugangsdaten:** SMTP-Anbieter, Credentials, Empfänger, Datenstandort/AV-Vertrag, Monitoring-Verantwortung und Alarmweg.

Es erfolgte keine lokale Produktcodeänderung, weil der offene Teil ohne reale Staging-Konfiguration nicht seriös geschlossen werden kann.

## DLMNS-P1-011 – Formularschutz

### Tatsächlicher Stand

- Beide Routen besitzen serverseitige Validierung, Honeypot und Request-Größenlimits (`contact`: 10.000 Byte, `inquiry`: 35.000 Byte).
- Inquiry besitzt ein Limit von fünf Versuchen in 15 Minuten, einen Idempotenzcache und eine Obergrenze für Rate-Limit-Einträge.
- Rate-Limit und Idempotenzcache liegen jedoch in Prozessspeicher und sind bei Neustarts oder mehreren Instanzen nicht konsistent.
- Die Clientkennung vertraut auf den ersten Wert aus `x-forwarded-for`, ersatzweise `x-real-ip`; welche Header vertrauenswürdig sind, hängt von der noch unbekannten Zielplattform ab.
- Für Kontakt ist kein belastbares Rate-Limit implementiert. Monitoring/Alarmierung ist aus dem Repository nicht nachweisbar.

### Einordnung

- **Lokal vollständig geprüft:** bestehende Schutzpfade und Größenlimit der Kontakt-API; zugehörige Formularregressionen bestanden.
- **Konfiguration/Implementierung nach Plattformwahl:** zentraler atomarer Rate-Limit-/Idempotenz-Store sowie ausschließlich von der Plattform bereinigte Client-IP verwenden; Kontakt und Inquiry gemeinsam abdecken.
- **Erst nach Deployment prüfbar:** zweite Instanz/Neustart, manipulierte Forwarding-Header, Parallelität, Grenzwerte, `Retry-After`, Provider-/Edge-Limits, Log-Redaktion und Alarmierung.
- **Externe Entscheidung:** Zielplattform, verbindlicher Proxy-Header, Store/Service, Grenzwerte, Aufbewahrung, Fail-open/Fail-closed-Verhalten und Betriebsverantwortung.

Ohne diese Angaben wurde bewusst weder ein Dienst noch eine Environment-Variable oder eine scheinbar produktionsreife lokale Ersatzlösung erfunden.

## DLMNS-P1-006 – Security Header und CSP

`next.config.mjs` setzt global:

- `Content-Security-Policy-Report-Only`
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`
- `Cross-Origin-Opener-Policy: same-origin`

Die CSP bleibt absichtlich Report-only. Sie enthält keine Wildcard und erlaubt:

- Skripte und Styles von `'self'`; Inline-Skripte/-Styles bleiben für den aktuellen Next-/UI-Betrieb zugelassen.
- Bilder von `'self'`, `data:` und `blob:`.
- Schriften von `'self'` und `data:`.
- Browser-API-Verbindungen nur zu `'self'`.
- Worker von `'self'` und `blob:` für den aktuellen 3D-/Browserbetrieb.
- Keine Frames oder Objekte; Formulare und Base-URI bleiben same-origin.

Shopify wird serverseitig angesprochen und benötigt deshalb keine browserseitige `connect-src`-Freigabe. Externe Gesetzes-/Maps-URLs sind normale ausgehende Links, keine eingebetteten Ressourcen. Für Startseite, Produktübersicht, Produktkonfiguration, Anfrage und Raumplaner einschließlich aktivierter 3D-Ansicht wurden `securitypolicyviolation`-Ereignisse erfasst: **0 Verletzungen**. Der Production-Build und die Headerprüfung bestanden.

Offen bleiben ein definierter CSP-Report-Endpunkt beziehungsweise eine Hosting-seitige Auswertung, ein repräsentativer Staging-Beobachtungszeitraum, TLS/HSTS an der echten Domain sowie eine Prüfung auf Edge-Überschreibungen. Erst danach darf separat über Enforcing entschieden werden.

## DLMNS-P1-007 – Accessibility-Abschlussprüfung

### Automatisiert verifiziert

- Axe mit WCAG-2.0/2.1/2.2-A/AA-Regeln auf `/raumplaner` bei 1440×900: **0 Verstöße**.
- Axe mit denselben Regeln bei 390×844: **0 Verstöße**.
- Damit wurden auch automatisiert erkennbare Kontrast- und ARIA-Regeln geprüft; `aria-prohibited-attr` trat nicht erneut auf.
- Rollen, zugängliche Namen, H1, Gruppen/Toolbars/Statusbereiche und das Fehlen semantisch unzulässiger `aria-selected`-Attribute wurden durch WP03-Regressionen erneut bestätigt.
- Werkzeugauswahl per Fokus und Enter, SVG-Wandmaß per Tastatur, Fokusübergabe in das Maßeingabefeld und Schließen per Escape bestanden.
- Sieben Raumplaner-Fälle für Klick-/Shift-/Rahmenauswahl, gemeinsames Verschieben, Duplizieren, Rotation, Schutz anderer Objekte, Zoom/Pan und Escape-Abbruch bestanden.
- Vorhandene Dialog-/Popover-Semantik wurde durch Axe erfasst; der automatisiert erreichbare Maßeingabedialog verwaltete Fokus und Escape korrekt.

### Nicht verfügbar

Eine Bedien- und Ansageprüfung mit NVDA, JAWS, Narrator oder VoiceOver konnte in der verfügbaren automatisierten Umgebung nicht mit echter assistiver Technologie durchgeführt werden. Ebenso ersetzt die Automation keinen Test auf realem Touchgerät. Deshalb wird P1-007 trotz geschlossenem ursprünglichem Axe-Codebefund nicht als vollständig release-geschlossen markiert.

## Raumplaner-Smoke

Der frühere Test verwendete `canvas.click({ position: { x: 420, y: 360 } })`. Die Production-Geometrie der Zeichenfläche war im reproduzierten Lauf 323 px hoch. `y=360` lag daher außerhalb des SVG und traf die regulär darunter folgende Statuszeile. Es lag weder ein Z-Index- noch ein Layoutfehler der bedienbaren Zeichenfläche vor.

Der Test verwendet nun Positionen relativ zur aktuellen Bounding Box, schließt Werkzeugoptionen wie ein Nutzer und prüft explizit zwei persistierende Objekte (Tür und Hindernis) vor und nach 2D → 3D → 2D. Assertions wurden nicht entfernt oder abgeschwächt. Die drei relevanten Browser-Smokes sind grün:

1. Stuhlmodell/Bedarf beim Ansichtswechsel.
2. Tür und Hindernis beim Ansichtswechsel.
3. 2D-Raum zeichnen, schließen, bearbeiten und rückgängig machen.

## Geänderte Dateien in WP05

- `tests/room-planner.spec.ts` – robuste, realistische Klickpositionen und stärkerer Persistenznachweis.
- `tests/wp05-technical-readiness.spec.ts` – CSP-, Axe- und Tastaturabschlussprüfung ohne neue Abhängigkeit; vorhandenes transitives `axe-core` wird verwendet.
- `audit/prelaunch/WP05-TECHNICAL-READINESS.md` – dieser Bericht.

Es wurden keine produktiven Systeme, Zugangsdaten, Environment-Variablen oder Produktdaten verändert.

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | bestanden |
| ESLint für beide in WP05 geänderten Testdateien | bestanden |
| `git diff --check` | bestanden |
| Production Build (`next build`) | bestanden; 74 statische Seiten |
| WP05 CSP/Axe/Tastatur | 4/4 bestanden |
| Raumplaner-Smokes | 3/3 bestanden |
| Raumplaner-Auswahl/Transformation | 7/7 bestanden |
| WP02-/WP03-/WP04-Regressionen im gebündelten Lauf | 10/10 bestanden |
| Formular-/Inquiry-Zielregressionen | 5/5 bestanden |
| Gültiger Kontaktrequest ohne SMTP | erwartete 503-Antwort; kein Versand |

Im ersten gebündelten Lauf bestanden 26/27 Tests; nur der neue Tastaturtest erwartete fälschlich die Rolle `spinbutton`, während das vorhandene Dezimalfeld korrekt als `textbox` exponiert wird. Der Locator wurde an die tatsächliche Accessibility-Semantik angepasst; der vollständige WP05-Nachlauf bestand anschließend 4/4. Keine Produktassertion wurde gelockert.

## Bekannte Regressionen und Release-Blocker

In den geprüften Bereichen sind keine neuen Regressionen bekannt. Die bestehenden WP02-/WP03-/WP04-Korrekturen blieben in den gezielten Läufen grün.

Verbleibende Blocker:

- P1-005: Staging-SMTP, Testempfänger, Zustellnachweis und Monitoring.
- P1-011: Zielplattform, vertrauenswürdige Proxy-IP, verteilter Store und Abuse-/Lasttest.
- P1-006: reale Domain/TLS/Edge, CSP-Reportauswertung und spätere gesonderte Enforcing-Entscheidung.
- P1-007: echte Screenreader-/AT-Prüfung; reale Touch-/Cross-Browser-Stichprobe bleibt ergänzend sinnvoll.
- P1-001 und P1-010: unverändert externe fachjuristische beziehungsweise Rechte-/Einwilligungsfreigabe.

Es gibt auf Basis von WP05 ausdrücklich **keine vorzeitige GO-Entscheidung**.

## Checkliste für die spätere Produktiv-/Stagingumgebung

- [ ] Freigegebene Staging-SMTP-Zugangsdaten ausschließlich im Secret Store setzen; Testempfänger erzwingen.
- [ ] Kontakt und Inquiry erfolgreich zustellen; Timeout, SMTP-Fehler, Bounce und Kundenbestätigungsfehler prüfen.
- [ ] Zustell-/Fehlermonitoring ohne Nachrichteninhalt oder unnötige personenbezogene Daten nachweisen und Alarmweg testen.
- [ ] Zielplattform und den von ihr bereinigten Client-IP-Header dokumentieren; gefälschte Forwarding-Header testen.
- [ ] Verteiltes Rate-Limit/Idempotenz für beide Formularrouten über mindestens zwei Instanzen und einen Neustart prüfen.
- [ ] Abuse-/Paralleltest mit vereinbarten Limits, `Retry-After`, Log-Redaktion und Alarmierung durchführen.
- [ ] HTTPS, Zertifikatskette, Redirects, HSTS und alle Security Header an der finalen Domain sowie hinter CDN/Edge prüfen.
- [ ] CSP-Reports über einen definierten Zeitraum auf kritischen Nutzerpfaden auswerten; erst danach separat über Enforcing entscheiden.
- [ ] Raumplaner einschließlich 3D, Formulare und Shopübergänge unter der finalen CSP erneut prüfen.
- [ ] Raumplaner mit echtem Screenreader und Tastatur prüfen; Dialogansagen, Werkzeugwechsel, Auswahl und Transformation dokumentieren.
- [ ] Externe fachjuristische Freigaben für P1-001/P1-010 einholen; erst danach Releaseentscheidung treffen.
