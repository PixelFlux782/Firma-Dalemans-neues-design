# 03 – Content-Audit

## Nachgewiesene Entwicklungsreste

| Priorität | Route | Inhalt | Quelle | Bewertung |
|---|---|---|---|---|
| P1 | `/` | „Website in Entwicklung · Inhalte werden laufend ergänzt“ | `src/components/home/DevelopmentNotice.tsx:8`, eingebunden in `src/app/page.tsx` | im Browser sichtbar; vor Release entfernen |
| P1 | `/produkte` | „Bild folgt“ bei Klappstühlen | `src/app/produkte/page.tsx:75` | im Browser sichtbar; optisch fertige Seite enthält unfertige Kachel |
| P0 | Finder/Gleiter-Produkte | simulierte Finder-Ausführungen, `DEV-*`, Development-Preise/-Bestände | `src/lib/commerce/providers/local-data.ts:16,116-190`, `src/lib/finder/development-fixtures.ts` | produktiv erreichbar; Development-Badge wird nur in Development gerendert |
| P1 | `/datenschutz` | „Sorry, die EU will das so …“ | `src/lib/legal-content.ts:3` | unprofessionell und für Rechtstext ungeeignet |
| P1 | `/sonderposten` | ausschließlich Vorschau, keine aktiven Angebote | `src/app/sonderposten/page.tsx`, `src/lib/special-offers.ts` | transparent formuliert, aber öffentlich wenig conversion-tauglich; Verbergen erwägen |

## Redaktionelle Konsistenz

- Gründung 1994 durch Hubert Dalemans und heutige Führung durch Stefan Dalemans sind konsistent umgesetzt.
- Schwerpunkt Stapelstühle, Klapptische, Gemeinden/Kirchen und flexible Räume ist konsistent; keine systematische Outdoor-/Gastronomie-Fehlpositionierung gefunden.
- Eigene Werkstatt, Konstruktion und Partnerfertigung werden überwiegend differenziert beschrieben; keine pauschale Behauptung gefunden, sämtliche Produkte seien vollständig eigengefertigt.
- „1.000+ Räume“ und „rund 90 % Kunden aus dem freikirchlichen Umfeld“ sind in den gelieferten Marken-/Firmenunterlagen belegt. Vor Veröffentlichung sollte die aktuelle Freigabe der Zahlen dennoch dokumentiert werden.
- Tonalität ist überwiegend ruhig, beratend und in der Sie-Ansprache. Der Datenschutztext fällt stilistisch und inhaltlich deutlich heraus.
- Brandschutz-, Lebensdauer- und Planertexte enthalten im Wissensbereich überwiegend angemessene Einschränkungen. Die konkreten Stoffdaten mit B1/EN-1021-Angaben bleiben gemäß interner Dokumentation produkt-/variantenbezogen nachweispflichtig.

## Rechtstexte/Anbieterinformationen

- Datenschutzerklärung nennt nicht die tatsächlich vorhandenen Online-Formulare, SMTP-Verarbeitung, Warenkorb- und Raumplaner-Local-Storage-Daten.
- Sie behauptet Google Analytics, Google AdWords, Wordfence und iThemes. Im lokalen Browseraudit wurden keine externen Requests festgestellt; im Quellcode ist nur ein consent-neutraler, noch adapterloser Analytics-Handoff vorhanden.
- Telefonnummer in der Datenschutzerklärung (`+49 170 5555 33 1`) weicht von der primären Website-Telefonnummer (`+49 9342 9153-53`) ab. Das Impressum nennt beide Nummern; Verantwortlichkeit/Rechtsform sind fachlich zu bestätigen.
- AGB enthalten alte und teils weitreichende Klauseln (u. a. Preisänderung nach Vertragsschluss, 1 % Verzugszins pro Monat, sehr kurze Mängelanzeige, Haftungs-/Gerichtsstandklauseln). Wegen der sichtbaren Privatkunden-Bruttopreisumschaltung ist eine juristische Prüfung des Verbraucherbezugs zwingend; dieses Audit erteilt keine Rechtsfreigabe.
- Anfrageprozess sagt klar, dass keine Bestellung/Zahlung ausgelöst wird. Ein echter Checkout ist daher nicht geschuldet; der Begriff „Shop“ und die Netto-/Brutto-Umschaltung können dennoch Erwartungen an B2C-Verkauf erzeugen.

## Redaktionell manuell freizugeben

- sämtliche Preis-, Lieferzeit- und Verfügbarkeitsaussagen;
- Modellkompatibilitäten, Gleitermaße, B1/EN-1021/GS-Angaben;
- Unternehmenszahlen 1.000+/90 % und alle Personen-/Funktionsbezeichnungen;
- Sonderposten-Vorschau und deren Indexierung;
- vollständiger Datenschutz-/AGB-/Impressumstext.
