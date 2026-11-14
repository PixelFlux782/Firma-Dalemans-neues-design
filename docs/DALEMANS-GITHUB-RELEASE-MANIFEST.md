# Dalemans GitHub Release Manifest

## Aktueller Abgleich - 14.11.2026

**READY FOR GITHUB RELEASE - lokaler Commit.** Dieser Abschnitt ersetzt widersprechende Freigabeangaben im historischen Text darunter fuer den aktuellen Commitauftrag. Staging und Commit der exakt 81 Aenderungen/Loeschungen und 48 neuen Manifest-Dateien sind ausdruecklich autorisiert. Kein Push, Deploy, Restore, weiterer Build oder echter Mailversand.

Die 129 Pfade wurden mit dem Arbeitsbaum abgeglichen; alle neuen Assets und benoetigten lokalen Quellmodule sind vorhanden. Die staged Dateiliste muss vor Commit exakt mit dem Manifest uebereinstimmen. Nur diese drei Statusdokumente werden redaktionell aktualisiert; Code, Produktdaten, Rechtstexte und Netlify-Konfiguration bleiben unveraendert.

Vorhandene Belege: audit/github-release/local-inventory.json (Secretpruefung und 96 Bildreferenzen), catalog.json (22 Produkte, 113 Varianten, 119 Bildreferenzen, keine fehlenden Bilder), image-files.json (415 Rasterbilder, keine ungueltigen Dateien). Ergaenzende Originalprotokolle: audit/final-release/tsc-release.log, lint-release-final.log, vitest-release.log (26 Tests), rc-playwright.json (131 erwartet, keine unerwarteten oder uebersprungenen Tests) und netlify-release-build.log (Adapterbuild abgeschlossen). Die historischen 54/16 Tests sind separate dokumentierte Laeufe und werden damit nicht gleichgesetzt oder neu ausgefuehrt.

Der bestehende Bericht docs/DALEMANS-P0-PRODUCTION-RECOVERY.md bestaetigt authentifiziert elf Production-Variablen samt Functions-/Builds-/Runtime-Scope, ohne konkurrierende Mail-Testmodus-/Upstash-Schluessel in der damaligen Antwort. Maskierte Werte belegen keine konkreten SMTP-/Redis-Werte. Keine neue Netlify-CLI-Abfrage, kein Token-Export, keine TLS- oder Konfigurationsaenderung.

**Keine nachgewiesenen Blocker fuer den lokalen Commit.** Aktuelle private Git-/Build-/Publishing-Einstellungen, SMTP-/Redis-Semantik, echte Zustellung und Abnahme einer neuen Plattformlaufzeit bleiben Nachweisgrenzen fuer den spaeteren Produktionsablauf. Sie werden nicht als erfolgreiche Pruefung behauptet und erfordern fuer diesen Commit keine erneute Plattformabfrage. Push und Deployment benoetigen einen gesonderten Auftrag.

## Historischer Pruefstand

Stand 14.11.2026, Europe/Berlin. Entscheidung: BLOCKED; siehe Readiness-Bericht. Kein Staging, Commit, Push oder Deployment.

Ausgangscommit und remote main: `4a996fd287e793df0dc820574a6a8fb2c26f5b90`. Lokaler Branch main; alle nachstehenden Änderungen liegen in der Arbeitskopie. Vor einem späteren Commit erneut prüfen, da die Liste eine Momentaufnahme ist. Bestehende Änderungen nicht verworfen. Anzahl geänderter/getilgter versionierter Dateien: **81**. Neue vorgeschlagene Release-/Test-/Dokumentationsdateien: **48**. Neue ausgeschlossene interne/temporäre Dateien: **278**. Alle neuen Dateien insgesamt: **326** (ohne ignorierte Dateien).

## Umfang und Konfiguration

Produktdaten, Navigation, Gleiter-Finder, Warenkorb, vollständige Rechnungs-/optionale Lieferadresse, Formulare und Mailtemplates sind in den aufgeführten src-Dateien enthalten. Aktuell exportierter öffentlicher Katalog: 22 Produkte, 113 Varianten, 119 Bildreferenzen; keine fehlenden Katalogbilder. Rechtstextänderungen wurden als bestehender Releaseinhalt aufgenommen, in diesem Auftrag nicht verändert.

netlify.toml muss neu aufgenommen werden: Node 22, npm run build, .next, Next.js-Adapter. package.json ist bereits versioniert und unverändert; package-lock.json wurde vor diesem Auftrag geändert und muss mitgeführt werden. next.config.mjs ist unverändert versioniert. Kein Export-only-Modus. .env.example ist geändert, bleibt Vorlage ohne Secrets.

## Geänderte/getilgte versionierte Dateien (vollständig)

- `M	.env.example`
- `M	eslint.config.mjs`
- `M	package-lock.json`
- `M	playwright.config.ts`
- `M	src/app/api/contact/route.ts`
- `M	src/app/datenschutz/page.tsx`
- `D	src/app/icon.png`
- `M	src/app/impressum/page.tsx`
- `M	src/app/kontakt/page.tsx`
- `M	src/app/layout.tsx`
- `M	src/app/page.tsx`
- `M	src/app/produkte/[slug]/page.tsx`
- `M	src/app/produkte/artikel/[handle]/page.tsx`
- `M	src/app/produkte/gleiter-finder/page.tsx`
- `M	src/app/produkte/layout.tsx`
- `M	src/app/produkte/reihenverbinder/page.tsx`
- `M	src/app/produkte/sortiment/[collection]/page.tsx`
- `M	src/app/produkte/stapelstuehle/[slug]/page.tsx`
- `M	src/app/produkte/stapelstuehle/page.tsx`
- `M	src/app/sitemap.ts`
- `M	src/components/AccessoriesHub.tsx`
- `M	src/components/ContactForm.tsx`
- `M	src/components/Footer.tsx`
- `M	src/components/StructuredData.tsx`
- `M	src/components/commerce/CommerceMedia.tsx`
- `M	src/components/commerce/CommercePrice.tsx`
- `M	src/components/commerce/ConfiguratorPricing.tsx`
- `M	src/components/commerce/InquiryCartSummary.tsx`
- `M	src/components/commerce/PriceDisplayProvider.tsx`
- `M	src/components/commerce/ProductVariantSelector.tsx`
- `M	src/components/commerce/cart/CartDrawer.tsx`
- `M	src/components/commerce/cart/CartLine.tsx`
- `M	src/components/commerce/cart/CartProvider.tsx`
- `M	src/components/home/HeroCarousel.tsx`
- `M	src/components/legal/LegalDocument.tsx`
- `M	src/components/search/SearchResultGroups.tsx`
- `M	src/components/shop/ShopNavigation.tsx`
- `M	src/lib/commerce/cart/lines.ts`
- `M	src/lib/commerce/cart/local.ts`
- `M	src/lib/commerce/providers/local-data.ts`
- `M	src/lib/commerce/providers/local-glider-products.ts`
- `M	src/lib/commerce/providers/local-price-list-products.ts`
- `M	src/lib/commerce/providers/local-stacking-chairs.ts`
- `M	src/lib/commerce/publication.ts`
- `M	src/lib/commerce/service.ts`
- `M	src/lib/commerce/types.ts`
- `M	src/lib/company.ts`
- `M	src/lib/finder/recommend.ts`
- `M	src/lib/inquiry/server.ts`
- `M	src/lib/inquiry/types.ts`
- `M	src/lib/knowledge/guides.ts`
- `M	src/lib/legal-content.ts`
- `M	src/lib/privacy-technical.ts`
- `M	src/lib/products.ts`
- `M	src/lib/search/index.ts`
- `M	src/lib/search/types.ts`
- `M	src/lib/seo.ts`
- `M	src/lib/server/form-protection.ts`
- `M	tests/cart.spec.ts`
- `M	tests/commerce.spec.ts`
- `M	tests/finder.spec.ts`
- `M	tests/form-protection.test.ts`
- `M	tests/glider-products.spec.ts`
- `M	tests/home-hero.spec.ts`
- `M	tests/inquiry.spec.ts`
- `M	tests/navigation.spec.ts`
- `M	tests/p0-release-blockers.spec.ts`
- `M	tests/prelaunch.spec.ts`
- `M	tests/price-list-tiers.spec.ts`
- `M	tests/product-detail-system.spec.ts`
- `M	tests/room-planner-wp05.spec.ts`
- `M	tests/room-planner-wp11.spec.ts`
- `M	tests/room-planner-wp15.spec.ts`
- `M	tests/room-planner-wp16.spec.ts`
- `M	tests/room-planner-wp1632.spec.ts`
- `M	tests/room-planner-wp182a-visual.spec.ts`
- `M	tests/room-planner-wp182b-visual.spec.ts`
- `M	tests/search.spec.ts`
- `M	tests/shop-navigation.spec.ts`
- `M	tests/stacking-chairs.spec.ts`
- `M	tests/table-frame-content.spec.ts`

Die Löschung von src/app/icon.png gehört zum vorhandenen Stand; public/favicon.png und die bestehende Metadatenreferenz werden mitgeführt. Vor Commit auch Löschungen prüfen.

## Neue vorgeschlagene Dateien (vollständig)

- `docs/DALEMANS-GITHUB-DEPLOYMENT.md`
- `docs/DALEMANS-GITHUB-RELEASE-MANIFEST.md`
- `docs/DALEMANS-GITHUB-RELEASE-READINESS.md`
- `netlify.toml`
- `public/favicon.png`
- `public/legal/QUELLE.md`
- `public/legal/eu-gewaehrleistung-de.svg`
- `public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypAH_1.webp`
- `public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE_1.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_1021_ungepolstert.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Buende_a.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Coburg_ungepolstert.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Erfurt_a.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Nuernberg_a.webp`
- `public/neue bilder/Tische/t210.webp`
- `public/neue bilder/Zubehör/stopfen-sortiment.webp`
- `src/app/agb/page.tsx`
- `src/app/produkte/template.tsx`
- `src/app/widerruf/page.tsx`
- `src/app/widerruf/print.css`
- `src/components/RowConnectorInquiry.tsx`
- `src/components/finder/StandardGliderFinder.tsx`
- `src/components/legal/ConsumerGuaranteeNotice.tsx`
- `src/lib/commerce/glider-navigation.ts`
- `src/lib/commerce/price-display.ts`
- `src/lib/commerce/product-structured-data.ts`
- `src/lib/consumer-information.ts`
- `src/lib/finder/standard.ts`
- `src/lib/inquiry/contact.ts`
- `tests/book-rack-gallery.spec.ts`
- `tests/form-protection-configuration.test.ts`
- `tests/glider-finalization.test.ts`
- `tests/glider-navigation.spec.ts`
- `tests/glider-navigation.test.ts`
- `tests/hero-image-loading.spec.ts`
- `tests/inquiry-address.test.ts`
- `tests/navigation-actions.spec.ts`
- `tests/price-display-preference.spec.ts`
- `tests/row-connectors.spec.ts`
- `tests/widerruf-release.spec.ts`
- `tests/wp22-legal.spec.ts`
- `tests/wp23-product-structured-data.spec.ts`
- `tests/wp23-search-metadata.spec.ts`
- `tests/wp24-seo-images.spec.ts`
- `tests/wp25-b2c.spec.ts`
- `tests/wp26-release.spec.ts`
- `tests/wp27-mail.test.ts`
- `vitest.config.ts`

## Neue benötigte öffentliche Assets (vollständig)

- `public/favicon.png`
- `public/legal/QUELLE.md`
- `public/legal/eu-gewaehrleistung-de.svg`
- `public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypAH_1.webp`
- `public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE_1.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_1021_ungepolstert.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Buende_a.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Coburg_ungepolstert.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Erfurt_a.webp`
- `public/neue bilder/Stapelstühle/neu_beschriftet/Stapelstuhl_Nuernberg_a.webp`
- `public/neue bilder/Tische/t210.webp`
- `public/neue bilder/Zubehör/stopfen-sortiment.webp`

Bereits versionierte Assets bleiben Bestandteil des vollständigen Git-Checkouts. Explizite geprüfte Quellpfade inklusive Logo/Hero: audit/github-release/local-inventory.json (assets). Dort 96 Referenzen, keine fehlend oder ignoriert. Alle 415 öffentlichen Rasterdateien sind lesbar. _next/static wird beim Build erzeugt und nicht eingecheckt.

## Neue ausgeschlossene interne Berichte/temporäre Dateien (vollständig)

- `BILDER-SEO-GEO-AUDIT.md`
- `DALEMANS-FINAL-RELEASE-AUDIT.md`
- `DEV-PRODUKT-AUDIT.md`
- `GLEITER-FINALISIERUNG.md`
- `GLEITER-SORTIMENT-AUDIT.md`
- `RECHTSTEXTE-FINALISIERUNG.md`
- `WIDERRUF-RELEASE-CHECK.md`
- `WP24-SEO-GEO-OPTIMIERUNG.md`
- `WP25-RECHTSTEXTE-ABGLEICH.md`
- `WP26-FINAL-PRE-LAUNCH-REPORT.md`
- `WP27-FINAL-RELEASE-GATE.md`
- `WP27-RECHTLICHE-FREIGABEPUNKTE.md`
- `audit/P0-FORM-PROTECTION-CONFIGURATION.md`
- `audit/WP26-TEST-FINDINGS.md`
- `audit/WP27-GPSR-PRODUKTE.json`
- `audit/WP27-SECRET-SCAN.json`
- `audit/WP27-TEST-FINDINGS.md`
- `audit/final-release/acceptance-extra.json`
- `audit/final-release/acceptance-finder.json`
- `audit/final-release/acceptance-http.json`
- `audit/final-release/acceptance-images-full.json`
- `audit/final-release/acceptance-interactions-final.json`
- `audit/final-release/acceptance-playwright.json`
- `audit/final-release/acceptance-runtime.json`
- `audit/final-release/acceptance-variants.json`
- `audit/final-release/adapter-smoke.json`
- `audit/final-release/adapter-smoke.mjs`
- `audit/final-release/api-configuration.json`
- `audit/final-release/artifact-backups.json`
- `audit/final-release/audit/final-release/rc-playwright.json`
- `audit/final-release/blocker-resolution-checks.json`
- `audit/final-release/browser-after-carousel.json`
- `audit/final-release/browser-audit.mjs`
- `audit/final-release/browser-before.json`
- `audit/final-release/browser-preliminary.json`
- `audit/final-release/browser.json`
- `audit/final-release/buchablage-nachruesten-1440.png`
- `audit/final-release/buchablage-nachruesten-390.png`
- `audit/final-release/final-git-status.txt`
- `audit/final-release/function-artifact.json`
- `audit/final-release/function-hash.json`
- `audit/final-release/functions-serve-help.txt`
- `audit/final-release/gleiter-bodenschutz-1440.png`
- `audit/final-release/gleiter-bodenschutz-390.png`
- `audit/final-release/home-1440.png`
- `audit/final-release/home-390.png`
- `audit/final-release/image-inventory.json`
- `audit/final-release/image-sheets.mjs`
- `audit/final-release/images-0.png`
- `audit/final-release/images-1.png`
- `audit/final-release/images-2.png`
- `audit/final-release/images-3.png`
- `audit/final-release/images-4.png`
- `audit/final-release/images-5.png`
- `audit/final-release/initial-git-status.txt`
- `audit/final-release/inventory.config.mts`
- `audit/final-release/inventory.json`
- `audit/final-release/inventory.test.ts`
- `audit/final-release/kontakt-1440.png`
- `audit/final-release/kontakt-390.png`
- `audit/final-release/last-regression.json`
- `audit/final-release/legal-hashes.json`
- `audit/final-release/legal-unchanged.json`
- `audit/final-release/live.json`
- `audit/final-release/live.mjs`
- `audit/final-release/netlify-build-help.txt`
- `audit/final-release/netlify-serve-help.txt`
- `audit/final-release/npm-audit.json`
- `audit/final-release/playwright-final.json`
- `audit/final-release/playwright-release.json`
- `audit/final-release/playwright-verified.json`
- `audit/final-release/playwright.json`
- `audit/final-release/preview-check.json`
- `audit/final-release/preview-check.mjs`
- `audit/final-release/preview-deploy-api.json`
- `audit/final-release/preview-http.json`
- `audit/final-release/preview-http.mjs`
- `audit/final-release/preview-site-after.json`
- `audit/final-release/preview-site-before.json`
- `audit/final-release/preview.playwright.config.ts`
- `audit/final-release/production-comparison-live.json`
- `audit/final-release/production-comparison-section.md`
- `audit/final-release/production-comparison.json`
- `audit/final-release/production-preservation.json`
- `audit/final-release/production-release-deploy-before.json`
- `audit/final-release/production-release-outcome.json`
- `audit/final-release/production-release-publish.mjs`
- `audit/final-release/production-release-report.md`
- `audit/final-release/production-release-site-before.json`
- `audit/final-release/production-release-worktree-before.json`
- `audit/final-release/rc-address-desktop.png`
- `audit/final-release/rc-address-mobile.png`
- `audit/final-release/rc-address-runtime.json`
- `audit/final-release/rc-address-runtime.mjs`
- `audit/final-release/rc-build-backup.txt`
- `audit/final-release/rc-deploy-api-superseded.json`
- `audit/final-release/rc-deploy-api.json`
- `audit/final-release/rc-deploy-superseded.json`
- `audit/final-release/rc-deploy.json`
- `audit/final-release/rc-final-git-status.txt`
- `audit/final-release/rc-git-status.txt`
- `audit/final-release/rc-inventory.config.mts`
- `audit/final-release/rc-inventory.json`
- `audit/final-release/rc-inventory.test.ts`
- `audit/final-release/rc-playwright.json`
- `audit/final-release/rc-runtime-superseded.json`
- `audit/final-release/rc-runtime.json`
- `audit/final-release/rc-runtime.mjs`
- `audit/final-release/rc-site-after.json`
- `audit/final-release/rc-site-before.json`
- `audit/final-release/rc.playwright.config.ts`
- `audit/final-release/reihenverbinder-1440.png`
- `audit/final-release/reihenverbinder-390.png`
- `audit/final-release/report.mjs`
- `audit/final-release/security.json`
- `audit/final-release/security.mjs`
- `audit/final-release/seminarklapptisch-210c-1440.png`
- `audit/final-release/seminarklapptisch-210c-390.png`
- `audit/final-release/stapelstuehle-1440.png`
- `audit/final-release/stapelstuehle-390.png`
- `audit/final-release/targeted.json`
- `audit/final-release/test-network-review.txt`
- `audit/final-release/verify-preservation.mjs`
- `audit/final-release/visual-review.png`
- `audit/github-release/browser.json`
- `audit/github-release/catalog.json`
- `audit/github-release/http.json`
- `audit/github-release/image-files.json`
- `audit/github-release/local-inventory.json`
- `audit/github-release/netlify-readonly.json`
- `audit/netlify-restore/check-20261114T144117414Z-c9303502b96a4bba8bb222d2ca9d0ca5.json`
- `audit/rechtstexte/agb-1440.png`
- `audit/rechtstexte/agb-390.png`
- `audit/rechtstexte/datenschutz-1440.png`
- `audit/rechtstexte/datenschutz-390.png`
- `audit/rechtstexte/impressum-1440.png`
- `audit/rechtstexte/impressum-390.png`
- `docs/DALEMANS-DEPLOYMENT-RULES.md`
- `docs/DALEMANS-P0-PRODUCTION-RECOVERY.md`
- `docs/NETLIFY-VERIFIED-RESTORE.md`
- `docs/WP22-RECHTLICHE-INHALTE.md`
- `docs/WP27-STAGING-ABNAHME.md`
- `scripts/netlify-verified-restore.ps1`
- `tmp/agb-before-hashes.json`
- `tmp/agb-original-1440.png`
- `tmp/agb-original-390.png`
- `tmp/agb-original-blocks.json`
- `tmp/agb-original-mobile-review.png`
- `tmp/agb-original-source.html`
- `tmp/agb-title.png`
- `tmp/datenschutz-title.png`
- `tmp/github-release-audit.mjs`
- `tmp/github-release-http.mjs`
- `tmp/github-release-local.mjs`
- `tmp/github-release-manifest.mjs`
- `tmp/glider-navigation-1440.png`
- `tmp/glider-navigation-390.png`
- `tmp/inquiry-address-business-false.png`
- `tmp/inquiry-address-business-true.png`
- `tmp/inquiry-address-private-false.png`
- `tmp/inquiry-address-private-true.png`
- `tmp/legal-editorial-removals.txt`
- `tmp/legal-visual-review.jpg`
- `tmp/reihenverbinder-1440.png`
- `tmp/reihenverbinder-390.png`
- `tmp/release-blocker-presence.json`
- `tmp/release-inventory.test.ts`
- `tmp/release-vitest.config.mts`
- `tmp/verify-original-agb.cjs`
- `tmp/widerruf-release/1440.png`
- `tmp/widerruf-release/360.png`
- `tmp/widerruf-release/768.png`
- `tmp/widerruf-release/consumer-information.before.ts`
- `tmp/widerruf-release/print-1.png`
- `tmp/widerruf-release/print-2.png`
- `tmp/widerruf-release/print-3.png`
- `tmp/widerruf-release/widerruf.pdf`
- `tmp/wp23-adjust.mjs`
- `tmp/wp23-audit.mjs`
- `tmp/wp23-data.cjs`
- `tmp/wp23-html.mjs`
- `tmp/wp23-live-icon.png`
- `tmp/wp23-live.mjs`
- `tmp/wp23-live/assets.json`
- `tmp/wp23-live/routes.json`
- `tmp/wp23-probe.mjs`
- `tmp/wp23-report.mjs`
- `tmp/wp23-sheet.mjs`
- `tmp/wp23-verify.mjs`
- `tmp/wp23/assets.json`
- `tmp/wp23/html.json`
- `tmp/wp23/probes.json`
- `tmp/wp23/products.json`
- `tmp/wp23/routes.json`
- `tmp/wp23/sheet-1.png`
- `tmp/wp23/sheet-2.png`
- `tmp/wp23/sheet-3.png`
- `tmp/wp23/sheet-4.png`
- `tmp/wp23/sheet-index.json`
- `tmp/wp23/summary.json`
- `tmp/wp23/uses.json`
- `tmp/wp24-all.png`
- `tmp/wp24-fix.cjs`
- `tmp/wp24-image-changes.json`
- `tmp/wp24-klapp-rest.png`
- `tmp/wp24-klapp.png`
- `tmp/wp24-optimize.cjs`
- `tmp/wp24-quality.png`
- `tmp/wp24-view-0.png`
- `tmp/wp24-view-1.png`
- `tmp/wp24-view-2.png`
- `tmp/wp24-view-3.png`
- `tmp/wp25-cart-390.png`
- `tmp/wp25-eu-notice-svg.zip`
- `tmp/wp25-guarantee-preview.png`
- `tmp/wp25-inquiry-390.png`
- `tmp/wp25-kontakt-1440.png`
- `tmp/wp25-kontakt-360.png`
- `tmp/wp25-widerruf-1440.png`
- `tmp/wp25-widerruf-360.png`
- `tmp/wp26-audit-dry.json`
- `tmp/wp26-audit.json`
- `tmp/wp26-browser-audit.json`
- `tmp/wp26-browser-audit.mjs`
- `tmp/wp26-browser-summary-final.json`
- `tmp/wp26-browser-summary.json`
- `tmp/wp26-cart/.last-run.json`
- `tmp/wp26-check-final.mjs`
- `tmp/wp26-e2e-final.json`
- `tmp/wp26-e2e.json`
- `tmp/wp26-extract.mjs`
- `tmp/wp26-failures.json`
- `tmp/wp26-final-tests/.last-run.json`
- `tmp/wp26-final-tests/room-planner-wp1841-A-–-Ra-1e455-n-im-befüllten-Tischbereich/01-vor-rahmen.png`
- `tmp/wp26-final-tests/room-planner-wp1841-A-–-Ra-1e455-n-im-befüllten-Tischbereich/02-waehrend-rahmen.png`
- `tmp/wp26-final-tests/room-planner-wp1841-A-–-Ra-1e455-n-im-befüllten-Tischbereich/03-nach-auswahl.png`
- `tmp/wp26-final-tests/room-planner-wp1841-B-–-au-3ffca-e-Undo-Redo-bleiben-korrekt/04-nach-verschieben.png`
- `tmp/wp26-final-tests/room-planner-wp1841-C-–-St-f2a22-e-Möbel-mit-eindeutigen-IDs/05-nach-duplizieren.png`
- `tmp/wp26-findings.mjs`
- `tmp/wp26-home-1280.png`
- `tmp/wp26-home-1440.png`
- `tmp/wp26-home-1920.png`
- `tmp/wp26-home-360.png`
- `tmp/wp26-home-390.png`
- `tmp/wp26-home-768.png`
- `tmp/wp26-klapptisch-310c-1280.png`
- `tmp/wp26-klapptisch-310c-1440.png`
- `tmp/wp26-klapptisch-310c-1920.png`
- `tmp/wp26-klapptisch-310c-360.png`
- `tmp/wp26-klapptisch-310c-390.png`
- `tmp/wp26-klapptisch-310c-768.png`
- `tmp/wp26-kontakt-1280.png`
- `tmp/wp26-kontakt-1440.png`
- `tmp/wp26-kontakt-1920.png`
- `tmp/wp26-kontakt-360.png`
- `tmp/wp26-kontakt-390.png`
- `tmp/wp26-kontakt-768.png`
- `tmp/wp26-last-smoke.json`
- `tmp/wp26-last-smoke/.last-run.json`
- `tmp/wp26-raumplaner-1280.png`
- `tmp/wp26-raumplaner-1440.png`
- `tmp/wp26-raumplaner-1920.png`
- `tmp/wp26-raumplaner-360.png`
- `tmp/wp26-raumplaner-390.png`
- `tmp/wp26-raumplaner-768.png`
- `tmp/wp26-reviewed-diff.patch`
- `tmp/wp26-stress/.last-run.json`
- `tmp/wp26-verification.json`
- `tmp/wp26-view-home-390.png`
- `tmp/wp26-view-klapptisch-310c-360.png`
- `tmp/wp27-env-presence.json`
- `tmp/wp27-findings.py`
- `tmp/wp27-full.json`
- `tmp/wp27-git-status.txt`
- `tmp/wp27-inventory.config.mts`
- `tmp/wp27-inventory.test.ts`
- `tmp/wp27-secret-scan.py`
- `tmp/wp27-targeted.json`

Diese Dateien lokal behalten, nicht pauschal stagen. audit/ enthält historische HTTP-/Browserbelege und Mail-/Testdiagnostik; tmp/ enthält Wegwerf-Prüfprogramme. Root-Auditberichte und ältere Recoverydokumente sind keine Laufzeitabhängigkeiten und werden für diesen Release nicht neu vorgeschlagen. Kein neuer Ausschluss bestehender versionierter Dateien.

## Ignorierte Inhalte

.env, .env.*, node_modules, .next, .netlify, .vercel, test-results, playwright-report, Logs und tsconfig.tsbuildinfo bleiben draußen. Ausnahme .env.example ist absichtlich versionierbar. Kein benötigtes geprüftes Bild durch .gitignore ausgeschlossen. Keine Änderung an .gitignore nötig.

## Sicherheit, Tests und Grenzen

Keine Treffer bei Abgleich der vorgesehenen Dateiinhalte gegen lokal verfügbare geheime Token-/Passwort-/Saltwerte, Private-Key- und GitHub-Tokenmuster. Keine vollständige Garantie für unbekannte Secrets/Personendaten; finale Inhaltsprüfung vor Staging erforderlich. Lokale .env nur in-memory für Vergleich gelesen, keine Werte ausgegeben. Interne/temp-Dateien nicht Teil dieses Vorschlags.

TypeScript, Lint und Next-Produktionsbuild erfolgreich; 54 Unit-Tests, 16 gezielte Playwright-Tests und eine zusätzliche Katalogprüfung erfolgreich. Next erzeugte 75 statische Seiten sowie SSR/API-Routen und 72 JS-Dateien. Alle 415 Bilder mit Sharp-Metadaten geprüft. Build nutzt lokale .env und beweist keine aktuellen Cloudvariablen. Private Netlify-Buildsettings, aktuelle Production-Variablen und finale Dateifreigabe bleiben offen. Details: DALEMANS-GITHUB-RELEASE-READINESS.md. Ablauf: DALEMANS-GITHUB-DEPLOYMENT.md.
