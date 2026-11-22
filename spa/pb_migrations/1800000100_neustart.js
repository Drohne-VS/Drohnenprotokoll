/// <reference path="../pb_data/types.d.ts" />
// Neustart 22.11.2026: Testdaten löschen (Zugänge bleiben). Geräte mit altem Stand übernehmen den leeren Stand.
migrate((app) => {
  const recs = app.findRecordsByFilter("spa_state", "", "", 0, 0);
  recs.forEach((r) => app.delete(r));
  const r = new Record(app.findCollectionByNameOrId("spa_state"));
  r.set("key", "main");
  r.set("data", { epoch: "neustart-2026-11-22", savedAt: new Date().toISOString(), pools: {} });
  app.save(r);
}, (app) => {});
