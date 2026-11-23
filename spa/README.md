# Spa-Wasserpflege (privat, Testbetrieb)

Eigenständige App für Whirlpool (Armstark/Sundance Cameo, 1.325 l) und geplanten Swim-Spa:
PoolLab-2.0-Messwerte eintragen (geführt oder schnell), Bewertung und Dosierung nach
SpaBalancer-Anleitung (Basic, UltraShock, SoftWater, pH-Minus/Plus), Pflegeplan,
Filterverwaltung (Filter 1–3: Reinigungen, Alter, Tausch), Protokoll mit Namen.

**Hat nichts mit der Drohnen-App zu tun** – eigener Ordner, eigener Zweig `spa-app`,
eigener Render-Dienst `spa-pflege`, eigene Datenbank und Zugänge.

- Technik: PocketBase 0.40.5, `pb_public/index.html` (eine Datei), Service Worker `sw.js`
- Zugänge: Collection `users` (Benutzername, Rolle `admin` | `familie`); Admin legt Familienzugänge an
- Daten: Collection `spa_state`, ein Datensatz `key = "main"` mit dem ganzen Stand als JSON;
  beim Speichern werden Messungen/Protokoll mit dem Serverstand zusammengeführt (mehrere Geräte)
- Ersteinrichtung mit Umgebungsvariable `SETUP_CODE` (nur bei Render, nie ins Repo)
- Neue Version: Cache-Version in `pb_public/sw.js` erhöhen, auf `spa-app` pushen
- Lokal testen: `SETUP_CODE=TEST pocketbase serve --dir=<tmp> --migrationsDir=spa/pb_migrations --hooksDir=spa/pb_hooks --publicDir=spa/pb_public`
- Geplant: Umzug zusammen mit der Drohnen-App auf einen privat bezahlten deutschen Server

## Stand 22.11.2026
- Neustart: Migration `1800000100_neustart.js` hat die Testdaten gelöscht (Zugänge blieben).
  Datenstand hat eine `epoch`; Geräte mit anderem `epoch` verwerfen ihren alten lokalen Stand.
  Admin kann unter „Mehr → Neustart“ jederzeit alles löschen (neue `epoch`); Familienkonten nicht (Server-Hook).
- Einstellungen, Messungen löschen, Filter korrigieren: nur Admin (App + Server-Hook).
- Hilfe-Seite (Problemlöser), Zugaben nachtragen mit Datum, fällige Aufgaben mit Mengen.
- Offen: echte Push-Benachrichtigungen (Erinnerungen aufs Handy).

## Stand 23.11.2026 – Pflegeplan „Bundschuh“
- `cfg.plan = 'bundschuh' | 'spabalancer'` (Admin wählbar). Bundschuh-Werte in `cfg.bs`
  (pH-Ziel 6,5–6,8 statt der vom Händler genannten 6,0–6,5 – Entscheidung des Nutzers; 30 g pH-Minus je Gabe,
  pH-Absenkung max. 3 Tage mit pH-Messung vor jeder Gabe; Woche 30 ml UltraShock + 30 ml Basic;
  Nachfüllen: 30 g pH-Minus + 40 ml SoftWater je 5 Min.; Kontrollmessung alle 14 Tage).
- Bewertung `evaluate(m, pool, mode)`: Plan-Bewertung steuert Aufgaben/Empfehlungen; `mode='norm'` zeigt
  SpaBalancer/Normwerte als „Zusatz-Kontrolle“ (aufklappbar).
- Filter: Einsatzzeit je Filter (`inAt`, `useMs`), Grundreinigung nach `filterDeepDays` (90) Einsatztagen,
  sonst nur ausspülen (`rinses`).
