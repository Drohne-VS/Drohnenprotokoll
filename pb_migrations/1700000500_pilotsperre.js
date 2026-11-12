/// <reference path="../pb_data/types.d.ts" />
// Pilotensperre: Kennzeichen am Mitglied (für alle sichtbar, damit das Tablet die Auswahl sperren kann)
// und Sperrvermerke mit Grund in einer eigenen, nur für Admins lesbaren Collection.
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const m = app.findCollectionByNameOrId("members");
  m.fields.add(new BoolField({ name: "pilotGesperrt" }));
  app.save(m);
  const users = app.findCollectionByNameOrId("users");
  app.save(new Collection({
    type: "base", name: "pilotsperren",
    listRule: ADMIN, viewRule: ADMIN, createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "member", type: "relation", required: true, collectionId: m.id, maxSelect: 1, cascadeDelete: true },
      { name: "grund", type: "text", max: 1000 },
      { name: "seit", type: "text", max: 10 },
      { name: "bis", type: "text", max: 10 },
      { name: "aufhebung", type: "text", max: 1000 },
      { name: "autor", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "created", type: "autodate", onCreate: true },
    ],
  }));
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("pilotsperren")); } catch (e) {}
  const m = app.findCollectionByNameOrId("members"); m.fields.removeByName("pilotGesperrt"); app.save(m);
});
