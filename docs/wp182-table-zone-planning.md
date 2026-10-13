# WP18.2 Tischbereichsplanung

## Datenfluss

`RoomPlan` bleibt die einzige persistierte Planungsquelle. Varianten leben nur während eines Aufrufs von `planTableZone`. Übernommen werden ausschließlich vorhandene Objekttypen:

- `TableInstance`
- `FurnitureChair`
- `TableGroup`

`autoLayout`, `autoGoal` und `fillClearance` sind kleine Herkunftsangaben am normalen Tischobjekt. Sie dienen nur der idempotenten Wiederholung und bilden keine Verbindungs- oder Varianten-Engine.

## Begrenzte Suche

Die Suche ist deterministisch und hart begrenzt:

- Einzeltische: zwei Orientierungen mit je drei Rasterphasen, also höchstens sechs Kandidaten.
- Lange Tafeln, L-Form und U-Form: zwei Orientierungen, also höchstens zwei Kandidaten.
- Höchstens 240 Tische je Geometriekandidat.
- Keine vollständige Regel- oder Rettungsweganalyse in der Kandidatenschleife.
- Keine persistierten Varianten und keine zweite Worker-Architektur.

Die UI gibt vor dem Aufruf mit `setTimeout(0)` an den Browser zurück. Die gemessene Laufzeit wird im Ergebnis und im Nutzerhinweis ausgegeben.

## Geometrie und Bewertung

Tischpolygone, Trapezorientierung und Tischkanten kommen aus `tables.ts`. Tafeln docken über dieselben physischen Endkanten an, die WP18.1 für das Snapping bereitstellt. Die Stuhlplanung läuft gegen die vollständige Kandidatenanordnung; dadurch entfallen Stühle an Kontaktkanten sowie kollidierende Plätze.

Die drei Ziele verwenden unterschiedliche Mindestabstände und Gewichtungen:

- `capacity`: 0,35 m zusätzlicher Gruppenabstand, Sitzplätze dominieren die Bewertung.
- `balanced`: 0,65 m, Sitzplätze und Bewegungsfläche werden gemeinsam bewertet.
- `comfort`: 1,05 m, Bewegungsfläche und Kollisionsfreiheit werden stärker gewichtet.

Nur tatsächlich erzeugte Stuhlobjekte zählen zur Kapazität. Tischplatz-Rettungswege sind mit der vorhandenen Engine nicht zuverlässig einzeln nachweisbar und werden deshalb ausdrücklich als ungeprüft ausgewiesen; es wird keine behördliche Freigabe behauptet.
