/// <reference path="../pb_data/types.d.ts" />
// Wartungseintrag: Kennzeichen „Propeller/Verschleißteile dabei getauscht“ (z. B. bei Service durch DJI/Händler)
migrate((app) => {
  const c = app.findCollectionByNameOrId("wartung");
  c.fields.add(new BoolField({ name: "propeller" }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("wartung"); c.fields.removeByName("propeller"); app.save(c);
});
