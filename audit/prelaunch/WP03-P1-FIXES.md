# WP03 – P1 Release-Fixes

Stand: 23. Oktober 2026  
Arbeitsumfang: vier zusammenhängende P1-Befunde aus dem vorhandenen Pre-Launch-Audit  
Release-Entscheidung: weiterhin keine Freigabe

## Auswahl und Priorisierung

Für dieses Arbeitspaket wurden die vier automatisiert reproduzierten Accessibility-, Viewport- und Strukturprobleme mit unmittelbarer Nutzerwirkung gebündelt:

| ID | Befund | Status nach WP03 |
|---|---|---|
| DLMNS-P1-007 | Unzulässige ARIA-Attribute im Raumplaner | **Korrektur umgesetzt und gezielt verifiziert; noch nicht vollständig geschlossen**, da Axe-/Screenreader-Nachlauf fehlt |
| DLMNS-P1-008 | Raumplaner überschreitet 1440×900 vertikal | **behoben und verifiziert** |
| DLMNS-P1-009 | Raumplaner ohne H1 und nicht in der Sitemap | **behoben und verifiziert** |
| DLMNS-P1-012 | Zwei Preisumschalter unterschreiten die Touch-Zielgröße | **behoben und verifiziert** |

Die Auswahl erforderte weder neue Produktdaten noch rechtliche oder betriebliche Entscheidungen. Bereits vorhandene Änderungen und die WP02-P0-Schutzmaßnahmen wurden erhalten.

## Übernahme und Änderungszuordnung

- **Codex 1:** implementierte sämtliche nachfolgend beschriebenen Code- und Teständerungen für P1-007, P1-008, P1-009 und P1-012, führte Build, Audit sowie die dokumentierten Browserläufe aus und legte diesen Bericht an.
- **Codex 2:** übernahm den unveränderten Worktree, prüfte die vier Fixes und den WP02-Regressionsschutz gezielt nach und finalisierte ausschließlich diesen Bericht. Es waren keine weiteren Produktcode- oder Teständerungen erforderlich.

## DLMNS-P1-007 – ARIA-Semantik im Raumplaner

### Ursache

Benannte generische `div`- und SVG-`g`-Elemente besaßen `aria-label`, ohne eine Rolle zu haben, die eine Benennung erlaubt. SVG-Geometrien verwendeten außerdem `aria-selected`, obwohl Polygon und Rechteck keine dafür geeignete Widget-Rolle hatten. Das Branding war ebenfalls ein generisches benanntes Element.

### Reparatur

- Inhaltlich zusammengehörige Steuerungen und SVG-Ebenen erhielten `group`, `toolbar` oder `status`.
- Das Branding und der sichtbare Auswahlrahmen erhielten eine zulässige `img`-Semantik.
- `aria-selected` auf reinen SVG-Geometrien wurde durch `data-selected` ersetzt; die visuelle und funktionale Auswahl bleibt unverändert.
- Lade-, Projekt-, Ansichts-, Planungs-, Ergebnis- und Variantenbereiche erhielten passende Rollen.
- Die zugehörigen Auswahltests wurden nur auf den neuen nicht-semantischen Zustandsmarker umgestellt.

### Geänderte Dateien

- `src/components/room-planner/PlannerBrand.tsx`
- `src/components/room-planner/RoomPlanner.tsx`
- `src/components/room-planner/RoomPlannerLoader.tsx`
- `src/components/room-planner/2d/MeasurementLayer.tsx`
- `src/components/room-planner/2d/ProjectControls.tsx`
- `src/components/room-planner/2d/RoomEditor2D.tsx`
- `tests/room-planner-wp1841.spec.ts`
- `tests/wp03-p1-fixes.spec.ts`

### Verifikation und Restrisiko

- Production-Browser prüft die erwarteten Rollen, zugänglichen Namen und das Fehlen von `aria-selected` auf SVG-Geometrien.
- Eine statische Suche findet keine generischen Planner-`div`/`g`/`rect`/`polygon` mehr, die ohne geeignete Rolle mit `aria-label` benannt werden.
- Branding-, 2D-/3D-/Druck- und komplexe Mehrfachauswahltests bestanden.
- `@axe-core/playwright`/Axe ist im Projekt nicht als Testabhängigkeit installiert. Es wurde bewusst keine neue Dependency nur für WP03 ergänzt. Ein vollständiger Axe-Nachlauf sowie ein echter Screenreader-Test bleiben vor Release erforderlich.

Damit ist die konkrete Codekorrektur abgesichert, der ursprüngliche Axe-Befund wird ohne erneuten vollständigen Axe-Lauf jedoch nicht als abschließend geschlossen bezeichnet.

## DLMNS-P1-008 – Planner-Höhe bei 1440×900

### Ursache

Die Desktop-Höhe verwendete `calc(100dvh - 120px)`, während der Workspace tatsächlich bei y=180 beginnt. Dadurch endete er bei y=952. Ein erster Korrekturlauf mit 172 px reproduzierte noch einen Restüberlauf von 8 px.

### Reparatur

Die beiden Desktop-/Tablet-Regeln verwenden jetzt `max(560px, calc(100dvh - 180px))`. Der tatsächlich belegte Kopfbereich wird vollständig abgezogen; die Mindesthöhe wurde moderat reduziert, damit kleinere Desktop-Höhen keinen erzwungenen Überlauf erzeugen.

### Geänderte Datei

- `src/app/globals.css`

### Verifikation

- Beide zuvor roten 1440×900-Tests bestehen.
- Der neue Regressionstest misst das Ende des Workspace bei höchstens 900 px.
- Ergebnis- und Angebotsaktionen bleiben im Zielviewport erreichbar.

## DLMNS-P1-009 – H1 und Sitemap

### Ursache

Die clientseitig geladene Planner-Oberfläche stellte keine Seiten-H1 bereit; `/raumplaner` fehlte gleichzeitig in der statischen Sitemap-Liste.

### Reparatur

- Serverseitige, visuell versteckte H1 `Dalemans Raumplaner für Bestuhlungspläne` ergänzt. Damit ändert sich das Design nicht.
- `/raumplaner` bewusst in die XML-Sitemap aufgenommen.

### Geänderte Dateien

- `src/app/raumplaner/page.tsx`
- `src/app/sitemap.ts`
- `tests/wp03-p1-fixes.spec.ts`

### Verifikation

- Browser findet genau die H1 auf der Route.
- Generierte Production-Sitemap enthält `/raumplaner`.

## DLMNS-P1-012 – Touch-Ziele des Preisumschalters

### Ursache

Beide Umschalter verwendeten Tailwinds `min-h-9` und waren damit nur 36 CSS-Pixel hoch.

### Reparatur

Beide Buttons verwenden jetzt `min-h-11` und erreichen mindestens 44 CSS-Pixel, ohne Preislogik oder Erscheinungsbild grundlegend zu ändern.

### Geänderte Dateien

- `src/components/commerce/PriceDisplayProvider.tsx`
- `tests/wp03-p1-fixes.spec.ts`

### Verifikation

Der Browser misst bei 390×844 für beide Umschalter mindestens 44 px Höhe.

## Testergebnisse

### Von Codex 1 übernommen

| Prüfung | Ergebnis |
|---|---|
| `npx tsc --noEmit` | bestanden |
| `npx eslint src tests` | bestanden |
| `npm run build` | bestanden; Next 15.5.28, 74 statische Seiten |
| `npm audit --omit=dev --json` | bestanden; 0 Produktionsschwachstellen |
| neue WP03-Regressionen | 3/3 bestanden |
| bestehende Planner-Viewport-/UX-Tests | 5/5 bestanden |
| Planner-Branding/Druck | 2/2 bestanden |
| Planner-Mehrfachauswahl/-Transformation | 7/7 bestanden |
| WP02-P0-Regressionen | 3/3 bestanden |
| finaler gemeinsamer Browserlauf | 20/20 bestanden |

Codex 1 dokumentierte zwei behobene Zwischenfehler: zunächst 8 px Restüberlauf im Zielviewport und anschließend einen veralteten Test-Locator für den Auswahlrahmen. Nach den jeweiligen Korrekturen bestand der finale gemeinsame Lauf vollständig.

### Von Codex 2 am 23. Oktober 2026 ausgeführt

| Prüfung | Ergebnis |
|---|---|
| `node node_modules/typescript/bin/tsc --noEmit` | bestanden |
| gezieltes ESLint für alle WP03-Komponenten und die drei relevanten Testsuiten | bestanden; 0 Fehler, 0 Warnungen in den geprüften TS-/TSX-Dateien |
| `tests/wp03-p1-fixes.spec.ts` | 3/3 Testfälle bestanden |
| `tests/room-planner-wp1841.spec.ts` | 7/7 Auswahl-/Transformationsfälle bestanden |
| `tests/p0-release-blockers.spec.ts` | 3/3 WP02-P0-Regressionen bestanden |
| gezielte statische ARIA-Suche in den Planner-Komponenten | bestanden; benannte generische Elemente mit passender Rolle, kein `aria-selected` auf den geprüften SVG-Geometrien |

Der kombinierte Playwright-Lauf meldete alle 13 Testfälle als bestanden. Unter Windows beendete der Runner danach seinen lokalen Next-Testserver nicht selbst und wurde manuell abgebrochen; es gab keinen fehlgeschlagenen Test und anschließend keinen Listener mehr auf Port 3100. Der zunächst versuchte `npx`-Aufruf von TypeScript wurde durch die lokale PowerShell-Ausführungsrichtlinie blockiert und deshalb nicht als Test gewertet; der identische lokale Compiler wurde anschließend direkt über Node erfolgreich ausgeführt.

Codex 2 hat keinen erneuten Production-Build und keinen erneuten Dependency-Audit ausgeführt, weil beide im übernommenen Stand bereits erfolgreich dokumentiert waren und seither keine Produktionsabhängigkeit geändert wurde. Build-Hinweise ohne neuen Fehlerstatus: Baseline-Browser-Mapping und Browserslist melden veraltete Metadaten. Dependency-Updates waren nicht Bestandteil von WP03.

## Offene manuelle Prüfungen

- vollständiger Axe-Nachlauf auf `/raumplaner` bei 1440×900 und 390×844;
- Bedien- und Ansageprüfung mit einem echten Screenreader;
- visuelle Prüfung in Firefox und WebKit, bei 200 % Zoom sowie auf einem realen Touchgerät;
- Verifikation der Security Header und übrigen betrieblichen Eigenschaften an der späteren Hosting-Edge;
- die in WP02 dokumentierte fachjuristische und betriebliche Freigabe der Datenschutzerklärung.

## Verbleibende P1-Befunde

Acht P1-Befunde wurden in WP03 nicht bearbeitet. Zusätzlich bleibt P1-007 bis zum Axe-/Screenreader-Nachlauf verifikatorisch offen. Damit sind **neun P1-Befunde noch nicht vollständig release-geschlossen**, davon acht ohne WP03-Implementierung.

| ID | Kurzbeschreibung | Status / notwendiger nächster Schritt |
|---|---|---|
| DLMNS-P1-001 | AGB und B2B-/B2C-Modell | **offen**; Geschäftsentscheidung und fachjuristische Freigabe erforderlich |
| DLMNS-P1-002 | Entwicklungsstatus auf Startseite | **offen**; lokal klein und ohne externe Abhängigkeit behebbar |
| DLMNS-P1-003 | „Bild folgt“ in Produktkategorie | **offen**; freigegebenes Asset erforderlich oder Kategorie ausblenden |
| DLMNS-P1-004 | Knowledge-Popover/Tabellenkanten | **offen**; Mapping, API-Fallback und vier Regressionen bearbeiten |
| DLMNS-P1-005 | SMTP-Zustellung nicht nachgewiesen | **offen**; isoliertes Staging mit Testempfänger und Monitoring erforderlich |
| DLMNS-P1-006 | Security Header fehlen | **offen**; Anwendung/Edge abstimmen, CSP zunächst kontrolliert testen |
| DLMNS-P1-010 | Bildrechte/Altbestände | **offen**; Rechte- und Einwilligungsmatrix erforderlich |
| DLMNS-P1-011 | Formularschutz nicht produktionsreif | **offen**; Zielplattform, vertrauenswürdige Proxy-IP und verteiltes Rate-Limit festlegen |

## Regressionen und verbleibende Release-Blocker

- Die gezielten Codex-2-Nachläufe zeigen keine neue funktionale, Layout- oder P0-Regression in den automatisiert geprüften Bereichen.
- Die reduzierte Mindesthöhe wurde in Chromium bei den relevanten Zielmaßen geprüft. Firefox, WebKit, 200-%-Zoom und reale Touchgeräte bleiben Teil der übergeordneten offenen Testmatrix.
- Die ARIA-Korrektur ist strukturell und durch Browser-Locators geprüft; die abschließende Bewertung mit Axe und assistiver Technologie steht noch aus.
- Die Aufnahme in die Sitemap macht den Planner bewusst indexierbar. Die noch offenen fachlichen und rechtlichen Freigaben des Planners bleiben dadurch unverändert releasekritisch.
- Eine Release-Freigabe bleibt außerdem durch die acht unbearbeiteten P1-Befunde, die offenen manuellen Accessibility-/Cross-Browser-Prüfungen sowie die fachjuristischen und betrieblichen WP02-Restpunkte blockiert.

## Empfehlung für das nächste Arbeitspaket

Empfohlenes WP04, priorisiert nach direkter Kundenwirkung und Release-Relevanz:

1. **P1-002 – Entwicklungsstatus auf der Startseite:** sichtbaren unfertigen Zustand entfernen oder produktionsreif ersetzen; klein, öffentlich und ohne externe Abhängigkeit.
2. **P1-004 – Knowledge-Popover/Tabellenkanten:** Mapping und API-Fallback korrigieren und die vier vorgesehenen Regressionen absichern; direkte Funktionswirkung.
3. **P1-003 – „Bild folgt“ in der Produktkategorie:** nur mit freigegebenem Asset umsetzen; andernfalls die betroffene Kategorie nach dokumentierter Produktentscheidung ausblenden.
4. **P1-006 – Security Header:** als zusammenhängendes Security-Paket umsetzen; CSP zunächst im Report-only-/Testmodus prüfen und die Hosting-Edge ausdrücklich mitverifizieren.

Diese WP04-Aufgaben wurden nicht implementiert. P1-001, P1-005, P1-010 und P1-011 benötigen vor technischer Umsetzung belastbare rechtliche, inhaltliche oder betriebliche Vorgaben.

Es wurden keine Commits, Pushes oder Deployments durchgeführt.
