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

// Familienkonten dürfen Einstellungen nicht ändern: Einstellungen, Name und Betriebsstatus
// werden bei deren Speichern immer vom bisherigen Stand übernommen (auch gegen alte Gerätestände).
onRecordUpdateRequest((e) => {
  if (e.auth && e.auth.getString("role") === "admin") return e.next();
  let neu = {}, alt = {};
  try { neu = JSON.parse(e.record.getString("data") || "{}") || {}; } catch (err) { neu = {}; }
  try { alt = JSON.parse(e.record.original().getString("data") || "{}") || {}; } catch (err) { alt = {}; }
  const pools = neu.pools || {};
  for (const k in pools) {
    const o = (alt.pools || {})[k];
    if (!o) continue;
    pools[k].cfg = o.cfg; pools[k].name = o.name; pools[k].active = o.active;
    if (Array.isArray(o.log) && Array.isArray(pools[k].log)) {
      // Familienkonten dürfen keine Messungen löschen
      const ids = {}; pools[k].log.forEach(m => { ids[m.id] = 1; });
      o.log.forEach(m => { if (m && m.id && !ids[m.id]) pools[k].log.push(m); });
      pools[k].log.sort((a, b) => (a.at < b.at ? -1 : 1));
      pools[k].deleted = o.deleted || [];
    }
  }
  e.record.set("data", neu);
  return e.next();
}, "spa_state");
