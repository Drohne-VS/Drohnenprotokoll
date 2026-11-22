/// <reference path="../pb_data/types.d.ts" />
// Spa-Wasserpflege: Zugänge (Admin/Familie) und ein gemeinsamer Datenstand
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const AUTH = "@request.auth.id != ''";
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new TextField({ name: "username", required: true, min: 3, max: 40, pattern: "^[a-z0-9._-]+$" }));
  users.fields.add(new SelectField({ name: "role", required: true, maxSelect: 1, values: ["admin", "familie"] }));
  users.fields.getByName("email").required = false;
  users.addIndex("idx_users_username", true, "username", "");
  users.passwordAuth.enabled = true;
  users.passwordAuth.identityFields = ["username"];
  users.authToken.duration = 60 * 60 * 24 * 90; // 90 Tage angemeldet bleiben
  users.listRule = ADMIN + " || id = @request.auth.id";
  users.viewRule = ADMIN + " || id = @request.auth.id";
  users.createRule = ADMIN;
  users.updateRule = ADMIN;
  users.deleteRule = ADMIN + " && id != @request.auth.id";
  users.manageRule = ADMIN;
  app.save(users);

  app.save(new Collection({
    type: "base", name: "spa_state",
    listRule: AUTH, viewRule: AUTH, createRule: AUTH, updateRule: AUTH, deleteRule: null,
    fields: [
      { name: "key", type: "text", required: true, max: 40 },
      { name: "data", type: "json", maxSize: 5000000 },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_spa_key ON spa_state (key)"],
  }));
}, (app) => {});
