/// <reference path="../pb_data/types.d.ts" />
// Ersteinrichtung: legt den ersten Admin an, solange es noch keinen gibt (Code = Umgebungsvariable SETUP_CODE).
routerAdd("GET", "/api/spa/status", (e) => {
  let admins = 0;
  try { admins = $app.countRecords("users", $dbx.hashExp({ role: "admin" })); } catch (err) {}
  return e.json(200, { needsSetup: admins === 0 });
});
routerAdd("POST", "/api/spa/setup", (e) => {
  const body = e.requestInfo().body || {};
  const code = String($os.getenv("SETUP_CODE") || "");
  if (!code) return e.json(403, { message: "Die Ersteinrichtung ist auf diesem Server nicht freigeschaltet." });
  if (String(body.code || "").trim() !== code) return e.json(403, { message: "Der Einrichtungscode stimmt nicht." });
  let admins = 0;
  try { admins = $app.countRecords("users", $dbx.hashExp({ role: "admin" })); } catch (err) {}
  if (admins > 0) return e.json(409, { message: "Es gibt bereits einen Admin. Bitte normal anmelden." });
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) return e.json(400, { message: "Benutzername: 3–40 Zeichen, nur Kleinbuchstaben, Ziffern, Punkt, Minus, Unterstrich." });
  if (password.length < 10) return e.json(400, { message: "Das Passwort braucht mindestens 10 Zeichen." });
  const rec = new Record($app.findCollectionByNameOrId("users"));
  rec.set("username", username);
  rec.set("role", "admin");
  rec.set("name", String(body.name || username).slice(0, 120));
  rec.setPassword(password);
  rec.setVerified(true);
  $app.save(rec);
  return e.json(200, { ok: true });
});
