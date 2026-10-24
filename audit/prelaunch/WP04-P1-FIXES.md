# WP04 – P1 Release-Fixes, Paket 2

Stand: 23. Oktober 2026

## Bearbeitete Befunde

### DLMNS-P1-002 – Sichtbarer Entwicklungsstatus auf der Startseite

- **Ursprünglicher Fehler:** Auf `/` erschien der Hinweis „Website in Entwicklung · Inhalte werden laufend ergänzt“.
- **Ursache:** `DevelopmentNotice` war im produktiven Hero fest importiert und gerendert.
- **Korrektur:** Einbindung und ausschließlich dafür vorhandene Komponente entfernt; der Hinweis wird nicht per CSS verborgen.
- **Geänderte Dateien:** `src/app/page.tsx`; `src/components/home/DevelopmentNotice.tsx` entfernt; Regression in `tests/wp04-p1-fixes.spec.ts`.
- **Testergebnisse:** Browserprüfung auf `/` bestanden; Text ist nicht mehr im DOM.
- **Abschlussstatus:** **vollständig behoben**.

### DLMNS-P1-004 – Wissens-Popover und Tabellenkanten-Integration

- **Ursprünglicher Fehler:** Die zentralen Stoffgruppen-Trigger fehlten; Popover-Interaktionen und der Tabellenkanten-Test liefen teilweise in Timeouts; Preview-Aufrufe für noch nicht gepflegte Tischkanten antworteten 404.
- **Ursache:** Der spezialisierte Stuhlkonfigurator verwendete nur den Stoff-/Farbberater und band `KnowledgeInfoTrigger` nicht an die bereits vorhandenen zentralen Einträge an. Fehlende Knowledge-Inhalte wurden von der API als HTTP-Fehler behandelt. Der Tischkantentest verlangte außerdem einen exakten Accessible Name, obwohl der Variantenbutton zusätzlichen Preissubtext enthält.
- **Korrektur:** Knowledge-Trigger für Stoffgruppen 2–4 ergänzt, ohne den Stoff-/Farbberater zu ersetzen; Triggerzustand bei Mappingwechsel zurückgesetzt; fehlende Preview-Inhalte liefern den neutralen Fallback `200 { entry: null }`; Tischkanten bleiben ohne falschen sichtbaren Trigger auswählbar; Locator auf den tatsächlichen Accessible Name ausgerichtet. Die Mobile-Geometrieprüfung erlaubt 8 px Rendering-/Safe-Area-Toleranz.
- **Geänderte Dateien:** `src/components/chairs/ChairConfigurator.tsx`, `src/components/knowledge/KnowledgeInfoTrigger.tsx`, `src/app/api/knowledge/preview/route.ts`, `tests/knowledge-integration.spec.ts`, `tests/wp04-p1-fixes.spec.ts`.
- **Testergebnisse:** Alle fünf Knowledge-Integrationstests bestanden; API-Fallback separat im Production-Build bestanden.
- **Abschlussstatus:** **vollständig behoben**.

### DLMNS-P1-003 – Öffentliche Produktkategorie enthält „Bild folgt“

- **Ursprünglicher Fehler:** Die Klappstuhl-Kategorie zeigte auf `/produkte` statt eines freigegebenen Motivs den Platzhalter „Bild folgt“.
- **Ursache:** Die Sortimentsübersicht veröffentlichte explizit ausgewählte Collections auch dann, wenn `collection.image` fehlte.
- **Korrektur:** Die Übersicht rendert nur Collections mit vorhandenem Bild; der Platzhalterzweig wurde aus dieser öffentlichen Liste entfernt. Vorhandene Produkt- und Collection-Daten wurden nicht verändert.
- **Geänderte Dateien:** `src/app/produkte/page.tsx`, `tests/wp04-p1-fixes.spec.ts`.
- **Testergebnisse:** `/produkte` enthält weder „Bild folgt“ noch den unvollständigen Klappstuhl-Einstieg; Commerce-Regressionen 19/19 bestanden.
- **Abschlussstatus:** **für den auditierten Fehler auf `/produkte` vollständig behoben**. Eine spätere Wiederveröffentlichung benötigt weiterhin ein freigegebenes Bild samt Alt-Text.

### DLMNS-P1-006 – Wesentliche Security Header fehlen

- **Ursprünglicher Fehler:** HTML-Antworten des lokalen Production-Servers enthielten keine explizite CSP, HSTS, MIME-Sniffing-, Frame-, Referrer-, Permissions- oder COOP-Policy.
- **Ursache:** `next.config.mjs` definierte keine Response Header; eine Hosting-Edge-Konfiguration ist im Repository nicht nachgewiesen.
- **Korrektur:** Globale App-Header für CSP im Report-only-Modus, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` und COOP ergänzt. Die CSP erlaubt nur die für den aktuellen Next-/3D-Betrieb benötigten Quellen und erzwingt noch nichts.
- **Geänderte Dateien:** `next.config.mjs`, `tests/wp04-p1-fixes.spec.ts`.
- **Testergebnisse:** Alle sieben erwarteten Header am neu gebauten lokalen Production-Server verifiziert; Production Build und Browserregressionen bestanden.
- **Abschlussstatus:** **anwendungsseitig umgesetzt, release-seitig noch offen**. Vor Erzwingung der CSP müssen Report-only-Meldungen ausgewertet werden. HSTS und alle übrigen Header müssen an der realen TLS-/Hosting-Edge auf Weitergabe oder Überschreibung geprüft werden.

## Offene Risiken

- P1-006 bleibt bis zur Prüfung der realen Produktionsdomain und Hosting-Edge offen. Eine CSP-Meldeinfrastruktur bzw. ein definierter Auswertungszeitraum ist extern festzulegen; es wurde kein Report-Endpunkt erfunden.
- Die Klappstuhl-Kategorie kann auf `/produkte` erst wieder erscheinen, wenn ein fachlich und rechtlich freigegebenes Bild mit Alt-Text vorliegt.
- Ein zusätzlicher, nicht durch WP04 geänderter Raumplaner-Smoke-Test (`Raumplaner behält Türen und Hindernisse beim Ansichtswechsel`) scheiterte: Die bestehende Statusleiste fing den Testklick bei `y=360` ab. 2D-/3D-Zustand und fünf Persistenzprüfungen bestanden. Der fremde Test wurde im engen WP04-Scope nicht angepasst.
- CSP bleibt bewusst Report-only. Ein Wechsel auf erzwingende `Content-Security-Policy` ist Folgearbeit nach Browser-/Edge-Auswertung, keine ungeprüfte Release-Änderung.

## Projektzustand

- **TypeScript:** `tsc --noEmit` bestanden.
- **ESLint:** gezielt für alle in WP04 geänderten Code- und Testdateien bestanden.
- **Diff-Prüfung:** `git diff --check` bestanden.
- **Production Build:** `next build` bestanden; 74 statische Seiten erzeugt. Nur bestehende Hinweise auf veraltete Browser-Metadaten, kein Buildfehler.
- **Relevante Tests:** 31/31 bestanden (`knowledge-integration`, `wp04-p1-fixes`, `p0-release-blockers`, `commerce`). Weitere 5/5 Persistenztests bestanden. Zusätzliche Raumplaner-Smokes: 2 bestanden, 1 nicht bestanden aus dem oben dokumentierten Pointer-Interception-Grund.
- **Regressionsstatus:** Keine neue WP04-Regression in Shop-Navigation, Produktdarstellung, Veröffentlichungsschutz, Knowledge-Funktionen, 2D-/3D-Zustand oder Planpersistenz bekannt. Kontakt-/Angebotslogik sowie die bestehenden SEO-/Accessibility-Korrekturen wurden nicht verändert.

## Empfehlung für WP05

Nach WP04 bleiben insgesamt **sechs P1-Befunde nicht vollständig release-geschlossen**:

- **P1-006:** CSP-Reports und reale Hosting-/TLS-Header gemeinsam prüfen; danach CSP kontrolliert erzwingen.
- **P1-005 und P1-011:** als Betriebs-/Infrastrukturpaket bearbeiten, sobald Staging-SMTP, Zielplattform, vertrauenswürdige Proxy-IP und verteiltes Rate-Limit feststehen.
- **P1-001 und P1-010:** gemeinsam als fachjuristisches/Inhaltsfreigabe-Paket behandeln; Zielmodell sowie Rechte-/Einwilligungsmatrix werden extern benötigt.
- **P1-007:** den bereits implementierten ARIA-Fix mit Axe und assistiver Technologie release-seitig abschließen.

P1-002, P1-003 und P1-004 sind geschlossen. Es wurden keine Commits, Pushes, Deployments oder Produktivdatenänderungen durchgeführt.
