/// <reference path="../pb_data/types.d.ts" />
// Verwaltungsdaten der Mitglieder nur für Admins: Abteilung, Dienstgrad, Ausbildungen, UAS-Nachweis,
// Bemerkung und abgelegte Bescheinigungen (geschützte Dateien). Bestehende Angaben werden übernommen.
migrate((app) => {
  const ADMIN = "@request.auth.role = 'admin'";
  const members = app.findCollectionByNameOrId("members");
  const det = new Collection({
    type: "base", name: "mitgliederdetails",
    listRule: ADMIN, viewRule: ADMIN, createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
    fields: [
      { name: "member", type: "relation", required: true, collectionId: members.id, maxSelect: 1, cascadeDelete: true },
      { name: "abteilung", type: "text", max: 120 },
      { name: "dienstgrad", type: "text", max: 120 },
      { name: "ausbildungen", type: "json", maxSize: 20000 },
      { name: "uasBis", type: "text", max: 10 },
      { name: "bemerkung", type: "text", max: 1000 },
      { name: "nachweise", type: "file", maxSelect: 20, maxSize: 15728640, mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"], protected: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_mitgliederdetails_member ON mitgliederdetails (member)"],
  });
  app.save(det);
  for (const r of app.findAllRecords("members")) {
    const ab = r.getString("abteilung"), dg = r.getString("dienstgrad"), ub = r.getString("uasBis"), q = r.getString("quali");
    let au = []; try { au = JSON.parse(r.getString("ausbildungen") || "[]") || []; } catch (e) {}
    if (ab || dg || ub || q || au.length) {
      const d = new Record(det);
      d.set("member", r.id); d.set("abteilung", ab); d.set("dienstgrad", dg); d.set("uasBis", ub); d.set("bemerkung", q); d.set("ausbildungen", au);
      app.save(d);
    }
    r.set("quali", "");
    app.save(r);
  }
  ["abteilung", "dienstgrad", "ausbildungen", "uasBis"].forEach(n => members.fields.removeByName(n));
  app.save(members);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("mitgliederdetails")); } catch (e) {}
});
