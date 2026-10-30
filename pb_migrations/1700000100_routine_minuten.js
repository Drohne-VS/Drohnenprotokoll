/// <reference path="../pb_data/types.d.ts" />
// Routine-Regel nach Flugzeit: Minuten als Pilot in 30 bzw. 90 Tagen
migrate((app) => {
  const c = app.findCollectionByNameOrId("config");
  c.fields.add(new NumberField({ name: "routineMin30", onlyInt: true, min: 0 }));
  c.fields.add(new NumberField({ name: "routineMin90", onlyInt: true, min: 0 }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("config");
  c.fields.removeByName("routineMin30");
  c.fields.removeByName("routineMin90");
  app.save(c);
});
