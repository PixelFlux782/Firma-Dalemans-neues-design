# DLMNS · WISSEN-WP03 — Praxiswissen, Kaufberatung & Inhaltsdaten

**Modellansage:** `gpt-5.6-sol`, wenn verfügbar; andernfalls das günstigste ausreichend leistungsfähige Codex-Modell. Reasoning **mittel**. Nutze vorhandene Komponenten. Keine neue Runtime-KI, kein CMS, keine großen UI-Refactors.

## Kontext / Vorbedingungen

Du arbeitest **lokal im bestehenden DLMNS-Next.js-Website-Projekt** auf dem Stand nach WP01/WP02. Die Projektpfade im Prompt sind **Beispiele**, keine Tatsachenbehauptungen. Erkunde zuerst gezielt die bestehenden `/wissen`-Routen, Content-Quelle, Navigation, CTAs, SEO und Tests. Lies die Begleitdateien **relativ zum Ordner dieses Prompts**:

- `02_DALEMANS_FACHWISSEN_QUELLE.md` (neue originale Firmenangaben)
- `03_REDAKTION_FREIGABEN.md` (verbindliche Publikationsgrenzen)
- `04_WEBTEXTE_ENTWUERFE.md` (sprachliche Vorlagen, keine Pflicht zur wörtlichen Übernahme)
- `05_OFFENE_BELEGE_UND_DATEN.md` (offene Fachunterlagen)
- `facts/dalemans-wissen-2026-10-09.json` (maschinenlesbare Arbeitsquelle)

Alte Firmenwebsite als Sekundärquelle: `https://stapelstuhl-klapptisch.de/services-informationen-stapelstuhl-kirchenstuhl-klapptisch/`. Alte Inhalte sind *nicht* automatisch aktuelle Prüfwerte oder verbindliche Vorschriften. Dort genannte HPL-, Gestell- und 2:1-Erläuterungen dürfen sinngemäß verwendet werden, sofern mit den neuen Firmenangaben vereinbar. Hersteller- bzw. Zulieferernamen sollen **nicht** in Besuchertexten erscheinen. Interne Provenienz erhalten.

## Ziel

Erweitere den bereits aufgebauten Wissensbereich um das reale Beratungswissen von Dalemans. **Bevorzugt Wissen zeigen, das Kunden bei einer Entscheidung hilft**, statt einen langen austauschbaren Blog zu erzeugen. Halte Dalemans-Tonalität: ruhig, sachlich, warm, präzise, persönlich und ohne unbelegte Garantien. Nutze kurze Abschnitte, klare Illustrationen aus HTML/CSS/SVG wo vorhanden; keine neuen Stockbilder nötig.

## Umfang in sinnvoller Reihenfolge

### 1) Eine wartbare Wissensquelle als Single Source of Truth

- Ergänze die **bestehende Content-Architektur**, anstatt parallel ein neues Content-System aufzubauen. Strukturierte, typisierte Daten oder leicht pflegbare Markdown-/MDX-Dateien nach Repo-Konvention.
- Trenne: `factualCompanyStatements` (Firmenauskunft), `modelSpecific` (nur mit Modellzuordnung), `recommendations` (Rat), `estimatedValues` (Näherungen), `verificationNeeded` (nicht blind als Produktspezifikation rendern), `regulatory` (externe Quellen, Stand, Geltungsbereich).
- Verwende `facts/dalemans-wissen-2026-10-09.json` als Input/Prüfliste; sie muss **nicht** als öffentlich ladbare JSON-Datei kopiert werden. Interne Quellen/Prüfpfade sollen nicht im öffentlichen Build landen.
- Vermeide duplizierte Zahlen/FAQ-Inhalte über mehrere Komponenten. Wo es sinnvoll ist, Fakten an wiederverwendbare Beiträge/FAQ-Items anbinden.

### 2) Neue Ratgeberseiten (tatsächliche Repo-Routingstruktur nutzen)

**A. `/wissen/stapelstuehle-richtig-auswaehlen`**
- Auswahl nach Raum, Nutzungsintensität, Polsterung und persönlichem Sitzempfinden.
- Ca. 51 cm ohne bzw. ca. 53 cm mit Reihenverbinder als **überlieferte Orientierungswerte**, nicht als geprüfte Breite jedes Modells; besondere Modelle können abweichen.
- Alle im heutigen Angebot gemeinten Stuhlmodelle eignen sich laut Firmenauskunft für regelmäßige Umstellungen; genaue Modellbesonderheiten nur behaupten, soweit tatsächliche Produktdaten das belegen.
- Für längeres Sitzen häufig Sitz- und Rückenpolster sinnvoll; Komfort individuell, besser Musterstuhl testen.
- Starke Nutzung: Coburg und Nürnberg aufgrund weniger stark taillierter Schalen als **Dalemans-Beratungsempfehlung**, keine Exklusivempfehlung.
- Qualitätsunterschiede anhand Schichtholz-Verleimung, Gestellverarbeitung und Oberflächen erklären; keine pauschalen Ausfallversprechen.
- Erfahrung mit langlebigen Bestuhlungen erwähnen, **keine 35-Jahre-Garantie**.
- Modell- und Shoplinks nur zu tatsächlich existierenden Routen.

**B. `/wissen/reihenverbinder-fuer-stapelstuehle`**
- Warum Dalemans Reihenverbinder **bei Reihenbestuhlung grundsätzlich empfiehlt**: einheitliches Bild, Handling beim Reinigen, bessere Lage der Reihen; mögliche rechtliche Anforderungen nur mit konkretem Geltungsbereich.
- Warum Nachrüstung oft schlechter ist als die Auswahl eines Modells/einer Variante mit passender Reihenverbindung ab Werk; vorhandenen nachrüstbaren schwarzen Clip als Option sachlich erwähnen (modellabhängige Passung erst belegen).
- Weder „Panikvorschrift“ als pauschale Normbezeichnung noch „in jeder Kirche gesetzlich vorgeschrieben“ schreiben.
- Über technische Grenzen/Risiken keine eigenen Sicherheitsfreigaben erteilen; für Veranstaltungen genehmigten Bestuhlungsplan prüfen lassen.
- Passenden Zubehör-/Beratungs-CTA, keinen erfundenen Produktlink.

**C. `/wissen/transport-lagerung-pflege`**
- Praxiswerte: Stühle bis ca. 15 pro Stapel; Tische nach Betriebsangabe ca. 15 im Stapel, auf passendem Tischtransportwagen ca. 10. Diese Zahlen **nicht als fahrbare sichere Last ohne Herstellerfreigabe** interpretieren. Tatsächliche Wagenlast, Modell und Sicherung sind gesondert zu prüfen.
- Trocken, bei normalen Innenraumtemperaturen, nicht dauerhaft direkter UV-Strahlung ausgesetzt lagern.
- Tische flach liegend lagern; nicht längere Zeit angelehnt aufbewahren (Verformungsrisiko).
- Stoffpflege: Dalemans erzielt gute Ergebnisse mit geeignetem Teppich-Trockenschaum; Herstellerpflegehinweise gelten, erst unauffällige Stelle testen, nicht durchnässen. Tische feucht, nicht nass reinigen.
- Gegenüber bloßem Neukauf Ersatzteil-/Reparaturansatz (Stuhlgleiter, Buchablagen) zeigen.

### 3) Bestehende Fachartikel gezielt anreichern

**`/wissen/klapptische-richtig-waehlen`**:
- 12 Standardgrößen aus Wissensdatei korrekt und wartbar hinterlegen; Zwischen-/Sondermaße sind laut Firma möglich, aber abhängig von Modell/Konstruktion.
- 2:1-Nutzen anschaulich erklären. Ein leichtes responsives **Diagramm** oder tabellarisches Beispiel `140×70`: zwei Breiten à 70 cm entsprechen einer Länge von 140 cm. Andere 2:1-Maße der Liste: `150×75`, `160×80`. `160×70` nicht 2:1. Das Verhältnis ist ein **Planungsvorteil**, keine bauordnungsrechtliche Regel.
- Gestelle K1/K2 für überwiegende Reihenstellung, K3/K4 bei häufiger stirnseitiger Nutzung. K1 vs K3 in Haupt-Text nennen, K2/K4 nur, wenn Bestandsartikel/Varianten dies stützen. Keinen automatisch passenden Gestelltyp in Shopify/Artikelvarianten ändern.
- Tischmodell 210 (Seminar): ohne Kantenaufdopplung, 25 mm Platte, nach Dalemans-Konstruktionsangabe auf Größe bis 140×70 cm begrenzt. **Keine abgeleitete Freigabe beliebiger Zwischenkombinationen** ohne Variantenquelle.
- Sonstige allgemeine Platte laut Auskunft 19 mm; Tischhöhe ca. 738 mm, Wunschhöhe möglich. Diese Angaben nicht blind auf jede SKU kopieren.
- Tischgewicht **ca. 23–32 kg, abhängig von Materialwahl und Größe**; keine millimetergenaue Berechnung aus Maß allein. Gefaltet: Tischlänge `<160 cm` ca. 10 cm Höhe, `≥160 cm` ca. 8 cm Höhe **laut Firmenangabe**, modellabhängig.
- Mittige Belastbarkeit „ca. 100 kg“ ist bisher **nicht belastbar belegt und darf nicht pauschal als Tragfähigkeitsangabe veröffentlicht werden**. Seitliches Verschieben unter Last **nicht empfehlen**. Stattdessen neutral sichere Nutzung nach Herstellerhinweisen.
- Freiformen/Sonderoberflächen, Kantenbeizungen und Sonderfarben als Anfrageoptionen, keine sofort verfügbare Standardvariante erfinden.

**`/wissen/tischplatten-und-kanten`**:
- HPL und Kanten nach vorhandener Seite sachlich erklären, aber keine generellen Kratz-/Chemikalien-/Hitze-/Lebensdauer-Garantien. Dekore/Produktbilder ausdrücklich als **nicht farbverbindlich** kennzeichnen, echte Muster auf Wunsch.
- Pflege „feucht, nicht nass“ und kein längeres Wand-Anlehnen richtig verlinken.
- Falls `Cloud_Wiki-Texte_zu_Stoffe_und_Kanten` tatsächlich im Repo vorhanden ist, lesen und nur daraus belegte Einzelheiten ergänzen. Fehlt es, **nicht so tun, als läge es vor**.

**`/wissen/stoffe-und-bezuege`**:
- Pflegehinweis geeignetes Textil-/Teppich-Trockenschaum-Verfahren unter Materialvorbehalt ergänzen.
- Stoffgruppen-B1-Regel: laut Dalemans ab Gruppe 3 *in der Regel* entsprechende Optionen, **keine B1-Zusage ohne Stoffzertifikat**, keinen B1-Nachweis für gesamten gepolsterten Stuhl daraus ableiten.
- WP02 Stoffkarten 2/3/4 **unberührt**, `pending`-Downloads nicht aktivieren und keine PDF/Quelle erfinden.

### 4) Wissen im Shop nutzbar machen

- Ratgeberartikel untereinander und mit real existierenden Produkt-/Zubehörseiten, vorhandener Stoffmusteranfrage und Raumplaner verknüpfen (nur echte Pfade).
- Im vorhandenen Stuhl- und Tischkontext **dezente** Wissenslinks ergänzen, sofern ohne Varianten-/Checkout-Refactor machbar.
- Auf `/wissen` nur **veröffentlichte** Beiträge aufnehmen; Teaser nicht funktionslos/leer. Keine redundanten H1/SEO-Keyword-Teppiche. FAQ-Markup nur für tatsächlich sichtbare Antworten.
- Orientierungsangaben („ca.“) sichtbar dort kennzeichnen, wo sie für Kauf-/Planungsentscheidungen relevant sind.

## Außerhalb dieses WPs / Sicherheitsgrenzen

- Kein Umbau des Raumplaner-Regelwerks, keine neuen verbindlichen Fluchtwegberechnungen. Bestehenden Raumplaner allenfalls verlinken; genehmigungspflichtige Prüfung bleibt der zuständigen Fachplanung/Behörde vorbehalten.
- Keine eigenständige rechtsverbindliche Brandschutz-, GS- oder Belastbarkeitsfreigabe; Nachweis am **konkreten Produkt/Material** ist Voraussetzung für konkrete Zertifikatssiegel, Verkaufsdaten und technische Zusicherungen.
- Keine 35-Jahre-Lebensdauergarantie, keine absolute Rost-/Schalenbruchfreiheit, keine Preise ohne aktuelle verifizierte Daten.
- Kein Anfassen von `scripts/sync-fabric-cards.mjs`, Stoffkarten-Manifest oder GitHub-Workflow; keine neuen PDFs.
- Kein verstecktes Rehosting fremder Bilder/Kataloge. Externe Herstellerquellen intern dokumentieren, auf Kundenoberflächen Firmenstil beibehalten, Urheberschaft nicht falsch darstellen.
- Keine neuen npm-Abhängigkeiten, außer unvermeidlich und begründet.

## Tests / Definition of Done

1. Content-/Routentests für neue Beiträge, SEO, Breadcrumbs und interne Verlinkung.
2. Datenlogik prüfen: zwölf Standardmaße, `140×70`, `150×75`, `160×80` exakt 2:1, `160×70` nicht; Modell 210 nicht mit größeren Standardmaßen freigeben.
3. Testfälle: Keine GS-Zusicherung ohne Zertifikatszuordnung; kein B1-Siegel allein aus Stoffgruppe; Stoffkarten weiterhin `pending` ohne Downloadlinks; keine pauschale Veröffentlichung „Traglast 100 kg“.
4. Test auf öffentliche Inhalte: keine Zulieferernamen, Ursprungslinks oder interne Manifeste/Prüfdokumente über UI/API/Static Assets exponiert; keine kaputten CTAs.
5. Responsive, Keyboard-Fokus, keine Horizontalüberläufe; mobile und Desktop kurz prüfen.
6. TypeScript, Lint, relevante Tests und Produktionsbuild. Wenn bisherige Tests / Build aus anderen Gründen fehlschlagen: Ursache transparent abgrenzen.
7. Abschluss kurz: geänderte Dateien, implementierte Routen, genaue Auswirkung auf Bestandscontent, Tests, nicht veröffentlichte/fehlende Belege. **Kein Commit, Push, Deployment.**

**Priorisierung bei Budgetdruck:** (1) Inhalt/Faktenquelle & Überarbeitung bestehender Texte → (2) Stapelstuhl- & Reihenverbinder-Ratgeber → (3) Lager/Pflege-Seite → (4) interne Links/Tests. Nicht bestehende Funktionen unnötig aufräumen.
