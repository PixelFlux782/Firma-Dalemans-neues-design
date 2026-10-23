# 08 – Release-Entscheidung

## Entscheidung

**NO-GO – keine öffentliche Freigabe in diesem Stand.**

Die GO-Kriterien verlangen keine offenen P0/P1-Befunde und erfolgreich abgeschlossene kritische Prüfungen. Beides ist nicht erfüllt: Es bestehen drei P0-Gruppen und mehrere P1-Befunde; Cross-Browser, rechtliche Freigabe, echte Staging-Mailzustellung, Screenreader/Zoom und vollständige Feldperformance sind offen.

## Freigabekriterien für den nächsten Entscheid

- keine simulierten/Development-Produktdaten öffentlich erreichbar;
- `npm audit --omit=dev` ohne kritische/hohe produktive Befunde oder dokumentierte, fachlich akzeptierte Ausnahme;
- rechtlich freigegebene, implementierungsgetreue Datenschutz-/Impressum-/AGB-Texte;
- alle P0/P1-Issues geschlossen;
- Production-Build, TypeScript, Lint und komplette Playwright-Suite stabil grün;
- SMTP ausschließlich in Staging mit Testempfänger erfolgreich, Fehlerfall ebenfalls geprüft;
- Raumplaner H1/Sitemap/ARIA/Viewport korrigiert und fachlich abgenommen;
- Bild-/Personen-/Kundenraumrechte dokumentiert;
- Chromium, Firefox, WebKit, 200-%-Zoom und Screenreader-Stichprobe abgeschlossen;
- endgültige Domain/Canonical/robots/Sitemap und Hosting-Header verifiziert.

## Restrisiko nach denkbarer Korrektur

Ein Conditional GO wäre erst vertretbar, wenn nur klar abgegrenzte P2/P3-Themen verbleiben, etwa weitere Medienkompression, Komfortverbesserungen oder nicht kritische Suchranking-Feinheiten. Der aktuelle Stand liegt deutlich darunter.

## Verantwortliche Freigaben

- Geschäftsführung: Inhalte, Preise, Verfügbarkeiten, Unternehmensangaben.
- Fachabteilung/Produktverantwortung: Gleiterkompatibilität, Varianten, Maße, Planner-Regeln.
- Datenschutz/Jurist: Datenschutz, Impressum, AGB, B2B/B2C.
- IT/Release: Dependencies, Header, SMTP, Domain, Monitoring/Backup.
- QA/Accessibility: Cross-Browser, Screenreader, Zoom, reale Geräte.

Nach Abschluss dieser Punkte ist ein vollständiger Re-Audit erforderlich; eine bloße Sichtprüfung einzelner Fixes genügt nicht.
