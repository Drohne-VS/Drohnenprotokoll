/// <reference path="../pb_data/types.d.ts" />
// V2.0: Fotos zum Bericht (Einsatzstellenfotos, Drohnen-Screenshots). Dateien sind geschützt (nur mit Anmeldung abrufbar).
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const missions = app.findCollectionByNameOrId("missions");
  const users = app.findCollectionByNameOrId("users");
  app.save(new Collection({
    type: "base", name: "fotos",
    listRule: ADMIN + " || (@request.auth.id != '' && mission.status != 'abgeschlossen')",
    viewRule: ADMIN + " || (@request.auth.id != '' && mission.status != 'abgeschlossen')",
    createRule: ADMIN + " || (@request.auth.role = 'tablet' && mission.status != 'abgeschlossen')",
    updateRule: ADMIN + " || (@request.auth.role = 'tablet' && mission.status != 'abgeschlossen' && @request.body.bild:isset = false)",
    deleteRule: ADMIN,
    fields: [
      { name: "mission", type: "relation", required: true, collectionId: missions.id, maxSelect: 1, cascadeDelete: true },
      { name: "bild", type: "file", required: true, maxSelect: 1, maxSize: 20971520, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"], thumbs: ["400x0", "1200x0"], protected: true },
      { name: "zeit", type: "text", max: 5 },
      { name: "quelle", type: "select", maxSelect: 1, values: ["einsatzstelle", "drohne"] },
      { name: "beschreibung", type: "text", max: 1000 },
      { name: "autor", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "created", type: "autodate", onCreate: true },
    ],
  }));
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("fotos")); } catch (e) {}
});
