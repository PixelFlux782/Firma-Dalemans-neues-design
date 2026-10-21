# Preislisten-Abgleich 21.10.2026

Quelle: `preisliste161026.ods`, aktuelles Tabellenblatt `DALEMANS - Preisliste_09-2026`. Die fünf weiteren Blätter wurden geprüft; Archiv- und Kalkulationsblätter werden nicht als gleichrangige Verkaufspreisquelle verwendet.

## Ergebnis

- 85 aktuelle Artikelzeilen, 82 eindeutige Artikelnummern (drei Artikelnummern kommen als Aufpreis und Ersatzteil erneut vor).
- 80 Artikelnummern im Website-Datenbestand gefunden.
- 21 Website-Produkte enthalten mindestens eine eindeutig zugeordnete Preislistenposition; zusätzliche Aufpreise sind als Konfigurationsoptionen zugeordnet.
- 58 bereits vorhandene, intern genauer gespeicherte Tisch-Staffelwerte wurden auf die in der verbindlichen Liste ausgewiesenen Centbeträge gesetzt.
- 63 artikelbezogene Mengenstaffeln sind fachlich belegt: 32 Stuhlvarianten, 30 Tischvarianten und die Buchablage. Im Website-Datenmodell entstehen daraus 95 Varianten-Staffelsätze, weil Stühle mit/ohne Reihenverbinder getrennt konfigurierbar sind.
- Staffelgrenzen: Stapelstühle und Buchablage 1–99 / 100–249 / ab 250 Stück; Tische 1–14 / 15–20 / ab 21 Stück.

## Nicht zugeordnet und Konflikte

- `A1021SB` – Schraubensatz: noch kein eigenes Website-Produkt.
- `AERFUCCO` – Erfurt (c): in der aktuellen Liste ohne numerischen Preis (`-`) und damit nicht als kaufbare Variante übernommen.
- `A1021FG`, `A1021TG` und `A1021BEI` stehen mehrfach mit unterschiedlichem Kontext in der Liste. Die identischen beziehungsweise ausdrücklich als `a.A.` geführten Verwendungen wurden nicht zu erfundenen Staffelpreisen zusammengeführt.
- `Export_Flo` enthält bei den Buche-Tischzeilen sichtbar verschobene Bezeichnungen. Die Zuordnung folgt deshalb dem aktuellen Hauptblatt und dessen Artikelnummern, nicht der verschobenen Exportzeile.

## Commerce-Backend

Aktiv ist ausschließlich der lokale Commerce-Provider (`COMMERCE_PROVIDER=local`). `COMMERCE_PROVIDER=shopify` ist im Code nur reserviert und wirft absichtlich einen Fehler; eine externe Preissynchronisierung hat nicht stattgefunden. Vor einer späteren Shopify-Aktivierung müssen Netto-Basispreise, Staffelgrenzen und Artikelnummern aus dieser ODS als führende Daten importiert und widersprechende Shopify-Preise gesperrt oder überschrieben werden. Empfohlener Freigabeablauf: Dry-Run nach Artikelnummer, Konfliktbericht, fachliche Freigabe, erst danach externer Schreiblauf.

## Verifikation

- Produktionsbuild erfolgreich.
- Automatisierte Grenztests decken 14/15/20/21 Stück für Tische und 99/100/249/250 Stück für Stühle und Buchablage ab.
- Produktseite, aktive Staffel, Warenkorb-Neuberechnung sowie Netto-/Brutto-Darstellung werden automatisiert geprüft.
