/// <reference path="../pb_data/types.d.ts" />
// Standard-Drohne (wird in neuen Berichten vorausgewählt) und Kennzeichnung privater Drohnen
migrate((app) => {
  const c = app.findCollectionByNameOrId("drones");
  c.fields.add(new BoolField({ name: "standard" }));
  c.fields.add(new BoolField({ name: "privat" }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("drones");
  c.fields.removeByName("standard"); c.fields.removeByName("privat");
  app.save(c);
});
