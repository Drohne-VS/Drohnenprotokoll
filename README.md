# UAS-Flugbuch – Drohnengruppe Feuerwehr Villingen-Schwenningen

Web-App für Einsatz- und Übungsberichte der Drohnengruppe: Positionen und Lageskizze,
Flüge mit Crew-Rollen (Pilot, Spotter, Techniker, Verbindung EvD/FüGr), Einsatzprotokoll,
Stunden- und Routine-Auswertung je Kamerad, PDF-Berichte. Läuft auf Tablet und Handy
(zum Startbildschirm hinzufügen) und protokolliert auch ohne Netz weiter.

## Aufbau

- **PocketBase** (`Dockerfile`) – Datenbank (SQLite), Anmeldung, Dateien, Live-Aktualisierung
- `pb_migrations/` – Datenbankschema und Zugriffsregeln
- `pb_hooks/` – Ersteinrichtung des Admins, Änderungsvermerke
- `pb_public/` – die Web-App (eine HTML-Datei, Offline-Speicher, Service Worker)

## Rollen

| | Admin | Einsatz-Tablet |
|---|---|---|
| Berichte anlegen, Protokoll führen, PDF, abschließen | ✅ | ✅ |
| Abgeschlossene Berichte sehen/korrigieren/wieder öffnen | ✅ | ❌ |
| Protokolleinträge/Berichte löschen | ✅ | ❌ |
| Stammdaten, Stunden, Zugänge | ✅ | ❌ |

Die Regeln werden auf dem Server durchgesetzt (`pb_migrations/1700000000_init.js`).

## Betrieb

- Daten liegen in `/pb/pb_data` → dort muss eine **dauerhafte Festplatte** eingehängt sein.
- Umgebungsvariable `SETUP_CODE`: einmaliger Code für die Ersteinrichtung des Admins.
- Umzug auf einen anderen Server (z. B. mittwald): Container aus diesem Repository bauen
  und den Inhalt von `pb_data` mitnehmen.
