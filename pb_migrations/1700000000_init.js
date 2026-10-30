/// <reference path="../pb_data/types.d.ts" />
// Grundaufbau UAS-Flugbuch: Benutzer mit Rollen, Stammdaten, Berichte, Protokoll
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const AUTH = "@request.auth.id != ''";

  // --- Benutzer: Anmeldung per Benutzername, Rolle admin | tablet
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new TextField({ name: "username", required: true, min: 3, max: 40, pattern: "^[a-z0-9._-]+$" }));
  users.fields.add(new SelectField({ name: "role", required: true, maxSelect: 1, values: ["admin", "tablet"] }));
  const email = users.fields.getByName("email");
  email.required = false;
  users.addIndex("idx_users_username", true, "username", "");
  users.passwordAuth.enabled = true;
  users.passwordAuth.identityFields = ["username"];
  users.authToken.duration = 60 * 60 * 24 * 30; // 30 Tage angemeldet bleiben (Tablet im Fahrzeug)
  users.listRule = ADMIN + " || id = @request.auth.id";
  users.viewRule = ADMIN + " || id = @request.auth.id";
  users.createRule = ADMIN;
  users.updateRule = ADMIN;
  users.deleteRule = ADMIN + " && id != @request.auth.id";
  users.manageRule = ADMIN;
  app.save(users);

  // --- Stammdaten
  app.save(new Collection({
    type: "base", name: "config",
    listRule: AUTH, viewRule: AUTH, createRule: ADMIN, updateRule: ADMIN, deleteRule: null,
    fields: [
      { name: "einheit", type: "text", max: 200 },
      { name: "gruppe", type: "text", max: 200 },
      { name: "routineFluege", type: "number", onlyInt: true, min: 1 },
      { name: "routineTage", type: "number", onlyInt: true, min: 1 },
      { name: "logo", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/png", "image/jpeg"] },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  }));
  app.save(new Collection({
    type: "base", name: "members",
    listRule: AUTH, viewRule: AUTH, createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "name", type: "text", required: true, max: 120 },
      { name: "quali", type: "text", max: 300 },
      { name: "aktiv", type: "bool" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  }));
  app.save(new Collection({
    type: "base", name: "drones",
    listRule: AUTH, viewRule: AUTH, createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "name", type: "text", required: true, max: 120 },
      { name: "modell", type: "text", max: 200 },
      { name: "kennung", type: "text", max: 120 },
      { name: "aktiv", type: "bool" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  }));

  // --- Berichte: das Tablet sieht und ändert nur offene Berichte
  const OPEN = "status != 'abgeschlossen'";
  app.save(new Collection({
    type: "base", name: "missions",
    listRule: ADMIN + " || (" + AUTH + " && " + OPEN + ")",
    viewRule: ADMIN + " || (" + AUTH + " && " + OPEN + ")",
    createRule: ADMIN + " || (" + AUTH + " && @request.auth.role = 'tablet')",
    updateRule: ADMIN + " || (@request.auth.role = 'tablet' && " + OPEN + ")",
    deleteRule: ADMIN,
    fields: [
      { name: "typ", type: "select", required: true, maxSelect: 1, values: ["einsatz", "uebung"] },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["entwurf", "abgeschlossen"] },
      { name: "datum", type: "text", max: 10 },
      { name: "data", type: "json", maxSize: 1000000 },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  }));
  const missions = app.findCollectionByNameOrId("missions");

  // --- Protokoll wie ein Funkbuch: Tablet schreibt nur neue Einträge, ändern/löschen nur Admin
  app.save(new Collection({
    type: "base", name: "protokoll",
    listRule: ADMIN + " || (" + AUTH + " && mission.status != 'abgeschlossen')",
    viewRule: ADMIN + " || (" + AUTH + " && mission.status != 'abgeschlossen')",
    createRule: ADMIN + " || (@request.auth.role = 'tablet' && mission.status != 'abgeschlossen')",
    updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "mission", type: "relation", required: true, collectionId: missions.id, maxSelect: 1, cascadeDelete: true },
      { name: "zeit", type: "text", required: true, max: 5, pattern: "^\\d{2}:\\d{2}$" },
      { name: "text", type: "text", required: true, max: 2000 },
      { name: "tag", type: "text", max: 40 },
      { name: "autor", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "created", type: "autodate", onCreate: true },
    ],
  }));
}, (app) => {
  for (const n of ["protokoll", "missions", "drones", "members", "config"]) {
    try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {}
  }
});
