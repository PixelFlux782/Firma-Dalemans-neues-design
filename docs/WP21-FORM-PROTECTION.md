# WP21 – Produktiver Formularschutz mit Upstash Redis

Kontaktformular und Warenkorbanfrage verwenden einen gemeinsamen, ausschließlich
serverseitigen Upstash-Redis-Speicher. Es gibt keinen lokalen Map-Fallback. Die
SMTP-Konfiguration und die E-Mail-Inhalte bleiben unverändert.

## Konfiguration

In Netlify müssen beide Werte eines der folgenden Variablenpaare gesetzt sein:

- `FORM_PROTECTION_REST_URL` und `FORM_PROTECTION_REST_TOKEN` (bevorzugt), oder
- `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` (kompatibler Fallback).

In Netlify Serverless Functions ist `x-nf-client-connection-ip` der von Netlify
bereitgestellte Einzelwert für die IP, die sich mit dem CDN verbunden hat. Der
Next.js-Netlify-Adapter reicht den eingehenden `Request` und damit diesen Header
an die API-Route weiter. Die Anwendung verwendet ausschließlich diesen festen
Header und nur, wenn die reservierte, schreibgeschützte Netlify-Laufzeitvariable
`SITE_ID` vorhanden ist. Frei wählbare Headernamen, `Forwarded`,
`x-forwarded-for` und `x-real-ip` werden nie ausgewertet. Listen und ungültige
IP-Werte werden verworfen. Außerhalb der Netlify-Vertrauensgrenze wird auch ein
vom Client mitgesendeter `x-nf-client-connection-ip` ignoriert.

Netlify entfernt beziehungsweise setzt seine internen `X-Nf-*`-Header am Edge;
der spezielle `X-Nf-Client-Connection-Ip` gehört zu den bewusst an Functions
weitergereichten Plattform-Headern. Daher kann eine beliebige Client-Angabe den
in Produktion gelesenen Wert nicht ersetzen. Diese Garantie gilt nur, solange
die API ausschließlich über Netlify erreichbar ist und kein vorgeschalteter
Proxy die Plattform-Vertrauensgrenze verändert.

Die IP wird mit SHA-256 und
`FORM_RATE_LIMIT_HASH_SALT` gehasht; falls kein eigenes Salt gesetzt ist, dient
das Redis-Token als stabiles geheimes Salt. Weder IP noch Secret werden in Redis
oder Logs im Klartext gespeichert.

## Rate-Limit

- Kontaktformular: 5 Versuche je 15 Minuten und Client-Digest
- Warenkorbanfrage: 5 Versuche je 15 Minuten und Client-Digest
- Umsetzung: atomarer Redis-Zähler mit TTL; alle Netlify-Instanzen teilen das Limit
- Der sechste Versuch erhält HTTP 429 und einen `Retry-After`-Header.

Fehlen Netlifys `SITE_ID` oder ein gültiger Einzel-IP-Wert, fallen Anfragen auf
einen gemeinsamen anonymen Digest zurück (fail-closed statt Header-Vertrauen).

## Idempotenz

Vor dem Versand wird die Anfrage atomar über `SET ... NX` innerhalb eines
Lua-Skripts reserviert. Parallele Wiederholungen warten kurz auf das gespeicherte
Ergebnis und starten keinen zweiten SMTP-Versand.

- Kontaktformular: Erfolg wird 10 Minuten gespeichert.
- Warenkorbanfrage: Ergebnis einschließlich Anfrage-ID wird 24 Stunden gespeichert.
- SMTP-Fehler: Nur die eigene Reservierung wird atomar gelöscht; ein erneuter
  kontrollierter Versuch ist möglich.
- SMTP-Erfolg: Die Reservierung wird atomar in das serialisierte Ergebnis
  umgewandelt.

Die Reservierung besitzt von Anfang an die volle Erfolgs-TTL. Schlägt Redis erst
nach SMTP-Annahme bei der Erfolgsbestätigung fehl, wird die Reservierung bewusst
nicht gelöscht. Weitere Versuche erhalten eine kontrollierte 503-Antwort, statt
wahrscheinlich eine zweite E-Mail auszulösen.

## Ausfallverhalten und Restrisiko

Redis-Konfigurationsfehler, Nichterreichbarkeit und Timeouts führen geschlossen
zu HTTP 503. Es gibt weder einen lokalen Map-Fallback noch eine stillschweigende
Deaktivierung des Schutzes. Logs enthalten nur `component`, `route`, `event` und
`errorType`; Zugangsdaten und Kundendaten werden nicht protokolliert.

SMTP und Redis können keine gemeinsame Transaktion bilden. Stirbt die Function
nach SMTP-Annahme oder kann das Ergebnis nicht bestätigt werden, verhindert die
verbleibende Reservierung Doppelversand bis zum TTL-Ablauf. Danach bleibt bei
einem erneuten Absenden ein unvermeidbares Restrisiko für eine doppelte E-Mail.
Ein dauerhaftes Blockieren über die TTL hinaus wurde bewusst vermieden.

## Redis-Schlüssel und Kosten

Alle Schlüssel beginnen mit `dalemans:forms:v1` und laufen automatisch ab. Ein
Rate-Limit-Versuch benötigt ein Lua-Skript; Reservieren, Abschließen oder
Freigeben der Idempotenz erfolgt jeweils ebenfalls atomar in einem Redis-Aufruf.
Nur parallele Wiederholungen pollen mit begrenztem exponentiellem Backoff.
