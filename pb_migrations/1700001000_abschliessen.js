/// <reference path="../pb_data/types.d.ts" />
// Mitglieder: Erlaubnis, Berichte abzuschließen bzw. zu kontrollieren (für alle lesbar, damit das Tablet die Auswahl kennt)
migrate((app) => {
  const m = app.findCollectionByNameOrId("members");
  m.fields.add(new BoolField({ name: "darfAbschliessen" }));
  app.save(m);
}, (app) => {
  const m = app.findCollectionByNameOrId("members"); m.fields.removeByName("darfAbschliessen"); app.save(m);
});
