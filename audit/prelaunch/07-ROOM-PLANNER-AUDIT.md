# 07 – Raumplaner-Audit

## Gesamturteil

Der Raumplaner ist technisch weit entwickelt und kein bloßer Mock. Die zentralen früheren Problemklassen wurden in der stabilen seriellen Wiederholung erfolgreich automatisiert geprüft: Rahmen-/Shift-Auswahl, Mehrfachbewegung, unabhängiges Duplizieren, Gruppenrotation, Zoom-unabhängige Auswahl, Escape-Abbruch, automatische Tischanordnung, Undo/Redo und 2D/3D-Konsistenz. Trotzdem ist die öffentliche Freigabe wegen P1-Accessibility/Viewport/SEO und offener fachlicher Abnahme noch nicht vertretbar.

## Automatisiert bestanden

- rechteckige/konkave Räume, Wände, Maßänderung, Snapping und ungültige Polygone;
- Türen, Notausgänge, Hindernisse, Gänge, Sperrflächen, Front/Bühne;
- automatische und manuelle Reihenbestuhlung, Tischbereiche, L-/U-/Trapez-Anordnungen;
- Auswahl, Rahmen-/Mehrfachauswahl, Verschieben, Drehen, Duplizieren, Löschen;
- Kollisionen, Werkzeugwechsel ohne Freeze, unterschiedliche Zoomstufen;
- Autosave, mehrere Projekte, Speichern unter, Umbenennen, Duplizieren, JSON-Import/-Export, Reload;
- 2D/3D-Wechsel, lokales GLB-Laden und Fallback bei Modellfehler;
- Plan-/Druckansicht und Rückkehr in editierbaren Zustand;
- Bedarf, Reserve und Angebots-/Produktlink;
- 100+ Möbel und große Sitzmengen innerhalb der Testbudgets;
- Hilfe/Onboarding inklusive mobil und `prefers-reduced-motion`.

## Offene/bestätigte Probleme

1. **P1:** Bei 1440×900 endet der Editor bei y=952; Ergebnis/Aktion liegen damit nicht vollständig im Zielviewport. Zwei Tests reproduzieren dies.
2. **P1:** Axe meldet schwerwiegende unzulässige ARIA-Attribute an 5–6 Planner-/SVG-Nodes.
3. **P1:** `/raumplaner` besitzt kein H1 und fehlt in der XML-Sitemap.
4. **P2:** Zwei Logiktests erwarten, dass die Shopübergabe nicht direkt warenkorbfähig ist; tatsächlich ist `canAddToCart=true`. Bei globalem Inquiry-Modus kann das ein veralteter Test sein, aber Spezifikation, Buttontext und tatsächliche Wirkung müssen vereinheitlicht werden.
5. **P1:** Öffentliche Angebotsübergabe hängt von nicht validierter Mailkonfiguration/Datenschutztext ab.
6. **Manuell offen:** PDF-/Drucklayout auf echtem Drucker/PDF-Viewer, 200-%-Zoom, Screenreader, Firefox/WebKit, Touch-Stift, sehr lange Bearbeitungssitzung und Low-End-GPU.

## Plausibilität/Sicherheit

Die Wissens-/Plannertexte weisen darauf hin, dass der Planer Orientierung bietet und keine genehmigte Fachplanung, baurechtliche Prüfung oder Sicherheitsfreigabe ersetzt. Das ist angemessen. Stückzahlen werden aus realen Planobjekten berechnet und durch zahlreiche Unit-/Browsertests abgesichert.

Vor Release muss eine fachkundige Person dennoch reale Musterpläne gegen genehmigte Bestuhlungspläne prüfen: Fluchtwegbreiten, Türrollen, Kapazitäten, Tisch-/Stuhlabmessungen, Warntexte und Druckausgabe. Automatisierte Geometrieprüfungen sind keine baurechtliche Freigabe.

## Empfehlung

Bis zur Schließung der P1-Punkte entweder nicht öffentlich verlinken oder klar als Beta ohne Shop-/Angebotsübergabe betreiben. Nach Korrektur: vollständige Planner-Suite mit eigenem Production-Server, Axe, drei Browser-Engines und fachlicher Stichprobe erneut ausführen.
