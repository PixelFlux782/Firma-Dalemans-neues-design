# 01 – Executive Summary

**Auditdatum:** 23.10.2026  
**Prüfobjekt:** lokales Repository und lokaler Next.js-Production-Build  
**Entscheidung:** **NO-GO**

Die Website darf in ihrem aktuellen Stand nicht öffentlich freigegeben werden. Drei voneinander unabhängige Blocker reichen jeweils für ein NO-GO:

1. Der produktiv eingebundene Gleiter-Finder und mehrere Gleiter-Produkte verwenden ausdrücklich simulierte Development-Daten, `DEV-*`-Artikelnummern, erfundene Passbereiche, Preise und Bestände. Die Development-Kennzeichnung wird in Production ausgeblendet; die Varianten bleiben auswählbar und technisch warenkorbfähig.
2. `npm audit --omit=dev` weist vier produktive Vulnerability-Gruppen aus: eine kritisch (Next.js 15.5.22, einschließlich gemeldeter RCE-Pfade) und drei hoch (Nodemailer 9.0.3, Sharp 0.35.3, transitives `source-map-js` 1.2.1).
3. Die veröffentlichte Datenschutzerklärung ist sachlich nicht auf diese Anwendung zugeschnitten. Sie behauptet Google Analytics/AdWords, Wordfence und iThemes, obwohl im Browseraudit keine externen Requests auftraten; gleichzeitig fehlen die tatsächlich vorhandenen Formular-/SMTP- und Raumplaner-/Local-Storage-Verarbeitungen. Sie enthält zudem eine unprofessionelle Einleitung und eine abweichende Telefonnummer. AGB und B2C-/B2B-Kommunikation benötigen ebenfalls eine fachjuristische Freigabe.

Weitere bestätigte P1-Probleme sind sichtbare Entwicklungsreste („Website in Entwicklung“, „Bild folgt“), nicht funktionierende Wissens-Popover mit 404-Konsole, fehlende Production-Security-Header, nicht konfigurierte lokale Mailzustellung (Kontakt-API 503), Accessibility-Verstöße im Raumplaner, ein fehlendes H1 und fehlender Sitemap-Eintrag des Raumplaners, zu kleine Touch-Ziele sowie ein 52 px über den 1440×900-Viewport hinausragender Planner-Arbeitsbereich.

Positiv: Der serielle Production-Build, TypeScript und ESLint bestehen. 11 Node-Tests bestehen. Von 436 Tests bestanden im ersten Gesamtlauf 367; 69 Browserfehler wurden durch einen nicht belastbar wiederverwendeten Server verfälscht. Mit einem unabhängig gestarteten Production-Server bestanden 72/86 gezielt wiederholte Tests; 14 echte Fehler blieben. Weitere 36 zuvor kaskadierte Shop-/Stuhl-/Bildtests bestanden anschließend vollständig. Navigation, Warenkorb-Persistenz, zentrale Stuhlkonfiguration, Suche im Browser sowie die kritischen Raumplaner-Manipulationen (Auswahl, Verschieben, Drehen, Duplizieren, Undo/Redo, 2D/3D) funktionierten in dieser kontrollierten Wiederholung.

## Bereichsbewertung

| Bereich | Ergebnis | Begründung |
|---|---|---|
| Inhalte und Texte | NO-GO | sichtbare Entwicklungsstatus-Texte; Datenschutz/AGB nicht releasefähig |
| Bilder und Medien | Conditional | 406 Dateien technisch lesbar, aber 497,4 MiB öffentlich, 308 nicht exakt referenziert, Rechte/Personenfreigaben offen |
| Navigation und UX | überwiegend bestanden | Desktop/Mobil/Tastaturtests bestanden; Wissens-Popover und Touch-Ziele fehlerhaft |
| Shop und Commerce | NO-GO | Inquiry-Modus klar, aber Finder verkauft Development-Daten als reale Auswahl |
| Raumplaner | Conditional/NO-GO für öffentliche Freigabe | Kernmanipulationen bestanden; Accessibility, H1, Viewport-Höhe und Übergabetest offen |
| Mobile Nutzung | Conditional | kein horizontaler Overflow auf priorisierten Routen; 36-px-Touch-Ziele und offene manuelle Zoomprüfung |
| Performance | Conditional | lokale Warm-Cache-Werte ordentlich; kein Lighthouse verfügbar, 497,4 MiB öffentlicher Medienbestand |
| SEO | vor Release beheben | Canonicals/Metadaten meist vorhanden; Raumplaner ohne H1 und nicht in Sitemap |
| Accessibility | vor Release beheben | Axe: schwerwiegende unzulässige ARIA-Attribute im Raumplaner; Touch-Ziele; manuelle Screenreaderprüfung offen |
| Sicherheit | NO-GO | kritische/hohe Dependency-Advisories und keine Security-Header |
| Datenschutz/Recht | NO-GO | Datenschutzerklärung widerspricht der tatsächlichen Implementierung; AGB/B2C-Risiko |
| Technische Stabilität | Conditional | Build/TS/Lint grün; 14 gezielt reproduzierte Testfehler |

## Fünf größte Release-Risiken

1. Simulierte Gleiter-Kompatibilitäten, Preise und Bestände können zu Fehlanfragen oder ungeeigneten Produkten führen.
2. Kritische bekannte Next.js-Sicherheitslücken und weitere hohe Dependency-Befunde.
3. Falsche/unvollständige Datenschutzerklärung sowie ungeprüfte AGB bei sichtbarer Privatkunden-Preisdarstellung.
4. Sichtbare Entwicklungsreste und unfertige Produkt-/Wissensfunktionen beschädigen Vertrauen und Conversion.
5. Raumplaner wird als Kernprodukt öffentlich angeboten, hat aber Accessibility-/SEO-/Viewport-Probleme und noch keine vollständige menschliche Freigabe großer realer Pläne.

## Zwingend vor Veröffentlichung

- Finder und alle Development-Produkte durch verifizierte Daten ersetzen oder vollständig verbergen/deaktivieren.
- Betroffene Dependencies auf gepatchte Versionen bringen und Audit erneut ausführen.
- Datenschutz, Impressum/Anbieterstatus und AGB durch fachkundige Stelle auf die reale Next.js-/Vercel-/SMTP-/Local-Storage-Anwendung und das tatsächliche B2B/B2C-Modell abstimmen.
- Entwicklungsstatus, „Bild folgt“, nicht funktionierende Wissens-Popover und 404-Requests entfernen/beheben.
- Mailkonfiguration in einer sicheren Staging-Umgebung mit Testempfänger validieren.
- Security-Header, Raumplaner-H1/Sitemap, ARIA-Fehler, Touch-Ziele und Planner-Viewport beheben.
- Alle P0/P1-Funde aus dem Issue Register schließen und die komplette Suite mit stabil verwaltetem Production-Server erneut grün ausführen.

## Bewusst verborgen/deaktiviert lassen

- `/produkte/gleiter-finder` und alle aus `development-fixtures.ts` erzeugten Produkte.
- Sonderposten-Seite, solange nur Vorschau-/Beispielware existiert, sofern die bewusste Vorschaukommunikation nicht ausdrücklich freigegeben ist.
- Raumplaner für die breite Öffentlichkeit, bis Accessibility, Viewport und fachliche Warn-/Ausgabeprüfung abgenommen sind; alternativ klar als Beta ohne Angebots-/Shopübergabe.
- Online-Formulare, bis Staging-Mailversand, Datenschutztext, Rate-Limit und Empfänger bestätigt sind.

## Nach Release möglich

- weitere Bildkonvertierung und Asset-Aufräumarbeiten, sofern nicht rechte-/datenschutzrelevant;
- kleinere Text-/Dateinamenbereinigung;
- Komfortverbesserungen und zusätzliche Planner-Onboarding-Politur;
- weitergehende Bundle- und Feldperformance-Optimierung nach realen RUM-Daten.

## Erforderliche menschliche Freigaben

- juristische Prüfung Datenschutz/Impressum/AGB und B2B/B2C-Prozess;
- Bildrechte, Personen- und Kundenraumfreigaben, KI-/Stockquellen;
- fachliche Freigabe aller Maße, Kompatibilitäten, Preise, Lieferzeiten und Brandschutz-/Sicherheitsaussagen;
- Screenreader-, 200-%-Zoom-, Firefox- und WebKit-Test;
- reale Staging-E-Mailzustellung ohne produktive Empfänger;
- Planner-Plausibilitätsprüfung durch fachkundige Person an großen realen Plänen.

## Priorisierte Behebung

1. Öffentliches Development-Commerce deaktivieren.
2. Security-Updates und Hardening.
3. Recht/Datenschutz/Impressum/AGB fachlich neu freigeben.
4. sichtbare Entwicklungsreste und Kernfunktionsfehler.
5. Raumplaner Accessibility/SEO/Viewport/Übergabe.
6. Mail-Stagingtest und Abuse-Schutz.
7. Medienrechte und Assetbereinigung.
8. kompletter Cross-Browser-/Accessibility-/Performance-Re-Test.

**Endgültige Empfehlung: NO-GO.** Eine Freigabe ist erst vertretbar, wenn sämtliche P0/P1-Befunde geschlossen und die kritischen Abläufe erneut automatisiert und menschlich bestätigt wurden.
