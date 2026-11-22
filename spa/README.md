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
