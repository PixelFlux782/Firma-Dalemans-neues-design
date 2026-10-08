# WP17 – Raumplaner UX 2.0

## Bestandsaufnahme

Der aktive Planer ist `RoomEditor2D` mit gemeinsamem `RoomPlan` für 2D und 3D. Vorhanden und weiterverwendet werden Polygonkontur, Wandmaßbearbeitung, Türen und Ausgänge, Hindernisse, Bühnen, Sperrflächen, Gänge, Front, manuelle Tische und Stühle, automatische Reihenbestuhlung, Planvarianten, Tisch-Presets, Kollisionsprüfung, Rettungsweganalyse, Regelprofile, Objektbearbeitung, Undo/Redo, lokales Speichern, JSON-Import/-Export und Planausgabe.

Unmittelbar nötig sind Raumkontur, Anordnungsart, Möbelmodell, Optimierungsziel und Berechnungsaktion. Maße, Abstände, Rotation, Block- und Gruppenparameter bleiben erhalten und sind als erweiterte bzw. kontextbezogene Einstellungen erreichbar.

## Neue Benutzerführung

Die Oberfläche führt sichtbar durch **1 Raum**, **2 Einrichtung**, **3 Ergebnis**. Die Zeichenfläche bleibt dominant. Eine kompakte linke Hilfe erklärt den aktuellen Schritt; die vorhandene Icon-Werkzeugleiste bleibt vollständig nutzbar. Die primäre Aktion heißt **Automatisch planen**.

Die rechte Ergebnisbox bleibt am Anfang der Ergebnisleiste sichtbar und zeigt ausschließlich Werte aus dem aktuellen `RoomPlan`:

- Sitzplätze = gespeicherte Reihenplätze plus tatsächlich platzierte Tischstühle
- Tische = tatsächlich platzierte Tischinstanzen
- Prüfstatus = Ergebnis der aktiven Geometrie-, Objekt-, Tisch- und Regelprüfung

Geometrisch platzierte und regelgeprüfte Kapazität werden ausdrücklich unterschieden. Bei offenen oder fehlerhaften Prüfungen wird keine freigegebene Kapazität behauptet.

## Vereinfachte Komponenten

- Tisch-Presets sind in einer kompakten Auswahl statt als dauerhaftes Raster verfügbar.
- Tischplanung zeigt Anordnung, Modell, Optimierungsziel und **Tische berechnen**; Anzahl, Abstand, Rotation und Stuhlbelegung liegen unter **Erweitert**.
- Bestuhlung zeigt Anordnungsart, Stuhlmodell, Variante, reales Optimierungsprofil und **Bestuhlung berechnen**; Maße, Reihenabstand, Reihenlimit und Ausrichtung sind als **Erweitert** gruppiert.
- Die ausführliche Regelprüfung wurde durch einen farbigen Status ersetzt. Details öffnen per Klick und bei Fehlern automatisch.
- **Anpassen**, **Details** und **Plan ausgeben** stehen direkt an den Kennzahlen.

## Erhaltene und veränderte Funktionen

Alle bisherigen Planungs-, Editier-, Projekt- und Ausgabeaktionen bleiben erhalten. Datenmodell und Algorithmen wurden nicht ersetzt. Verändert wurden nur Informationshierarchie, Gruppierung und Einstiegspunkte. Zusätzlich behält die Projektnormalisierung gespeicherte Planungszonen nun korrekt bei.

Das Optimierungsziel der Bestuhlung verwendet die bereits vorhandenen Profile **Kapazität**, **Ausgewogen** und **Komfort**. Für die Tischplanung wird nur das tatsächlich unterstützte Ziel **vollständig und kollisionsfrei** angeboten; es werden keine nicht unterstützten Modi vorgetäuscht.

## Regelprüfung und Zuverlässigkeit

Die vorhandenen Prüfungen kontrollieren Raumkontur, Objektbezüge, Möbel innerhalb des Raums, Tisch-/Stuhl-/Hindernis-/Gang-Kollisionen, Reihen- und Gangparameter, erreichbare Ausgänge, Ausgangslasten und modellierte Lauflängen. Betroffene Objekte und Sitze können weiterhin aus dem Prüfergebnis im Plan hervorgehoben werden. Der Hinweis, dass die technische Prüfung keine behördliche, brandschutztechnische oder fachplanerische Freigabe ersetzt, bleibt sichtbar.

2D und 3D lesen denselben Planungszustand. Manuelle Änderungen werden als normale Planobjekte gespeichert und durch die vorhandene History sowie Projektserialisierung erhalten.

## Tests

Ergänzt wurden UI-Tests für die Drei-Schritt-Führung, die Ergebniskennzahlen, die kompakten Planungsfelder, 1440 × 900 sowie die gemeinsame Tischzahl in 2D und 3D. Die bereits vorhandene Suite deckt Rechteck-/Polygonräume, Hindernisse, Türen/Ausgänge, Bestuhlung, Tischplanung, Kombinationen, kleine Räume, manuelle Änderungen, Regeln, History, Projekte, Ausgabe und 2D/3D ab.

## Einschränkungen

- Eine automatische Prüfung ersetzt keine Genehmigung oder fachliche Freigabe.
- Ein Regelstatus ist nur so belastbar wie das ausgewählte Profil und die vollständig modellierten Ausgänge, Gänge und Hindernisse.
- Tischplanung optimiert die vollständige, kollisionsfreie Anordnung; weitere Optimierungsziele werden erst angeboten, wenn dafür ein belastbarer Algorithmus vorhanden ist.
- Die vorhandene Desktop-Arbeitsfläche liegt bei 1440 × 900 vollständig im Viewport; umfangreiche Detailbearbeitung nutzt weiterhin gezielt die rechte interne Scrollspalte.
