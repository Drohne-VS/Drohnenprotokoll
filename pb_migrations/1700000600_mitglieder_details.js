/// <reference path="../pb_data/types.d.ts" />
// Mitglieder: Abteilung, Dienstgrad, Ausbildungen, Gültigkeit UAS-Nachweis; pflegbare Auswahllisten in config
migrate((app) => {
  const m = app.findCollectionByNameOrId("members");
  m.fields.add(new TextField({ name: "abteilung", max: 120 }));
  m.fields.add(new TextField({ name: "dienstgrad", max: 120 }));
  m.fields.add(new JSONField({ name: "ausbildungen", maxSize: 20000 }));
  m.fields.add(new TextField({ name: "uasBis", max: 10 }));
  app.save(m);
  const c = app.findCollectionByNameOrId("config");
  c.fields.add(new JSONField({ name: "listen", maxSize: 50000 }));
  app.save(c);
}, (app) => {
  const m = app.findCollectionByNameOrId("members");
  ["abteilung", "dienstgrad", "ausbildungen", "uasBis"].forEach(n => m.fields.removeByName(n)); app.save(m);
  const c = app.findCollectionByNameOrId("config"); c.fields.removeByName("listen"); app.save(c);
});
