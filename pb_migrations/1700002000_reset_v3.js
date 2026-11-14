/// <reference path="../pb_data/types.d.ts" />
// Version 3.0: Start in den Echtbetrieb. Alle Testdaten werden einmalig gelöscht – Berichte, Protokolle,
// Fotos, Wartungsbuch, Pilotsperren, Mitglieder (inkl. Verwaltungsdaten), Drohnen und die Zugänge.
// Erhalten bleiben nur die Einstellungen (config). Vorher wird alles als JSON auf der Server-Festplatte
// gesichert (pb_data/sicherung_vor_v3_*.json). Danach ist die Ersteinrichtung mit SETUP_CODE nötig.
migrate((app) => {
  const order = ["protokoll", "fotos", "wartung", "pilotsperren", "mitgliederdetails", "missions", "drones", "members", "users"];
  const dump = { erstellt: new Date().toISOString(), collections: {} };
  for (const c of order) dump.collections[c] = app.findAllRecords(c).map(r => JSON.parse(JSON.stringify(r)));
  const file = app.dataDir() + "/sicherung_vor_v3_" + new Date().toISOString().slice(0, 10) + ".json";
  $os.writeFile(file, JSON.stringify(dump), 0o600); // schlägt das fehl, bricht die Migration ab und es wird nichts gelöscht
  for (const c of order) for (const r of app.findAllRecords(c)) app.delete(r);
}, (app) => {
  // Kein Zurück: die gelöschten Daten liegen nur in der Sicherungsdatei.
});
