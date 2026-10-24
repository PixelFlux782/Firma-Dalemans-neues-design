# WP06 – Medienbibliothek und Bildoptimierung

Stand: 23. Oktober 2026  
Scope: zentrale Medienstruktur, sichere Migration und priorisierte Optimierung von maximal 20 tatsächlich verwendeten Bildern  
Ergebnis: **technisch abgeschlossen; Bildrechte-Freigabe P1-010 bleibt offen**

## 1. Ergebnis

- 20 priorisierte Hero-, Kategorie-, Produkt-, Unternehmens-, Referenz-, Raumplanungs- und Brandingbilder wurden nach `public/images/` migriert, professionell benannt und als WebP ausgegeben.
- Die sieben vereinbarten Zielordner `produkte`, `kategorien`, `unternehmen`, `referenzen`, `website`, `raumplaner` und `branding` sind angelegt und enthalten zusammen genau diese 20 migrierten Dateien.
- 20 ersetzte Originaldateien und eine zusätzliche, unreferenzierte WebP-Dublette wurden erst nach erfolgreichem Build und Browsertest aus `public/` entfernt.
- Alle kontrollierten React-/Next.js-, Produktdaten-, Metadaten-, Structured-Data-, Logo- und Testreferenzen wurden aktualisiert. 20 permanente Next.js-Redirects halten die bisherigen öffentlichen Bild-URLs kompatibel.
- `public/models/`, GLB-/GLTF-Dateien und eingebettete 3D-Texturen wurden nicht verändert.
- Externe Shopify-Bildquellen wurden nicht heruntergeladen oder lokal dupliziert.

Die vollständige Zuordnung und das Bestandsinventar stehen in `audit/prelaunch/WP06-IMAGE-MANIFEST.csv`. Das Manifest enthält 405 lokale öffentliche Bilddateien sowie eine separate Zeile für dynamische Shopify-Bilder. Der Baseline-Datensatz `audit/prelaunch/WP06-IMAGE-BASELINE.json` bewahrt die technischen Werte der entfernten Ausgangsdateien.

## 2. Neue Medienstruktur

| Zielordner | Dateien | Datenvolumen |
|---|---:|---:|
| `public/images/branding/` | 1 | 341.052 Byte |
| `public/images/kategorien/` | 4 | 1.229.396 Byte |
| `public/images/produkte/` | 3 | 708.178 Byte |
| `public/images/raumplaner/` | 3 | 546.680 Byte |
| `public/images/referenzen/` | 3 | 782.818 Byte |
| `public/images/unternehmen/` | 3 | 814.598 Byte |
| `public/images/website/` | 3 | 884.408 Byte |

Bestehende, bereits sinnvoll verwendete WebP-Dateien unter `public/images/curated/` und `public/images/optimized/` wurden nicht pauschal umgebaut. Die neue Struktur ist für den schrittweisen Folgedurchgang vorbereitet; es wurde kein zweiter Exportbestand erzeugt.

## 3. Umbenannte und optimierte Dateien

Die vollständige Alt-/Neu-Zuordnung steht im CSV-Manifest. Beispiele:

| Alter Pfad | Neuer Pfad |
|---|---|
| `public/neue bilder/produkte-hero.png` | `public/images/website/produkte-hero.webp` |
| `public/neue bilder/Stapelstühle/collage_stapelstuehle.png` | `public/images/kategorien/stapelstuehle-collage.webp` |
| `public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png` | `public/images/produkte/rednerpult-acrylglas-typ-a.webp` |
| `public/neue bilder/stefan-dalemans-portrait.png` | `public/images/unternehmen/stefan-dalemans.webp` |
| `public/pictures/Über uns/Realisierte-11.jpg` | `public/images/referenzen/gemeindesaal-referenz.webp` |
| `public/Logos/logo_transp.png` | `public/images/branding/dalemans-logo.webp` |

Sharp verarbeitet die Rasterbilder in sRGB und entfernt nicht benötigte EXIF-/ICC-Metadaten. Die Pixelmaße blieben außer beim Logo unverändert. Das transparente Logo wurde verlustfrei als WebP ausgegeben und von 1672×941 auf 1024×576 reduziert; die Transparenz blieb erhalten. Produktdetails und Freisteller erhielten die höhere WebP-Qualität 92, flächige Hero-/Raumbilder Qualität 90.

## 4. Datenvolumen und Einsparung

| Messwert | Wert |
|---|---:|
| Priorisierte Originale | 41.697.618 Byte (39,77 MiB) |
| Optimierte Dateien | 5.307.130 Byte (5,06 MiB) |
| Gemessene Einsparung | 36.390.488 Byte (34,70 MiB) |
| Relative Einsparung | **87,27 %** |
| Niedrigster gemessener PSNR-Wert | 37,82 dB |

Der gesamte öffentliche Bildbestand ohne `public/models/` umfasst jetzt 405 Dateien und 485.047.582 Byte (462,58 MiB). Gegenüber den im Bild-Audit gerundeten 497,4 MiB sind damit rund 34,8 MiB aus dem Deployment-Bestand entfernt. Die Differenz zur priorisierten Einsparung entsteht durch die ebenfalls entfernte unreferenzierte WebP-Dublette.

## 5. Aktualisierte Referenzen und URL-Kompatibilität

Aktualisiert wurden 18 Quell-/Testdateien in folgenden Bereichen:

- Startseite, Produktübersicht, Kontakt, Firma, Räume & Planung, Raumplanung, Gemeindesaal und Sonderlösungen.
- Produktkategorien, Klapptisch-Collection, Rednerpult-Daten und Home-Produktmodule.
- Open-Graph-Metadaten, Organization-/WebPage-Structured-Data und Unternehmenslogo.
- Raumplaner-Branding und SVG-Wasserzeichen.
- Zugehörige Produkt- und Raumplaner-Regressionstests.

Next.js liefert Header-, Footer- und Raumplaner-Logo jetzt über `next/image`; das frühere `unoptimized` am Raumplaner-Logo wurde entfernt. Vorhandene `sizes`-, `priority`- und Lazy-Loading-Einstellungen blieben erhalten. Hero-Bilder bleiben priorisiert, übrige `next/image`-Bilder werden weiterhin standardmäßig verzögert geladen.

Die 20 entfernten Original-URLs besitzen permanente Redirects in `next.config.mjs`. Ein Browser-/HTTP-Test hat jede alte URL bis zum neuen WebP mit Status 200 verfolgt. Damit bleiben bekannte direkte Links kompatibel, obwohl kein redundanter zweiter Bildbestand gepflegt wird.

## 6. Technische und visuelle Prüfung

### Automatisiert

| Prüfung | Ergebnis |
|---|---|
| Statische/dynamische Referenzprüfung | 208 Referenzen geprüft, keine fehlende Datei |
| TypeScript (`tsc --noEmit`) | bestanden |
| Gezieltes ESLint | bestanden |
| `git diff --check` | bestanden |
| Production Build | bestanden; 74 statische Seiten |
| Neue Medienpfade | 20/20 direkt mit HTTP 200 und `image/webp` |
| Kompatible Altpfade | 20/20 folgen Redirect zum neuen WebP |
| WP06 Desktop/Mobile und Zuordnungen | 5/5 bestanden |
| Relevante Produkt-/Raumplaner-Regressionen | 8/8 bestanden |

Die Browserprüfung deckte bei 1440×900 und 390×844 zehn Kernrouten ab: Startseite, Produkte, Firma, Kontakt, Räume & Planung, Raumplanung, Gemeindesaal, Klapptisch-Collection, Stapelstühle und Raumplaner. Es gab keine Bild-404, keine fehlgeschlagenen Bildrequests und kein gerendertes `<img>` mit `naturalWidth === 0`. Produktgalerie-Wechsel, Rednerpult-Zuordnung, Raumplaner-Modell/Bedarf sowie Tür-/Hindernis-Persistenz blieben grün.

### Visuell

- Beide Kontaktbögen `wp06-comparison-01.webp` und `wp06-comparison-02.webp` wurden geprüft; alle 20 Vorher-/Nachher-Paare sind bei Schärfe, Farbe, Proportion, Zuschnitt und Produktdarstellung unauffällig.
- Repräsentative Desktop-Aufnahmen für Produkte und Firma sowie Mobile-Aufnahmen für Startseite und Raumplanung wurden geprüft. Die migrierten Bilder passen weiterhin in die vorgesehenen Layouts und zeigen keine auffälligen Kompressionsartefakte.
- Die Logo-Transparenz und Darstellung in Navigation/Raumplaner blieben erhalten.
- Nicht erneut in WP06 visuell geprüft wurden die übrigen 385 lokalen Bestandsbilder. Für sie gilt weiterhin die Kontaktbogenbewertung aus `04-IMAGE-AUDIT.md`; eine erneute 100-%-Zoom-Freigabe wurde nicht behauptet.

## 7. Hosting und Export

`public/images/` ist die maßgebliche Zielbibliothek für neu migrierte lokale Websitebilder. Vercel/Next.js kann diese Dateien direkt beziehungsweise über `next/image` ausliefern.

`scripts/export-used-images.mjs` kopiert bei Bedarf anhand des Manifests die als lokal geführten Medien samt Ordnerstruktur in ein Projekt-Unterverzeichnis:

```text
node scripts/export-used-images.mjs exports/website-images
```

Es wurde bewusst kein Exportverzeichnis erzeugt. Shopify-/Commerce-URLs werden vom Export ausgelassen. `scripts/generate-image-manifest.mjs` aktualisiert das Manifest; `scripts/verify-image-references.mjs` prüft direkte und bekannte dynamische Bildpfade. Das einmalige Sharp-Migrationsrezept und seine Zuordnung stehen in `scripts/optimize-image-library.mjs` und `scripts/image-library.config.mjs`.

## 8. Bildrechte / P1-010

Es wurde keine rechtliche Freigabe erfunden. Aus Repository und Dateien ist keine belastbare Rechtekette ableitbar. Das Manifest kennzeichnet daher:

- 23 Dateien, deren Namen auf KI-Bearbeitung oder KI-Erzeugung hinweisen: Generierungs- und Nutzungsnachweis erforderlich.
- eine Datei mit Hinweis auf `pngtree`: konkreter Lizenznachweis erforderlich.
- 32 Stoff-/Materialdateien beziehungsweise mögliche Hersteller-Farbkarten: Herstellerfreigabe oder Lizenz erforderlich.
- 70 mögliche Personen-, Unternehmens-, Referenz- oder Kundenfotos: Urheberrecht sowie gegebenenfalls Personen-/Kundenfreigabe erforderlich.
- Unternehmensbranding: interne Rechtebestätigung erforderlich.
- dynamische Shopify-Produktbilder: Freigabe beim Commerce-/Produktdatenverantwortlichen nachweisen.
- übrige Bestandsbilder: Herkunft und Freigabe sind im Repository nicht dokumentiert und müssen redaktionell zugeordnet werden.

Diese Kategorien sind technische/heuristische Hinweise, keine juristische Bewertung. P1-010 bleibt bis zur dokumentierten Rechte- und Einwilligungsprüfung release-offen.

## 9. Folgedurchgang

Der nächste wirtschaftlich sinnvolle Durchgang sollte sich auf weiterhin verwendete große PNGs konzentrieren, insbesondere:

- Stapelstuhl-Produkt- und Variantenbilder unter `public/neue bilder/Stapelstühle/neu_beschriftet/`.
- `Stapelstuhl_Stahlrohr_1021c_03.png` (2.450.662 Byte) und weitere häufig eingesetzte Stuhlmotive.
- `Textilproben.png` (2.344.223 Byte), jedoch erst nach Freigabe der Stofffarbtreue und Herstellerrechte.
- Gleiter-/Zubehörbilder zwischen rund 1,9 und 2,3 MB.
- `Tischtransportwagen_02.png`, `t210.png`, Schreibtablar- und Sonderlösungsbilder.
- Kleine historische Produktbilder und Stellbeispiele nicht blind hochskalieren; der Renderkontext muss einzeln bewertet werden.

Nicht exakt referenzierte Altbestände sollten erst nach redaktioneller und rechtlicher Entscheidung außerhalb des Deployments archiviert oder entfernt werden. Eine pauschale Löschung war nicht Teil dieses WP06-Durchgangs.

## 10. Verbleibende Release-Risiken

- **P1-010 bleibt offen:** Herkunft, Lizenzen sowie Personen-/Kundenfreigaben sind nicht vollständig belegt.
- Der öffentliche Bestand ist mit 462,58 MiB weiterhin groß; dieser Durchgang optimierte absichtlich nur die 20 priorisierten Dateien.
- Viele noch verwendete Produktbilder liegen weiterhin in historischen Ordnern mit uneinheitlichen Namen. Das Manifest bildet den Folgebedarf ab, eine Vollmigration wurde nicht vorgetäuscht.
- Externe Shopify-Bilder können sich außerhalb dieses Repositorys ändern; Verfügbarkeit, Optimierung und Rechte müssen am Commerce-System geprüft werden.
- Die Vorher-/Nachher-Prüfung ersetzt keine rechtsverbindliche Produktfarbfreigabe auf kalibrierten Displays oder im Druck.

Es erfolgten keine Commits, Pushes, Deployments oder Änderungen an Shoplogik, Preislogik, Produktvarianten, Raumplaner-Modellen oder 3D-Dateien.
