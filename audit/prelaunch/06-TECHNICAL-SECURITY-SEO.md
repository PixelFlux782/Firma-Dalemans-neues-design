# 06 – Technik, Security, Performance, SEO und Accessibility

## Architektur

- Next.js 15.5.22, React 19.2.0, App Router, TypeScript 5.6.3, Tailwind 3.4.14.
- 35 Page-Dateien, 4 API-Routen, 37 Client Components.
- Commerce-Provider standardmäßig `local`; Shopify-Konfiguration ist vorhanden, der Provider ist ausdrücklich „future/reserved“ und nicht aktiv.
- Warenkorb, Preismodus und Raumplaner-Projekte werden lokal im Browser gespeichert.
- Kontakt/Anfrage nutzen Nodemailer/SMTP; lokal sind die erforderlichen SMTP-Werte nicht gesetzt.
- 2D-/3D-Planer nutzt React Three Fiber/Three.js; Modelle liegen lokal unter `public/models`.

## Security

`npm audit --omit=dev --json` am 23.10.2026: 4 produktive Vulnerability-Gruppen (1 kritisch, 3 hoch):

- Next.js 15.5.22: kritische RCE-Advisories und weitere Cache-/DoS-Advisories; Audit nennt Updates verfügbar.
- Nodemailer 9.0.3: mehrere Parser-/DoS-/Adressvalidierungs-/TLS-Cache-Advisories.
- Sharp 0.35.3: hohe libheif/librsvg-Befunde.
- `source-map-js` 1.2.1: hoher Event-Loop-DoS-Befund.

Keine hartcodierten Secrets oder privaten Schlüssel in getrackten Dateien gefunden. `.env` ist ignoriert; nur `.env.example` ist getrackt. Die lokale `.env` enthält nur einen gesetzten öffentlichen Builder-Key; der Wert wurde nicht protokolliert. Keine Upload-Endpunkte gefunden. `dangerouslySetInnerHTML` wird nur für JSON-LD mit `JSON.stringify` verwendet.

Auf der Root-Response fehlen CSP, HSTS, `X-Content-Type-Options`, Frame-Schutz, Referrer-Policy, Permissions-Policy und COOP. Deployment-Plattform kann einzelne Header ergänzen, in der geprüften lokalen Production-Konfiguration sind sie jedoch nicht definiert.

Kontakt-API hat Längenprüfung, Validierung und Honeypot, aber kein Rate-Limit. Inquiry-API hat In-Memory-Rate-Limit/Idempotenz; es vertraut `x-forwarded-for`, ist instanzlokal und daher für serverlose Skalierung/Proxy-Spoofing nur begrenzt belastbar. Origin-/CSRF-Prüfung ist nicht explizit implementiert.

## Performance

- Build: gemeinsames First-Load-JS 103 kB; gewöhnliche Seiten ca. 111–137 kB, Raumplaner-Route initial 104 kB plus dynamische Planer-/3D-Ressourcen.
- Eigener lokaler Warm-Cache-Crawl: Startseite ca. 0,74 MB Resource-Transfer, Raumplaner ca. 1,17 MB; Navigation/Load lokal meist deutlich unter einer Sekunde. Das sind keine Feldwerte und keine belastbaren Core-Web-Vitals.
- Lighthouse war nicht installiert und wurde ohne Dependency-Änderung nicht nachinstalliert. LCP/CLS/INP wurden daher nicht als bestanden behauptet.
- Öffentlicher Bildbestand 497,4 MiB; 174 Dateien >1 MiB. Next Image reduziert gerenderte Transfers, direkte Assets/Deployment bleiben schwer.
- 3D-/Planner-Performance wird durch Tests mit 100+ Möbeln und größeren Sitzmengen abgedeckt; diese bestanden in der stabilen Wiederholung. Langzeit-Speicherprofiling blieb offen.

## SEO

Positiv: individuelle Metadaten auf Kernseiten, Canonicals zur Fallback-Domain `https://stapelstuhl-klapptisch.de`, robots.txt, XML-Sitemap, OG/Twitter, strukturierte Organization/Product/Breadcrumb-Daten, Suche `noindex`, 404 `noindex`.

Probleme:

- `/raumplaner` besitzt im Browser kein H1 und fehlt trotz Kernfunktion in der Sitemap.
- Sitemap setzt für viele Einträge `lastModified` bei jedem Build auf „jetzt“ statt auf echte Inhaltsänderung.
- Default-OG-Bild ist ein 4:3-Produktfotopfad, aber Metadaten deklarieren 1200×630; Social-Crop manuell prüfen.
- `/sonderposten` ist indexierbar, obwohl nur künftige Beispielangebote gezeigt werden.
- Canonical-Domain ist technisch vorbereitet, muss vor Go-live gegen die endgültige öffentliche Domain verifiziert werden.

## Accessibility

Axe-Core (WCAG 2 A/AA, 2.1 A/AA, 2.2 AA) auf sieben Kernrouten bei 390×844 und 1440×900: außerhalb des Raumplaners keine automatischen Violations. Im Raumplaner: `aria-prohibited-attr`, Impact „serious“, an SVG-`g`-Elementen sowie mobil zusätzlich `.planner-brand` (5–6 Nodes). Außerdem fehlen ein H1 und zwei Preismodus-Buttons sind nur 36 px hoch.

Positiv: Skip-Link, sichtbare Fokusmechanismen, Tastaturtests für Navigation/Dialogs, keine fehlenden `alt`-Attribute im Kerncrawl, keine horizontalen Overflows. Offen bleiben Screenreader, 200-%-Zoom, Kontrast-Stichprobe sämtlicher Zustände, Touchgeräte und reduzierte Bewegung außerhalb der getesteten Planner-Hilfe.

## Datenschutz/Tracking

Browsercrawl erzeugte keine externen Requests. Es existiert kein aktiver Trackingadapter und daher aktuell kein technischer Consent-Banner-Bedarf für Analytics. Die Datenschutzerklärung behauptet dennoch mehrere externe Tracking-/Security-Dienste und verschweigt reale lokale Speicherung/Formularverarbeitung; sie muss vor Release ersetzt werden.
