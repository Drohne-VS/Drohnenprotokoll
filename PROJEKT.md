# Drohne-VS-Protokoll – Projektbeschreibung

Diese Datei hält alle fachlichen Entscheidungen und technischen Eckdaten fest, damit die Arbeit
in einem neuen Chat ohne Vorwissen weitergehen kann. **Bei jeder Änderung an der App mitpflegen.**

Stand: 05.11.2026 · App-Version 2.0 (gesicherter Vorgängerstand: Zweig `release-v1.1`)

---

## 1. Zweck

Web-App der **Drohnengruppe der Feuerwehr Villingen-Schwenningen** für Einsätze und Übungen:

- laufendes **Einsatzprotokoll** durch den Techniker auf dem Einsatz-Tablet
- **Einsatz-/Übungsbericht** als PDF
- **Stunden- und Routine-Auswertung** je Kamerad (wer hat Flugpraxis, wer fliegt auch im Einsatz)

Läuft im Browser und wird auf Handy/Tablet „Zum Home-Bildschirm“ hinzugefügt. Funktioniert auch
ohne Netz (Einträge werden auf dem Gerät gepuffert und später übertragen).

Status: **Testphase**. Testdaten nur mit erfundenen Namen/Orten, bis Datenschutz geklärt ist
(Hosting bei einer US-Firma mit Rechenzentrum Frankfurt). Späterer Umzug auf einen deutschen
Server (z. B. mittwald) oder zur Stadt-IT ist vorgesehen.

---

## 2. Betrieb & Zugänge

| Was | Wo |
|---|---|
| App-Adresse | https://drohnenprotokoll.onrender.com |
| Code | GitHub `Drohne-VS/Drohnenprotokoll`, Zweig `main` |
| Gesicherte Stände | Zweig `release-v1.1` (V1.1) |
| Server | Render, Dienst `drohnenprotokoll`, ID `srv-dbid5eqjnfac73dfuhi0`, Workspace `tea-dbicmhh42hec73d2puf0`, Region Frankfurt, Tarif Starter |
| Daten | Render-Festplatte 1 GB, eingehängt unter `/pb/pb_data` (SQLite + Dateien) |
| Umgebungsvariable | `SETUP_CODE` (Einmalcode für die Ersteinrichtung des ersten Admins; Wert steht nur bei Render, **nie ins Repo schreiben**) |
| Kosten | ca. 7 $/Monat Server + 0,25 $/GB/Monat Festplatte |

**Neue Version einspielen:** auf `main` pushen und dann bei Render einen Deploy auslösen
(Render-Connector `trigger_deploy`). Auto-Deploy greift nicht zuverlässig, weil Render nicht mit
GitHub verknüpft ist. Vor jedem Deploy in `pb_public/sw.js` die Cache-Version (`CACHE = "uas-flugbuch-vNN"`)
hochzählen, damit Geräte die neue App laden. Bei geänderten Symbolen zusätzlich den `?v=N`-Zähler
an den Icon-/Manifest-Links in `index.html` und `manifest.webmanifest` erhöhen.

**Lokal testen:** PocketBase v0.40.5 (Linux-Binary von GitHub-Releases) starten mit
`SETUP_CODE=TESTCODE pocketbase serve --http=127.0.0.1:8099 --dir=<tmp> --migrationsDir=pb_migrations --hooksDir=pb_hooks --publicDir=pb_public`
und mit Playwright durchklicken (Testzugänge nur lokal anlegen).

---

## 3. Technik

- **PocketBase 0.40.5** (Go, SQLite) im Docker-Container (`Dockerfile`): Datenbank, Anmeldung,
  Dateien, Live-Updates. Liefert auch die Web-App aus `pb_public/` aus.
- **Web-App** = eine Datei `pb_public/index.html` (HTML/CSS/JS, kein Build-Schritt).
  Bibliotheken lokal in `pb_public/vendor/`: PocketBase JS-SDK 0.28.1, jsPDF 2.5.1.
- `pb_public/sw.js`: Service Worker, cached die App-Dateien (nicht `/api/`).
- Offline: Änderungen gehen in eine Warteschlange (localStorage, „Outbox“); Fotos in IndexedDB.
  Synchronisation automatisch, sobald wieder Netz da ist. IDs werden im Client erzeugt (15 Zeichen a–z0–9).
- `pb_migrations/`: Datenbankschema und **Zugriffsregeln** (serverseitig durchgesetzt).
- `pb_hooks/main.pb.js`: Ersteinrichtung (`/api/flugbuch/status`, `/api/flugbuch/setup`),
  Änderungsvermerk bei Korrektur abgeschlossener Berichte, Autor bei Protokoll/Fotos.

### Datenmodell (Collections)

| Collection | Inhalt |
|---|---|
| `users` | Anmeldung per **Benutzername**; Feld `role`: `admin` oder `tablet`; Token 30 Tage gültig |
| `config` | ein Datensatz: Einheit, Gruppe, Logo, Routine-Minuten (`routineMin30`, `routineMin90`), `meldestellen` (JSON-Liste Name/Telefon) |
| `members` | Mitglieder: Name, Qualifikation, aktiv |
| `drones` | Drohnen: Name, Modell, Kennung, aktiv, `standard` (vorausgewählt), `privat` |
| `missions` | Berichte: `typ` (einsatz/uebung), `status` (entwurf/abgeschlossen), `datum`, `data` (JSON mit allem Übrigen, s. u.) |
| `protokoll` | Protokolleinträge: mission, zeit, text, tag, autor |
| `fotos` | Bilder: mission, bild (geschützte Datei, Thumbs 400x0/1200x0), zeit, quelle (einsatzstelle/drohne), beschreibung |

`missions.data` enthält u. a.: nr, beginn, ende, stichwort, ort, anforderung (+ anforderungText),
anbindung, wetter {lage, wind, sicht}, meldungen {Name: Uhrzeit}, team [{memberId, funktion, ort, von, bis}],
flights [Abschnitte, s. u.], nextCrew, droneId, ergebnis, besonderheiten, aenderungen,
optional einsatzleiter, auftrag, positions, luftraum.

---

## 4. Rollen & Rechte

| | Admin | Einsatz-Tablet |
|---|---|---|
| Berichte anlegen, Protokoll, Fotos, PDF, abschließen | ✅ | ✅ |
| Abgeschlossene Berichte sehen/korrigieren/wieder öffnen | ✅ (mit Änderungsvermerk) | ❌ (verschwinden vom Tablet) |
| Protokolleinträge, Fotos, Berichte löschen | ✅ | ❌ |
| Stammdaten, Stunden, Routine, Zugänge | ✅ | ❌ |

Protokoll wie ein **Funkbuch**: Das Tablet löscht nichts, Fehler werden mit „Korrigieren“ als neuer Eintrag berichtigt.

---

## 5. Fachliche Festlegungen (mit der Drohnengruppe abgestimmt)

**Bericht – Aufbau**
1. **Einsatz/Übung**: Art, Nr., Datum, Beginn/Ende, Stichwort, Ort, Anforderung durch
   (*Leitstelle SBK / EvD / Sonstige* + Freitext), Anbindung an (*Führungsgruppe / Eigenständiger
   Bildschirm / Direkt EvD / Sonstige Einsatzleitung*), **Wetter** zum Antippen (Wetter/Wind/Sicht –
   nur Übersicht, **nicht** im Protokoll), **„Über den Flug informiert“** zum Abhaken mit Uhrzeit
   (Meldestellen aus Stammdaten, Telefonnummer im Feld, zwei Felder nebeneinander, „Anrufen“-Link) –
   ebenfalls **nicht** im Protokoll.
2. **Einsatzprotokoll** – nur was die Drohne betrifft. Stateful Knöpfe:
   „▶ Flug starten“ (fragt Pilot) → in der Luft: „Akkuwechsel (Landung)“, „⇄ Pilotenwechsel“,
   „■ Flug beenden“ → nach Akkuwechsel: „▶ Weiter mit neuem Akku“. Außerdem „Auftrag erhalten“
   (Eingabefeld + Bildmodus **Normalbild / Wärmebild / Splitscreen**), „Lagemeldung an EvD/FüGr“,
   „Funkverbindung gestört“, Freitext mit Uhrzeit.
3. **Fotos & Screenshots** (V2.0): Einsatzstellenfoto (Kamera) und Drohnen-Screenshots (Galerie,
   mehrere), Uhrzeit aus Datei, Quelle, Beschreibung; verkleinert auf max. 2560 px; geschützt; im PDF.
4. **Flug & Crew**: Es gibt **einen durchgehenden Flug**; intern Abschnitte („flights“), geteilt
   bei Akkuwechsel (Pause zählt nicht als Flugzeit) und Pilotenwechsel in der Luft. Keine „+ Flug“-Knöpfe.
   Verlauf mit korrigierbaren Uhrzeiten. Drohne: **Standard-Drohne (FFW VS) vorausgewählt**,
   private Drohnen nur manuell (Hinweis „Private Drohne im Einsatz“).
5. **Verfügbare Einsatzkräfte**: je Person Ort *An der Einsatzstelle / Auf Wache*, Status
   (In der Crew / Verfügbar vor Ort / Auf Wache / Entlassen), eigene **Dienstzeit von–bis**,
   Knopf „Entlassen · jetzt“ (danach keine Dienstzeit mehr). Crew-Mitglieder erscheinen automatisch.
6. **Ergebnis & Besonderheiten**; eingeklappt „Weitere Angaben“ (Einsatzleiter, Auftrag, Positionen
   mit UTMREF/Lageskizze, Luftraum).

**Crew-Rollen:** Pilot · Luftraumbeobachter (Spotter) · Techniker (führt Protokoll) ·
Verbindung EvD/Führungsgruppe. Eine Person darf Spotter + Techniker sein.
**Pilot ist Pflicht** und steht **nie zusätzlich** auf einer anderen Position (auch nicht nach
Pilotenwechsel; der alte Pilot rückt auf die frei gewordene Rolle, bevorzugt Spotter).
Bei Start/Pilotenwechsel stehen „verfügbar vor Ort“ zuerst in der Auswahl.

**Abschließen** nur, wenn jeder Abschnitt einen Piloten hat **und** der Flug beendet ist
(nicht in der Luft, kein offener Akkuwechsel).

**Speichern:** automatisch 2–3 s nach jeder Eingabe, beim Verlassen und wenn die App in den
Hintergrund geht; Protokoll/Abhaken/Fotos sofort.

**Routine-Ampel (nur Pilotenzeit, Einsatz + Übung zusammen):**
grün = ≥ 15 Min. in 30 Tagen **und** ≥ 60 Min. in 90 Tagen; gelb = in 90 Tagen geflogen, aber zu
wenig; rot = in 90 Tagen nicht geflogen. Werte in Stammdaten änderbar. Zusätzlich Pilotenzeit
12 Monate getrennt **Einsatz/Übung**, Zahl der Einsätze (dabei/als Pilot), Hinweis „nur Übung“.

**Stunden:** Dienstzeit je Person aus Team von/bis (sonst Beginn–Ende), Flugzeit je Rolle,
Personenseite + Tätigkeitsnachweis-PDF, Stundennachweis-PDF und CSV.

**Meldestellen (Standard):** Leitstelle SBK (Funk oder Telefon) 07721 20690 ·
Polizeirevier Villingen 07721 6010 · Polizeirevier Schwenningen 07720 85000 ·
Flugplatz Schwenningen 07720 5823 (in Stammdaten pflegbar).

**Erscheinungsbild:** Name „Drohne-VS-Protokoll“. App-Symbol Entwurf **C4**: weiße Drohne,
in der Mitte das Logo der Stadt Villingen-Schwenningen, auf Feuerwehrrot, unten Band „FEUERWEHR“
(Erzeugung: `tools/icons.py`). Das geschützte Signet des Feuerwehrverbands wird nicht verwendet.
Stadtlogo vor offizieller Nutzung mit der Stadt abstimmen.

---

## 6. Offene Punkte / Ideen

- Schnellknöpfe im Protokoll: Liste der Drohnengruppe steht noch aus.
- Notfall-Wiederherstellung des Admin-Zugangs über den Einrichtungscode (angeboten, noch nicht entschieden).
- Datenschutz/AV-Vertrag klären; Umzug auf deutschen Server (mittwald) oder Stadt-IT.
- V2.0 nach Testphase als `release-v2.0` sichern.
