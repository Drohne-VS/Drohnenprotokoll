/// <reference path="../pb_data/types.d.ts" />
// Wartung der Drohnen: Wartungsbuch (nur Admin), „außer Betrieb“-Kennzeichen an der Drohne
// (für alle sichtbar, damit das Tablet sie nicht auswählt), Inbetriebnahme-Datum und Wartungsregeln.
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const drones = app.findCollectionByNameOrId("drones");
  drones.fields.add(new BoolField({ name: "ausserBetrieb" }));
  drones.fields.add(new TextField({ name: "ausserBetriebGrund", max: 500 }));
  drones.fields.add(new TextField({ name: "inBetriebSeit", max: 10 }));
  app.save(drones);

  const cfg = app.findCollectionByNameOrId("config");
  cfg.fields.add(new JSONField({ name: "wartung", maxSize: 5000 }));
  app.save(cfg);

  const users = app.findCollectionByNameOrId("users");
  app.save(new Collection({
    type: "base", name: "wartung",
    listRule: ADMIN, viewRule: ADMIN, createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "drone", type: "relation", required: true, collectionId: drones.id, maxSelect: 1, cascadeDelete: true },
      { name: "datum", type: "text", max: 10 },
      { name: "art", type: "text", max: 40 },
      { name: "bemerkung", type: "text", max: 2000 },
      { name: "dateien", type: "file", maxSelect: 10, maxSize: 15728640, mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"], protected: true },
      { name: "autor", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "created", type: "autodate", onCreate: true },
    ],
  }));
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("wartung")); } catch (e) {}
  const d = app.findCollectionByNameOrId("drones");
  ["ausserBetrieb", "ausserBetriebGrund", "inBetriebSeit"].forEach(n => d.fields.removeByName(n));
  app.save(d);
  const c = app.findCollectionByNameOrId("config"); c.fields.removeByName("wartung"); app.save(c);
});
