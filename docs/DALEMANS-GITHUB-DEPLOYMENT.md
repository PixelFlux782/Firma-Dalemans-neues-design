# Verbindlicher GitHub-Produktionsablauf

## Aktueller Abgleich - 14.11.2026

**READY FOR GITHUB RELEASE - lokaler Commit.** Dieser Abschnitt ersetzt widersprechende Freigabeangaben im historischen Text darunter fuer den aktuellen Commitauftrag. Staging und Commit der exakt 81 Aenderungen/Loeschungen und 48 neuen Manifest-Dateien sind ausdruecklich autorisiert. Kein Push, Deploy, Restore, weiterer Build oder echter Mailversand.

Die 129 Pfade wurden mit dem Arbeitsbaum abgeglichen; alle neuen Assets und benoetigten lokalen Quellmodule sind vorhanden. Die staged Dateiliste muss vor Commit exakt mit dem Manifest uebereinstimmen. Nur diese drei Statusdokumente werden redaktionell aktualisiert; Code, Produktdaten, Rechtstexte und Netlify-Konfiguration bleiben unveraendert.

Vorhandene Belege: audit/github-release/local-inventory.json (Secretpruefung und 96 Bildreferenzen), catalog.json (22 Produkte, 113 Varianten, 119 Bildreferenzen, keine fehlenden Bilder), image-files.json (415 Rasterbilder, keine ungueltigen Dateien). Ergaenzende Originalprotokolle: audit/final-release/tsc-release.log, lint-release-final.log, vitest-release.log (26 Tests), rc-playwright.json (131 erwartet, keine unerwarteten oder uebersprungenen Tests) und netlify-release-build.log (Adapterbuild abgeschlossen). Die historischen 54/16 Tests sind separate dokumentierte Laeufe und werden damit nicht gleichgesetzt oder neu ausgefuehrt.

Der bestehende Bericht docs/DALEMANS-P0-PRODUCTION-RECOVERY.md bestaetigt authentifiziert elf Production-Variablen samt Functions-/Builds-/Runtime-Scope, ohne konkurrierende Mail-Testmodus-/Upstash-Schluessel in der damaligen Antwort. Maskierte Werte belegen keine konkreten SMTP-/Redis-Werte. Keine neue Netlify-CLI-Abfrage, kein Token-Export, keine TLS- oder Konfigurationsaenderung.

**Keine nachgewiesenen Blocker fuer den lokalen Commit.** Aktuelle private Git-/Build-/Publishing-Einstellungen, SMTP-/Redis-Semantik, echte Zustellung und Abnahme einer neuen Plattformlaufzeit bleiben Nachweisgrenzen fuer den spaeteren Produktionsablauf. Sie werden nicht als erfolgreiche Pruefung behauptet und erfordern fuer diesen Commit keine erneute Plattformabfrage. Push und Deployment benoetigen einen gesonderten Auftrag.

## Historischer Pruefstand

Repository: https://github.com/PixelFlux782/Firma-Dalemans-neues-design — Branch `main` — Site `aaf57ea8-42af-4e92-b8ce-f5a09d555d70` — https://dalemans.de.

Ein Push auf main löst voraussichtlich unmittelbar einen kostenpflichtigen Produktionsdeploy aus. Im Prüfauftrag vom 14.11.2026 sind Commit, Push und Deployment nicht autorisiert und nicht ausgeführt.

1. Lokale Änderungen abschließen; `git status`, Branch, Remote und `git ls-remote origin refs/heads/main` prüfen. Bei Remoteänderung zuerst kontrolliert abgleichen; keine lokalen Änderungen verwerfen.
2. `npm ci` in sauberer Arbeitsumgebung, `npx --no-install tsc --noEmit`, `npm run lint`, relevante Vitest-/Playwright-Tests und einmal `npm run build` ausführen. Keine echten SMTP-/Redis-Zugriffe durch Tests.
3. Logo, sämtliche Hero- und Katalogbilder, codierte Pfade und Groß-/Kleinschreibung prüfen. Neue public-Dateien müssen versioniert sein; `git check-ignore` kontrollieren. Next-Build und statische JS-Dateien müssen vorhanden sein.
4. Finale explizite Dateiliste aus dem Release-Manifest prüfen; Secrets, `.env`, Kontozugänge, Kundendaten, Testdaten und Artefakte ausschließen. Kein pauschales `git add .`. `.env.example` darf nur Musterwerte enthalten.
5. Erst nach gesonderter Commitfreigabe gezielt stagen, `git diff --cached --stat`, Dateiliste und Inhalt prüfen und committen. In diesem Auftrag noch keinen Commit anlegen. Vor Push HEAD und Remote erneut prüfen.
6. Vor Betreiberfreigabe alle BLOCKED-Punkte aus dem Readiness-Bericht auflösen. Anschließend ausschließlich nach ausdrücklicher Push-/Deploymentfreigabe genau einen Push auf main ausführen; keine zusätzlichen CLI-Deploys.
7. Netlify baut aus Git im Production-Kontext: Node 22, Lockfileinstallation, `npm run build`, Publish `.next`, Next.js-Adapter. Keine rohe `.next`-Verzeichnisstruktur manuell hochladen. Base-/Package-Verzeichnis, Git-Verknüpfung, Build-/Publishingstatus sowie die elf Production-Variablen mit Functions-Scope vorher lesend bestätigen. Vollständiges Redis-Paar, SMTP-Port/Secure/STARTTLS und deaktivierte Mail-Testmodi kontrollieren. Keine Kontoänderungen ohne Auftrag.
8. Buildlog prüfen: korrekter Git-Commit, Production-Kontext, Next-Kompilierung, Adapterausführung, SSR-/API-Function, Routing und Image-CDN-Regeln. Erfolgreiche Uploadmeldung allein genügt nicht. Deploy-ID und vorherigen aktiven Deploy dokumentieren. Keine automatische Wiederholung bei Fehlern.
9. Nach Freigabedeploy Logo, Hero, neue Produktbilder, Originalbilder und `/_next/image` prüfen. Startseiten-/Produktseiten-Chunks unter `/_next/static` müssen 200 und JavaScript-MIME liefern. Browserkonsole, Navigation, Warenkorb, Adressen und dynamische Routen kontrollieren. `/server/app/index.html` und `/static/chunks/...` dürfen keine Ersatzlösung für das öffentliche Assetlayout sein.
10. Nach ausdrücklich autorisiertem kontrolliertem Formulartest Kontakt und Warenkorbanfrage einschließlich interner E-Mail/Kundenbestätigung, Adressen, Redis-Schutz und Functions-Logs bestätigen. Testempfänger und Testdaten vorher festlegen. Kein ungeplanter Versand an echte Kunden. Im vorliegenden Auftrag kein Formularversand.

Ein Restore veröffentlicht bestehende Artefakte; er baut nicht neu und aktualisiert deren Umgebungsvariablen nicht. Bei Fehlern stoppen und einen konkreten Recovery-Vorschlag zur gesonderten Freigabe vorlegen.

Quelle: [Netlify Next.js](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/). Details und aktuelle Grenzen: `DALEMANS-GITHUB-RELEASE-READINESS.md`.
