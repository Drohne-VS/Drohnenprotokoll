/// <reference path="../pb_data/types.d.ts" />
// Liste der Stellen, die vor dem Flug informiert werden (Leitstelle, Polizeireviere …)
migrate((app) => {
  const c = app.findCollectionByNameOrId("config");
  c.fields.add(new JSONField({ name: "meldestellen", maxSize: 20000 }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("config");
  c.fields.removeByName("meldestellen");
  app.save(c);
});
