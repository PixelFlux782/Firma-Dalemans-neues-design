# Stoffkarten-Synchronisation

## Zweck und Sicherheitsgrenze

Die öffentliche Website erhält ausschließlich die Felder `group`, `title`, `publicUrl`, `lastVerifiedAt` und `status` aus `src/lib/knowledge/fabric-cards.public.json`. Herstellerseiten und Ursprungs-URLs stehen nur im internen Manifest `config/fabric-card-sources.json`. Veröffentlichte Dateien liegen unverändert unter `public/downloads/stoffkarten/`; das Skript entfernt oder verändert kein Branding.

Die einzige erlaubte Quelle ist der HTTPS-Ursprung `https://zachert-gmbh.de`. Auch Weiterleitungen werden gegen diese Allowlist geprüft. URLs aus Kundenanfragen oder CLI-Parametern werden nicht übernommen.

## Lokale Bedienung

```bash
npm run test:fabric-cards
npm run sync:fabric-cards:check
npm run sync:fabric-cards:apply
```

`--check` schreibt keine Dateien. Die Ausgabe verwendet `unchanged`, `updated`, `needs_review` oder `error`. Exitcode `0` bedeutet: alle geprüften Zuordnungen sind freigegeben; `1`: technischer Fehler; `2`: redaktionelle Prüfung erforderlich.

Die npm-Skripte starten Node mit `--use-system-ca`. Dadurch bleibt die TLS-Zertifikatsprüfung aktiv, während auch der Zertifikatsspeicher des Betriebssystems genutzt wird; eine unsichere Abschaltung der TLS-Prüfung findet nicht statt. Voraussetzung ist Node.js 22, wie auch im Workflow konfiguriert.

`--apply` lädt ausschließlich Einträge mit `approvalStatus: "approved"`. Vorhandene letzte gültige PDFs bleiben bei HTTP-, TLS-, Timeout-, Typ-, Größen- oder PDF-Prüffehlern erhalten. Alle Downloads werden zuerst geprüft und erst danach gemeinsam mit Manifest und öffentlichem Datensatz atomar ersetzt. Maximalgröße: 25 MB. Akzeptiert werden PDF- oder Binär-Content-Type, `%PDF-` am Anfang und ein `%%EOF`-Marker am Ende.

## Freigabemechanismus

Ein neuer Link oder eine neue Gruppenzuordnung wird nie automatisch publiziert. Vorgehen:

1. `--check` ausführen und URL, SHA256, Änderungsdatum sowie Dokumentinhalt redaktionell prüfen.
2. Nutzungsrecht zum unveränderten Rehosting intern belegen. Abweichende Gestaltung oder Entfernen vorhandener Markenhinweise benötigt eine gesonderte Freigabe.
3. Im Manifest `groups` explizit setzen. Mehrere Gruppen dürfen dasselbe Dokument verwenden; niemals Gruppen aus der Trefferreihenfolge ableiten.
4. Einen sicheren Dateinamen in `currentPublicFilename` eintragen und `approvalStatus` auf `approved` ändern.
5. `--apply` ausführen und den Diff prüfen. Ein Hashwechsel derselben bereits freigegebenen URL und Gruppenzuordnung darf anschließend automatisch aktualisiert werden.

Wenn ein Link fehlt, 404 liefert oder ungültig ist, bleibt die letzte gültige Datei unangetastet. Ohne gültige veröffentlichte Datei bleibt der Status `pending`; die Website zeigt dann die Stoffmuster-Anfrage statt eines Downloadbuttons.

## GitHub Actions und Inbetriebnahme

`.github/workflows/sync-fabric-cards.yml` läuft am ersten Tag jedes Monats um 06:17 UTC und ist manuell startbar. Der Zeitplan ist solange wirkungslos, bis in den GitHub-Repository-Variablen `FABRIC_CARD_SYNC_ENABLED=true` gesetzt wird. Ein manueller Lauf ohne `apply` führt nur Tests und `--check` aus.

Bei einem freigegebenen Wechsel erzeugt der Workflow einen Pull Request, statt direkt in `main` zu schreiben. Dafür benötigt `GITHUB_TOKEN` die im Workflow deklarierten Rechte `contents: write` und `pull-requests: write`; unter **Settings → Actions → General → Workflow permissions** muss Schreibzugriff zulässig sein. Branch-Schutz kann und soll die Zusammenführung weiter blockieren, bis ein Mensch geprüft hat. Fork- oder Organisationsrichtlinien können Schreibrechte zusätzlich einschränken.

Die lokale `.vercel/project.json` zeigt eine Projektverknüpfung, belegt aber keine aktive Git-Integration oder Deployment-Regel. In Vercel ist separat zu prüfen, ob Pull Requests nur Preview-Deployments und erst ein Merge in den Produktionsbranch ein Live-Deployment auslösen. Für den Abruf selbst sind keine zusätzlichen Secrets vorgesehen.

## Audit und Fehlerfälle

Das Manifest hält je Kandidat bzw. freigegebenem Dokument `groups`, `sourcePage`, `sourcePdfUrl`, `sha256`, `sourceCheckedAt`, `currentPublicFilename`, `approvalStatus` und optionale Notizen. Der Workflow lädt seinen Textbericht als Artefakt hoch. Das PDF selbst wird bytegleich gespeichert; der SHA256 dokumentiert seinen Inhalt.

Die Linksuche verarbeitet absolute und relative HTML-Links. Liefert die Quellseite nur ein JavaScript-/Shopware-Grundgerüst, werden ausschließlich explizit gepflegte Manifest-URLs geprüft. Ein neuer Fund erhält `needs_review`; unbekannte Dokumente werden auch bei gültiger PDF-Signatur nicht als geeignet angenommen.

## Aktueller Erstbefund (09.10.2026)

- Quellseite: `https://zachert-gmbh.de/stoffe-und-leder.html`
- Bekannter Kandidat: `https://zachert-gmbh.de/media/pdf/5a/48/83/Stoffmuster57e3d69143d40.pdf`
- Live-Validierung: HTTP 200, `application/pdf`, 2.393.705 Byte, Server-Änderungsdatum `Tue, 04 Jun 2019 21:35:35 GMT`, SHA256 `af2a84f4e3854b0de15dee97526e2f6243017522b3df1f50f87cb6a2776db353`.
- Inhaltsprüfung: 12 Seiten, sichtbares Zachert-Branding, Dokumentstand Januar 2015, Stoffgruppen 2 bis 7. Das ist kein Nachweis einer aktuellen Kollektion.
- Status: `needs_review`; nicht freigegeben. Die Quellseite enthielt beim Live-Check keine direkt erkennbaren PDF-Links.
- Mapping-Vorschlag: Gruppen 2, 3 und 4 gemeinsam, ausschließlich zur manuellen Prüfung; keine Veröffentlichung.

Die Live-Daten wurden nach der Sichtprüfung im internen Manifest protokolliert. Das ist keine redaktionelle oder rechtliche Veröffentlichungsfreigabe; dafür bleibt `approvalStatus: "needs_review"` maßgeblich.
