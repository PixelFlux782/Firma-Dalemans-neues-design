# 02 – Issue Register

**Stand:** 23.10.2026  
**Releaseentscheidung:** **NO-GO**  
**Legende Verifikation:** „Browser-verifiziert“ = am lokalen Production-Server beobachtet; „automatisiert reproduziert“ = durch Test/Tool bestätigt; „statisch geprüft“ = Code/Datei geprüft, ohne vollständigen End-to-End-Nachweis; „manuell zu prüfen“ = menschliche oder externe Freigabe erforderlich.

## DLMNS-P0-001 – Simulierte Commerce-Daten öffentlich als reale Produkte nutzbar

- **Priorität / Art:** P0 – nachgewiesener Release-Blocker
- **Prüfbereich:** Shop, Produktdaten, Gleiter-Finder
- **Betroffene Route:** `/produkte/gleiter-finder`, Gleiter-Produktseiten und Warenkorb
- **Datei / Position:** `src/lib/commerce/providers/local-data.ts` (Import und Aufbau der Development-Produkte), `src/lib/finder/development-fixtures.ts` (simulierte Datensätze), `src/components/finder/GliderFinder.tsx:223`, `src/components/product/ProductVariantSelector.tsx:258`
- **Fehlerbeschreibung:** Der standardmäßig aktive lokale Commerce-Provider erzeugt öffentlich auswählbare Produkte aus ausdrücklich simulierten Development-Fixtures. Enthalten sind `DEV-*`-SKUs, nicht freigegebene Passbereiche, feste Testpreise und behauptete Verfügbarkeit. Die Development-Kennzeichnung wird im Production-Modus ausgeblendet.
- **Reproduktion:** Production-Build starten → Gleiter-Finder öffnen → Angaben auswählen → Ergebnis/Produkt öffnen → Variante und Menge wählen → in den Warenkorb legen.
- **Erwartet:** Nur fachlich und kaufmännisch freigegebene Produkte, Kompatibilitäten, Preise und Bestände sind öffentlich auswählbar; Testdaten sind unzugänglich und klar getrennt.
- **Tatsächlich:** Simulierte Datensätze erscheinen wie reale verkaufsfähige Artikel und sind technisch warenkorbfähig.
- **Beweis:** Quellcodekommentare und `dataStatus: "development"`; Browser-/Shoptests bestätigen Erreichbarkeit und Warenkorbfunktion.
- **Empfohlene Korrektur:** Finder und alle daraus erzeugten Produkte bis zur Datenfreigabe vollständig aus Navigation, Indexierung und direktem Routing entfernen oder serverseitig sperren; anschließend echte, verantwortet freigegebene Daten anbinden und Regressionstest durchführen.
- **Aufwand:** groß
- **Verifikationsstatus:** statisch geprüft und Browser-/Testablauf verifiziert

## DLMNS-P0-002 – Kritische und hohe produktive Dependency-Sicherheitsbefunde

- **Priorität / Art:** P0 – nachgewiesener Sicherheitsblocker
- **Prüfbereich:** Security, Supply Chain
- **Betroffene Route:** gesamte Anwendung, insbesondere serverseitige Verarbeitung und Bilder
- **Datei / Position:** `package-lock.json`; installierte Versionen Next.js 15.5.22, Nodemailer 9.0.3, Sharp 0.35.3, transitiv `source-map-js` 1.2.1
- **Fehlerbeschreibung:** `npm audit --omit=dev` meldet vier produktive Vulnerability-Gruppen: eine kritisch und drei hoch. Für Next.js werden unter anderem veröffentlichte RCE-/DoS-/Cache-Advisories im installierten Versionsbereich ausgewiesen.
- **Reproduktion:** Im Repository `npm audit --omit=dev --json` ausführen.
- **Erwartet:** Keine unbehandelten kritischen oder hohen Schwachstellen in produktiv ausgelieferten Abhängigkeiten.
- **Tatsächlich:** 1 kritische und 3 hohe Gruppen.
- **Beweis:** Audit-Ausgabe vom 23.10.2026; Details in `06-TECHNICAL-SECURITY-SEO.md`.
- **Empfohlene Korrektur:** Gepatchte, kompatible Versionen ermitteln, kontrolliert aktualisieren, Build/E2E/Security-Audit vollständig wiederholen; Ausnahmen nur mit dokumentierter fachlicher Risikofreigabe.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert reproduziert

## DLMNS-P0-003 – Datenschutzerklärung widerspricht der tatsächlichen Anwendung

- **Priorität / Art:** P0 – nachgewiesener redaktionell-technischer Blocker; rechtliche Bewertung durch Fachperson erforderlich
- **Prüfbereich:** Datenschutz, Recht, Vertrauen
- **Betroffene Route:** `/datenschutz`, `/kontakt`, `/anfrage`, `/raumplaner`
- **Datei / Position:** `src/lib/legal-content.ts:3` und folgende; Formular-API-Routen; Local-Storage-Nutzung von Warenkorb und Raumplaner
- **Fehlerbeschreibung:** Die Erklärung beginnt unprofessionell mit „Sorry, die EU will das so…“, behauptet Google Analytics/AdWords, Wordfence und iThemes, obwohl der Browseraudit keine solchen Requests oder Integrationen feststellte. Gleichzeitig werden die tatsächlich implementierte Formular-/SMTP-Verarbeitung und lokale Speicherung von Warenkorb/Planerdaten nicht angemessen beschrieben. Die dortige Telefonnummer weicht von der Hauptnummer ab.
- **Reproduktion:** `/datenschutz` lesen und mit Netzwerkprotokoll, Formularrouten sowie Storage-Nutzung vergleichen.
- **Erwartet:** Sachliche, vollständige und implementierungsgetreue Datenschutzerklärung mit konsistenten Kontaktdaten.
- **Tatsächlich:** Behauptete Dienste sind technisch nicht belegt; reale Verarbeitungen fehlen oder sind unklar.
- **Beweis:** Browser-Netzwerkaudit ohne externe Requests; Codeprüfung; Screenshot `screenshots/datenschutz-1440x900.png`.
- **Empfohlene Korrektur:** Erklärung anhand der tatsächlichen Hosting-, SMTP-, Formular-, Local-Storage- und künftigen Tracking-Konfiguration fachjuristisch neu erstellen und vor Freigabe nochmals technisch abgleichen.
- **Aufwand:** mittel
- **Verifikationsstatus:** statisch und im Browser verifiziert; rechtliche Freigabe offen

## DLMNS-P1-001 – AGB und B2B-/B2C-Modell nicht belastbar freigegeben

- **Priorität / Art:** P1 – begründetes Rechts-/Geschäftsrisiko
- **Prüfbereich:** Recht, Commerce, Inhalte
- **Betroffene Route:** `/agb`, Shop, Anfrage/Warenkorb
- **Datei / Position:** `src/lib/legal-content.ts`; Preisumschaltung und Commerce-Komponenten
- **Fehlerbeschreibung:** Alte bzw. ungewöhnlich strenge Regelungen (unter anderem Preisänderung, monatliche Verzinsung, kurze Mängelanzeige) stehen einer Oberfläche gegenüber, die Privat- und Geschäftskunden sowie Brutto-/Nettopreise adressiert. Anwendbarkeit, Verbraucherinformationen, Widerruf, Versand- und Lieferinformationen sind nicht belastbar geklärt.
- **Reproduktion:** AGB lesen; Shop als Privatkunde und Geschäftskunde aufrufen; Anfrageablauf vergleichen.
- **Erwartet:** Konsistentes, rechtlich freigegebenes Geschäftsmodell und dazu passende Pflichtinformationen.
- **Tatsächlich:** Die Rollen und Pflichten bleiben widersprüchlich bzw. unvollständig.
- **Beweis:** statischer Inhalts- und UI-Abgleich.
- **Empfohlene Korrektur:** B2B/B2C-Zielmodell verbindlich festlegen und sämtliche Texte/Preisangaben/Prozesse juristisch freigeben lassen.
- **Aufwand:** groß
- **Verifikationsstatus:** statisch geprüft; fachjuristisch manuell zu prüfen

## DLMNS-P1-002 – Sichtbarer Entwicklungsstatus auf der Startseite

- **Priorität / Art:** P1 – nachgewiesener sichtbarer Entwicklungsrest
- **Prüfbereich:** Inhalte, Markenwirkung
- **Betroffene Route:** `/`
- **Datei / Position:** `src/components/DevelopmentNotice.tsx:8`, Einbindung in `src/app/page.tsx`
- **Fehlerbeschreibung:** Besucher sehen „Website in Entwicklung · Inhalte werden laufend ergänzt“.
- **Reproduktion:** Startseite im Production-Build öffnen.
- **Erwartet:** Kein interner Entwicklungsstatus auf einer öffentlich freigegebenen Unternehmenswebsite.
- **Tatsächlich:** Der Hinweis ist prominent sichtbar.
- **Beweis:** `screenshots/home-1440x900.png`, `screenshots/home-390x844.png`.
- **Empfohlene Korrektur:** Vor Release entfernen; nicht nur per CSS verbergen.
- **Aufwand:** klein
- **Verifikationsstatus:** Browser-verifiziert

## DLMNS-P1-003 – Öffentliche Produktkategorie enthält „Bild folgt“

- **Priorität / Art:** P1 – nachgewiesener unfertiger Inhalt
- **Prüfbereich:** Inhalte, Bilder, Produktdarstellung
- **Betroffene Route:** `/produkte`
- **Datei / Position:** `src/app/produkte/page.tsx:75`
- **Fehlerbeschreibung:** Die Klappstuhl-Kategorie zeigt statt eines freigegebenen Motivs den Platzhalter „Bild folgt“.
- **Reproduktion:** `/produkte` öffnen und Kategorieübersicht prüfen.
- **Erwartet:** Vollständige, professionelle Kategoriedarstellung oder bewusst nicht veröffentlichte Kategorie.
- **Tatsächlich:** Sichtbarer Platzhalter.
- **Beweis:** `screenshots/produkte-1440x900.png`.
- **Empfohlene Korrektur:** Freigegebenes Bild und Alt-Text ergänzen oder Kategorie bis dahin ausblenden.
- **Aufwand:** klein
- **Verifikationsstatus:** Browser-verifiziert

## DLMNS-P1-004 – Wissens-Popover und Tabellenkanten-Integration fehlerhaft

- **Priorität / Art:** P1 – nachgewiesener Funktionsfehler
- **Prüfbereich:** Produktberatung, UX, API
- **Betroffene Route:** Produktdetailseiten für Stoff-/Tischkonfiguration
- **Datei / Position:** Knowledge-Trigger-Komponenten und `/api/knowledge/preview`
- **Fehlerbeschreibung:** Vier Knowledge-Integrationstests schlagen fehl: erwartete Stoffgruppen-Trigger fehlen bzw. reagieren nicht zuverlässig; die Tabellenkanten-Interaktion läuft in einen Timeout. Der Sitemap-/Link-Crawler beobachtet zudem 404-Antworten der Knowledge-Preview-API für Tischkanten.
- **Reproduktion:** Betroffene Produktkonfiguration öffnen → Wissenshinweis zu Stoffgruppe/Tischkante auslösen; alternativ die entsprechenden Playwright-Tests ausführen.
- **Erwartet:** Jeder sichtbare Wissensauslöser öffnet stabil einen passenden Inhalt, ohne 404 oder Timeout.
- **Tatsächlich:** Trigger fehlen oder laden nicht; API-Aufrufe enden teilweise 404.
- **Beweis:** 4 reproduzierte Fehler im stabilen 86-Test-Lauf; API-404 im Crawler.
- **Empfohlene Korrektur:** Mapping und Triggerzustände korrigieren, API-Fallback definieren, Fehlerzustand nutzerfreundlich anzeigen und E2E absichern.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert reproduziert

## DLMNS-P1-005 – Kontaktversand ist ohne SMTP-Konfiguration nicht betriebsbereit

- **Priorität / Art:** P1 – nachgewiesenes Deployment-/Betriebsrisiko
- **Prüfbereich:** Kontakt, Anfrage, Conversion
- **Betroffene Route:** `/kontakt`, `/anfrage`, `/api/contact`, `/api/inquiry`
- **Datei / Position:** API-Routen und `.env.example`; lokale `.env` ohne SMTP-Werte
- **Fehlerbeschreibung:** Eine syntaktisch gültige lokale Kontaktanfrage endet mit HTTP 503, weil SMTP nicht konfiguriert ist. Es wurde bewusst keine produktive E-Mail gesendet.
- **Reproduktion:** Lokalen Production-Server ohne SMTP starten und eine gültige, nicht reale Testanfrage an `/api/contact` senden.
- **Erwartet:** In der freizugebenden Umgebung wird die Anfrage sicher zugestellt; Fehler werden verständlich behandelt und überwacht.
- **Tatsächlich:** 503; End-to-End-Zustellung ist nicht nachgewiesen.
- **Beweis:** nicht-destruktiver API-Test; leerer Inquiry-Request korrekt 422.
- **Empfohlene Korrektur:** In isoliertem Staging mit Testempfänger konfigurieren, Erfolgs-/Fehlerpfad und Monitoring prüfen, danach erst Produktion freigeben.
- **Aufwand:** mittel
- **Verifikationsstatus:** Fehlerfall automatisiert verifiziert; reale Zustellung bewusst nicht geprüft

## DLMNS-P1-006 – Wesentliche Security Header fehlen

- **Priorität / Art:** P1 – nachgewiesenes Hardening-Defizit
- **Prüfbereich:** Security, Hosting
- **Betroffene Route:** alle geprüften HTML-Routen
- **Datei / Position:** `next.config.*` / Hosting-Konfiguration
- **Fehlerbeschreibung:** Am lokalen Production-Server fehlen CSP, HSTS, `X-Content-Type-Options`, Frame-Schutz, `Referrer-Policy`, `Permissions-Policy` und COOP.
- **Reproduktion:** Response-Header einer HTML-Route am Production-Server inspizieren.
- **Erwartet:** Zum Anwendungskontext passende, getestete Schutzheader; HSTS nach TLS-/Domain-Prüfung am Edge.
- **Tatsächlich:** Keine explizite Schutzheader-Konfiguration festgestellt.
- **Beweis:** Browser-/HTTP-Header-Crawl.
- **Empfohlene Korrektur:** Header in Anwendung oder Hosting-Edge definieren; CSP zunächst report-only testen, benötigte Quellen minimal halten; finale Produktionsdomain separat verifizieren.
- **Aufwand:** mittel
- **Verifikationsstatus:** am lokalen Production-Server verifiziert; Hosting-Edge manuell zu prüfen

## DLMNS-P1-007 – Unzulässige ARIA-Attribute im Raumplaner

- **Priorität / Art:** P1 – nachgewiesener Accessibility-Verstoß
- **Prüfbereich:** WCAG 2.2 AA, Raumplaner
- **Betroffene Route:** `/raumplaner`
- **Datei / Position:** SVG-Gruppen im 2D-Editor und `.planner-brand`
- **Fehlerbeschreibung:** Axe meldet `aria-prohibited-attr` mit Schweregrad „serious“ an fünf Desktop- bzw. sechs Mobile-Nodes.
- **Reproduktion:** Axe auf `/raumplaner` bei 1440×900 und 390×844 ausführen.
- **Erwartet:** Nur für die jeweilige Rolle erlaubte ARIA-Attribute; verständliche zugängliche Namen und Struktur.
- **Tatsächlich:** Mehrere SVG-`g`-Elemente/Branding-Nodes verletzen die ARIA-Regeln.
- **Beweis:** automatisierter Axe-Lauf auf beiden Viewports.
- **Empfohlene Korrektur:** Semantik der SVG-Gruppen überarbeiten, dekorative Elemente korrekt ausblenden und danach mit Axe plus Screenreader neu prüfen.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert reproduziert; Screenreaderprüfung offen

## DLMNS-P1-008 – Raumplaner überschreitet 1440×900-Viewport vertikal

- **Priorität / Art:** P1 – nachgewiesener Layout-/Bedienfehler
- **Prüfbereich:** Raumplaner, Responsive Design
- **Betroffene Route:** `/raumplaner`
- **Datei / Position:** Planner-Seitenlayout und Editorhöhen
- **Fehlerbeschreibung:** Zwei Viewporttests messen das Ende des Arbeitsbereichs bei y=952; damit ragt die zentrale Oberfläche 52 px über einen 900 px hohen Desktop-Viewport hinaus und verlangt unnötiges Scrollen.
- **Reproduktion:** `/raumplaner` bei 1440×900 öffnen und Bounding-Box des Planner-Arbeitsbereichs messen.
- **Erwartet:** Kompakter, vollständig erreichbarer Kernarbeitsbereich ohne unnötiges vertikales Scrollen.
- **Tatsächlich:** 52 px Überlauf.
- **Beweis:** zwei reproduzierte Playwright-Fehler; Screenshot `screenshots/raumplaner-1440x900.png`.
- **Empfohlene Korrektur:** Höhen-/Header-/Toolbar-Berechnung responsiv abstimmen und bei allen sechs Zielviewports erneut prüfen.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert reproduziert und visuell geprüft

## DLMNS-P1-009 – Raumplaner ohne H1 und nicht in der Sitemap

- **Priorität / Art:** P1 – nachgewiesenes SEO-/Strukturdefizit einer Kernfunktion
- **Prüfbereich:** SEO, Accessibility, Informationsarchitektur
- **Betroffene Route:** `/raumplaner`
- **Datei / Position:** Planner-Seite und Sitemap-Generator
- **Fehlerbeschreibung:** Der gerenderte Raumplaner enthält keine H1 und ist nicht Teil der generierten XML-Sitemap.
- **Reproduktion:** DOM-Überschriften der Route prüfen und die 64 Sitemap-URLs durchsuchen.
- **Erwartet:** Eindeutige Hauptüberschrift und bewusste Indexierungsentscheidung für die geschäftskritische Seite.
- **Tatsächlich:** Keine H1; Route fehlt in Sitemap, ohne dokumentierte `noindex`-Strategie.
- **Beweis:** Browsercrawl und Sitemap-Inventar.
- **Empfohlene Korrektur:** Semantische H1 ergänzen und Route entweder bewusst in die Sitemap aufnehmen oder explizit, begründet und konsistent auf `noindex` setzen.
- **Aufwand:** klein
- **Verifikationsstatus:** Browser-verifiziert und statisch geprüft

## DLMNS-P1-010 – Bildrechte, Personenfreigaben und öffentliche Altbestände ungeklärt

- **Priorität / Art:** P1 – begründetes Datenschutz-/Rechterisiko, kein behaupteter Rechtsverstoß
- **Prüfbereich:** Bilder, Medien, Datenschutz
- **Betroffene Route:** gesamtes öffentliche Asset-Verzeichnis; je nach Referenz mehrere Seiten
- **Datei / Position:** `public/` (406 Bilddateien), Details in `04-IMAGE-AUDIT.md`
- **Fehlerbeschreibung:** Das öffentlich auslieferbare Verzeichnis enthält zahlreiche nicht exakt referenzierte Alt-/Variantenassets, mehrere Logos, christliche Motive, reale Personen, Werkstatt-/Kundenräume sowie Dateinamen mit Hinweisen auf Dritt- oder KI-Quellen. Aus dem Repository ist keine vollständige Rechte-/Einwilligungsdokumentation ableitbar.
- **Reproduktion:** Bildinventar und acht Kontaktbögen prüfen; Dateien mit Personen, Kundenräumen, alten Marken oder Quellenhinweisen abgleichen.
- **Erwartet:** Nur benötigte und nachweislich freigegebene Assets liegen öffentlich; Einwilligungen/Lizenzen sind dokumentiert.
- **Tatsächlich:** Freigabestatus ist für zahlreiche Dateien nicht nachweisbar.
- **Beweis:** 406-zeiliges Inventar und `screenshots/image-contact-sheet-1.webp` bis `-8.webp`.
- **Empfohlene Korrektur:** Eigentümer-/Lizenz-/Einwilligungsmatrix erstellen; nicht benötigte oder ungeklärte Dateien vor Release aus `public/` entfernen; sichtbare Personen/Kundenräume explizit freigeben lassen.
- **Aufwand:** groß
- **Verifikationsstatus:** technisch/visuell geprüft; Rechte manuell zu verifizieren

## DLMNS-P1-011 – Formularschutz ist nicht produktionsreif belastbar

- **Priorität / Art:** P1 – begründetes Abuse-/Betriebsrisiko
- **Prüfbereich:** Security, Formulare
- **Betroffene Route:** `/api/contact`, `/api/inquiry`
- **Datei / Position:** Kontakt- und Anfrage-API-Routen
- **Fehlerbeschreibung:** Validierung und Honeypot sind vorhanden. Für Kontakt wurde jedoch kein belastbares Rate-Limit nachgewiesen; das Inquiry-Limit ist nur pro Prozess im Speicher und vertraut auf `x-forwarded-for`. In serverlosen/mehrinstanzigen Umgebungen ist dies leicht inkonsistent bzw. manipulierbar.
- **Reproduktion:** Codepfade für Client-IP und Zähler prüfen; Neustart/zweite Instanz gedanklich bzw. in Staging simulieren.
- **Erwartet:** Verteiltes, proxy-korrektes Rate-Limit, Größenlimits, Monitoring und definierter Missbrauchsschutz.
- **Tatsächlich:** Schutz ist lokal/prozessgebunden und für die Zielumgebung nicht belegt.
- **Beweis:** statische API-Prüfung.
- **Empfohlene Korrektur:** Vertrauenswürdige Plattform-IP-Ermittlung und verteiltes Rate-Limit einsetzen; Grenzwerte, Logging ohne Inhalts-/PII-Leak und Alarmierung testen.
- **Aufwand:** mittel
- **Verifikationsstatus:** statisch geprüft; Staging-Last-/Abusetest offen

## DLMNS-P1-012 – Zwei Preisumschalter unterschreiten die Touch-Zielgröße

- **Priorität / Art:** P1 – nachgewiesenes Mobile-/Accessibility-Problem
- **Prüfbereich:** WCAG 2.2, Touch-Bedienung
- **Betroffene Route:** Shop-/Produktansichten mit Brutto-/Netto-Umschalter
- **Datei / Position:** Preis-Modus-Komponente
- **Fehlerbeschreibung:** Zwei Buttons sind nur 36 px hoch und unterschreiten die im Projekt getestete Zielgröße von 44 px.
- **Reproduktion:** Touch-Target-Test bei Mobile-Viewport ausführen oder Bounding-Box messen.
- **Erwartet:** Ausreichend große, nicht überlappende Touch-Ziele.
- **Tatsächlich:** 36 px Höhe.
- **Beweis:** zwei reproduzierte Touch-Target-Testfehler.
- **Empfohlene Korrektur:** Interaktive Fläche auf mindestens 44×44 CSS-Pixel vergrößern und Abstände erneut testen.
- **Aufwand:** klein
- **Verifikationsstatus:** automatisiert reproduziert

## DLMNS-P2-001 – Suche rankt exakte, Präfix- und Tippfehler-Treffer nicht erwartungsgemäß

- **Priorität / Art:** P2 – nachgewiesener Qualitätsfehler
- **Prüfbereich:** Suche, Ersatzteil-Journey
- **Betroffene Route:** `/produkte/suche`
- **Datei / Position:** Suchindex-/Rankinglogik
- **Fehlerbeschreibung:** Drei Rankingtests schlagen fehl: ein exakter Titel liefert kein erwartetes Top-Ergebnis, ein Präfix wird als Synonym interpretiert und bei einem Tippfehler wird das falsche Produkt priorisiert.
- **Reproduktion:** Die drei Such-Rankingtests ausführen bzw. die dortigen Begriffe in der Suche verwenden.
- **Erwartet:** Exakte Titel vor Synonymen, sinnvolle Präfixbehandlung und stabile Fuzzy-Relevanz.
- **Tatsächlich:** Reihenfolge/Ergebnis weicht ab.
- **Beweis:** drei reproduzierte Playwright-Fehler.
- **Empfohlene Korrektur:** Gewichtung und Tokenisierung anpassen; mit realen Kundensuchbegriffen und Nulltreffern erneut testen.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert reproduziert

## DLMNS-P2-002 – Sehr großer öffentlicher Bildbestand und zahlreiche schwere Dateien

- **Priorität / Art:** P2 – nachgewiesenes Performance-/Betriebsrisiko
- **Prüfbereich:** Bilder, Performance
- **Betroffene Route:** alle bildlastigen Seiten; öffentlich direkt erreichbare Assets
- **Datei / Position:** `public/`
- **Fehlerbeschreibung:** 406 technisch lesbare Bilddateien belegen 521.585.568 Byte (497,4 MiB); 174 Dateien sind größer als 1 MiB. 308 Dateien wurden in der statischen Referenzsuche nicht exakt gefunden. Mehrere PNGs liegen im Bereich bis etwa 2,7 MiB.
- **Reproduktion:** Bildinventar in `04-IMAGE-AUDIT.md` nach Größe/Verwendung sortieren.
- **Erwartet:** Für den Einsatzzweck dimensionierte, komprimierte, benötigte Assets mit korrekter responsiver Auslieferung.
- **Tatsächlich:** Hoher öffentlicher Bestand und erhebliches Optimierungspotenzial.
- **Beweis:** vollständiges Sharp-Inventar; Kontaktbögen; lokaler Warm-Cache-Transfer grob ca. 740 kB Startseite und 1,17 MB Raumplaner.
- **Empfohlene Korrektur:** Zuerst tatsächlich referenzierte LCP-/Produktbilder optimieren, dann ungenutzte Assets nach Rechteprüfung entfernen; `sizes`, Priorität und responsive Varianten messen statt pauschal zu verkleinern.
- **Aufwand:** groß
- **Verifikationsstatus:** technisch automatisiert und visuell stichprobenartig vollständig über Kontaktbögen geprüft; Feldwerte offen

## DLMNS-P2-003 – Raumplaner-Shopübergabe widerspricht zwei Akzeptanztests

- **Priorität / Art:** P2 – nachgewiesene Spezifikationsinkonsistenz
- **Prüfbereich:** Raumplaner, Commerce-Übergabe
- **Betroffene Route:** `/raumplaner`
- **Datei / Position:** Chair-Shop-Target-/Bedarfslogik; WP15-/WP16-Tests
- **Fehlerbeschreibung:** Zwei Tests erwarten `canAddToCart: false`, die Implementierung liefert `true`. Es ist nicht eindeutig, ob die Anwendung oder die inzwischen veraltete Erwartung falsch ist.
- **Reproduktion:** WP15-/WP16-Tests am Production-Build ausführen.
- **Erwartet:** Fachlich eindeutig definierte und getestete Übergaberegel.
- **Tatsächlich:** Test und Implementierung widersprechen sich.
- **Beweis:** zwei reproduzierte Testfehler.
- **Empfohlene Korrektur:** Produktverantwortlich entscheiden, welche Modelle/Mengen in den Warenkorb dürfen; danach Implementierung, Text und Test gemeinsam angleichen.
- **Aufwand:** klein
- **Verifikationsstatus:** automatisiert reproduziert; fachliche Entscheidung offen

## DLMNS-P2-004 – Sonderposten-Seite ist öffentlich, obwohl keine aktiven Angebote vorliegen

- **Priorität / Art:** P2 – begründetes Content-/SEO-Risiko
- **Prüfbereich:** Inhalte, Navigation, Indexierung
- **Betroffene Route:** `/sonderposten`
- **Datei / Position:** Sonderposten-Seite und Sitemap/Navigation
- **Fehlerbeschreibung:** Die Seite kommuniziert transparent, dass aktuell nur Vorschauen und keine aktiven Angebote vorliegen. Für eine öffentliche Shop-/Sortimentserfahrung entsteht dennoch eine Sackgasse ohne konkretes Angebot.
- **Reproduktion:** Route öffnen und Angebot/CTA prüfen.
- **Erwartet:** Freigegebener redaktioneller Zweck oder nicht öffentlich/indexierbar, solange kein Angebot existiert.
- **Tatsächlich:** Öffentlich erreichbare Vorschauseite ohne aktive Ware.
- **Beweis:** Browser- und Inhaltsprüfung.
- **Empfohlene Korrektur:** Geschäftsseitig freigeben und klaren CTA anbieten oder bis zu echten Angeboten aus Navigation/Sitemap nehmen und `noindex` setzen.
- **Aufwand:** klein
- **Verifikationsstatus:** Browser-verifiziert; Geschäftsentscheidung offen

## DLMNS-P2-005 – Gesamttestlauf und Standard-Build waren nicht stabil reproduzierbar

- **Priorität / Art:** P2 – nachgewiesenes Release-Prozessrisiko
- **Prüfbereich:** Build, Testinfrastruktur
- **Betroffene Route:** gesamte Anwendung
- **Datei / Position:** Build-/Playwright-Konfiguration und Server-Lifecycle
- **Fehlerbeschreibung:** Der erste Standard-Build brach nach „Collecting page data“ ohne verwertbare Diagnose ab; der serielle Debug-Prerender-Build bestand. Im 436-Test-Gesamtlauf starb ein wiederverwendeter Server während der Suite und erzeugte zahlreiche `ERR_CONNECTION_REFUSED`-Kaskaden.
- **Reproduktion:** Standard-Releasekommando und komplette Playwright-Suite unter sauber verwaltetem Production-Server wiederholen.
- **Erwartet:** Deterministischer Build und Testserver-Lifecycle mit belastbarem Gesamtergebnis.
- **Tatsächlich:** Erst alternative bzw. gezielte Wiederholungen lieferten stabile Ergebnisse.
- **Beweis:** 367/436 im ersten Lauf, 72/86 plus 36/36 in kontrollierten Wiederholungen; serieller Build erfolgreich.
- **Empfohlene Korrektur:** CI-Serverstart/-stop, Port, Healthcheck und Ressourcenlimits stabilisieren; vollständige Suite vor Release nochmals aus einem sauberen Checkout ausführen.
- **Aufwand:** mittel
- **Verifikationsstatus:** automatisiert beobachtet; Ursache nur teilweise eingegrenzt

## DLMNS-P2-006 – Kritische manuelle und Cross-Browser-Prüfungen fehlen

- **Priorität / Art:** P2 – offenes Prüfrisiko, kein nachgewiesener Produktfehler
- **Prüfbereich:** Accessibility, Browserkompatibilität, Performance
- **Betroffene Route:** gesamte Anwendung, Schwerpunkt Raumplaner und Commerce
- **Datei / Position:** Testkonfiguration (lokal nur Chromium/Chrome)
- **Fehlerbeschreibung:** Firefox und WebKit wurden nicht ausgeführt. Ein echter Screenreader-Test, Browserzoom bis 200 %, reale Touch-Geräte und Lighthouse/Core-Web-Vitals-Messung waren nicht verfügbar bzw. wurden nicht vorgetäuscht.
- **Reproduktion:** Testmatrix und installierte Browser-/Auditwerkzeuge prüfen.
- **Erwartet:** Vor Release nachgewiesene Funktion in den vereinbarten Engines und manuelle WCAG-Stichprobe; Performance-Messung unter dokumentierten Bedingungen.
- **Tatsächlich:** Nur Chromium-basierte Browserautomation und Axe wurden belastbar ausgeführt.
- **Beweis:** Testkonfiguration und Auditprotokoll.
- **Empfohlene Korrektur:** Firefox/WebKit in CI oder auf Referenzgeräten, 200-%-Zoom, Tastatur/Screenreader und Lighthouse auf finaler Staging-Domain ergänzen.
- **Aufwand:** mittel
- **Verifikationsstatus:** nicht geprüft/offen

## DLMNS-P2-007 – Open-Graph-Seitenverhältnis und Sitemap-Datierung sind unpräzise

- **Priorität / Art:** P2 – nachgewiesenes SEO-/Sharing-Qualitätsproblem
- **Prüfbereich:** SEO, Social Sharing
- **Betroffene Route:** globale Metadaten und Sitemap
- **Datei / Position:** Metadata-/Sitemap-Konfiguration
- **Fehlerbeschreibung:** Das Standard-Open-Graph-Bild ist visuell 4:3, wird in den Metadaten aber als 1200×630 deklariert. Für zahlreiche Sitemap-Einträge wird beim Build der aktuelle Zeitpunkt als `lastModified` verwendet, unabhängig von einer echten Inhaltsänderung.
- **Reproduktion:** Bilddimension und Metadata-Deklaration vergleichen; Sitemap nach zwei Builds vergleichen.
- **Erwartet:** Passendes Social-Share-Crop und inhaltlich korrekte Änderungsdaten.
- **Tatsächlich:** Möglicher ungünstiger Zuschnitt und künstlich aktuelle Datierung.
- **Beweis:** statische Metadaten-/Asset-/Sitemap-Prüfung.
- **Empfohlene Korrektur:** Eigenes 1,91:1-OG-Motiv erzeugen/testen und reale, stabile Änderungsdaten verwenden.
- **Aufwand:** klein
- **Verifikationsstatus:** statisch geprüft; Plattformvorschauen manuell offen

## DLMNS-P2-008 – Lazy-Load-Bildtest der Startseite ist flakey

- **Priorität / Art:** P2 – begründetes Robustheitsrisiko
- **Prüfbereich:** Bilder, Ladeverhalten
- **Betroffene Route:** `/`
- **Datei / Position:** Sortiment-/Bildsektionen der Startseite
- **Fehlerbeschreibung:** Ein bestehender Test wartete erfolglos auf `naturalWidth` eines Sortimentbilds. Ein separater Browsercrawl fand danach keine defekten gerenderten Bilder oder 404; daher ist kein dauerhafter Broken-Image-Fehler bewiesen, aber Timing/Lazy-Loading ist nicht robust abgesichert.
- **Reproduktion:** Bild-QA-Test wiederholt unter kaltem Cache bzw. gedrosselter Verbindung ausführen.
- **Erwartet:** Wichtige Bilder laden deterministisch und besitzen geeignete Loading-/Priority-/Sizes-Angaben.
- **Tatsächlich:** Ein Timeout im Test, später kein reproduzierbarer Defekt.
- **Beweis:** einzelner Testfehler plus erfolgreicher unabhängiger Crawl.
- **Empfohlene Korrektur:** Testselektor und tatsächliches Ladeverhalten unter Slow Network prüfen; LCP-Bild priorisieren, nicht kritische Bilder lazy laden.
- **Aufwand:** klein
- **Verifikationsstatus:** inkonsistent; manuell/automatisiert erneut zu prüfen

## DLMNS-P3-001 – Interne Asset- und Dateinamensbereinigung

- **Priorität / Art:** P3 – Wartungsempfehlung, soweit keine Rechte-/Datenschutzfrage betroffen ist
- **Prüfbereich:** Repository-Hygiene
- **Betroffene Route:** keine direkte; `public/`
- **Datei / Position:** diverse alte, doppelte oder kryptisch benannte Bilddateien
- **Fehlerbeschreibung:** Zahlreiche Assets haben uneinheitliche oder quellenartige Dateinamen; 308 wurden nicht exakt als Quellcodereferenz erkannt. Dies erschwert Pflege und Rechtezuordnung.
- **Reproduktion:** Inventarspalte „Verwendung“ und Dateinamen in `04-IMAGE-AUDIT.md` prüfen.
- **Erwartet:** Nachvollziehbare, markenkonforme Namen und dokumentierte Nutzung.
- **Tatsächlich:** Historisch gewachsener Bestand.
- **Beweis:** vollständiges Bildinventar.
- **Empfohlene Korrektur:** Nach dem Release-Blocker-/Rechte-Cleanup verbleibende Dateien inventarbasiert umbenennen und Referenzen kontrolliert aktualisieren.
- **Aufwand:** mittel
- **Verifikationsstatus:** statisch geprüft

## Zusammenfassung

| Priorität | Anzahl | Releasewirkung |
|---|---:|---|
| P0 | 3 | Jede Gruppe blockiert die Freigabe eigenständig. |
| P1 | 12 | Vor öffentlichem Release zu schließen. |
| P2 | 8 | Zeitnah beheben bzw. offene Prüfung vor Freigabe risikobasiert abschließen. |
| P3 | 1 | Nach Release möglich, soweit keine Rechte-/Datenschutzfrage berührt ist. |

Die Einstufung trennt nachgewiesene Fehler, begründete Risiken und offene Prüfungen. Eine rechtliche Freigabe wird durch diesen technischen/redaktionellen Audit ausdrücklich nicht ersetzt.
