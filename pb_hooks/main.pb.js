/// <reference path="../pb_data/types.d.ts" />

// Ersteinrichtung: legt den ersten Admin an, solange es noch keinen gibt.
// Zusätzlich muss der Einrichtungscode (Umgebungsvariable SETUP_CODE) stimmen.
routerAdd("GET", "/api/flugbuch/status", (e) => {
  let admins = 0;
  try { admins = $app.countRecords("users", $dbx.hashExp({ role: "admin" })); } catch (err) {}
  return e.json(200, { needsSetup: admins === 0 });
});

routerAdd("POST", "/api/flugbuch/setup", (e) => {
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
  const users = $app.findCollectionByNameOrId("users");
  const rec = new Record(users);
  rec.set("username", username);
  rec.set("role", "admin");
  rec.set("name", String(body.name || username).slice(0, 120));
  rec.setPassword(password);
  rec.setVerified(true);
  $app.save(rec);
  if (!$app.findRecordsByFilter("config", "", "", 1, 0).length) {
    const c = new Record($app.findCollectionByNameOrId("config"));
    c.set("einheit", "Feuerwehr Villingen-Schwenningen");
    c.set("gruppe", "Drohnengruppe");
    c.set("routineFluege", 3);
    c.set("routineTage", 90);
    $app.save(c);
  }
  return e.json(200, { ok: true });
});

// Bei Abschluss bzw. Korrektur durch den Admin wird ein Vermerk im Bericht ergänzt.
onRecordUpdateRequest((e) => {
  const auth = e.auth;
  const before = e.record.original();
  if (auth && auth.getString("role") === "admin" && before.getString("status") === "abgeschlossen") {
    let d = {}, d0 = {};
    try { d = JSON.parse(e.record.getString("data") || "{}") || {}; } catch (err) { d = {}; }
    try { d0 = JSON.parse(before.getString("data") || "{}") || {}; } catch (err) { d0 = {}; }
    // Die Endkontrolle selbst ist keine Korrektur
    if (!d0.kontrolle && d.kontrolle && e.record.getString("status") === "abgeschlossen") return e.next();
    const list = Array.isArray(d.aenderungen) ? d.aenderungen : [];
    list.push({ zeit: new Date().toISOString(), von: auth.getString("username"), text: e.record.getString("status") === "abgeschlossen" ? "Korrektur nach Abschluss" : "Wieder geöffnet" });
    d.aenderungen = list.slice(-50);
    e.record.set("data", d);
  }
  return e.next();
}, "missions");

// Protokolleinträge: Autor immer serverseitig setzen
onRecordCreateRequest((e) => {
  if (e.auth) e.record.set("autor", e.auth.id);
  return e.next();
}, "protokoll", "fotos", "pilotsperren", "wartung");

// Protokolleintrag geändert: ursprünglichen Text einmalig sichern, Änderungszeit setzen
onRecordUpdateRequest((e) => {
  const before = e.record.original();
  const oldTxt = before.getString("text"), oldZeit = before.getString("zeit");
  if (e.record.getString("text") !== oldTxt || e.record.getString("zeit") !== oldZeit) {
    if (!before.getString("original")) e.record.set("original", oldZeit + " " + oldTxt);
    e.record.set("geaendertAm", new Date().toISOString());
  } else {
    e.record.set("original", before.getString("original")); e.record.set("geaendertAm", before.getString("geaendertAm"));
  }
  return e.next();
}, "protokoll");
