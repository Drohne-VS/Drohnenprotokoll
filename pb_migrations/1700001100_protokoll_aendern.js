/// <reference path="../pb_data/types.d.ts" />
// Protokolleinträge direkt ändern (auch Tablet, solange der Bericht offen ist); Originaltext bleibt erhalten.
migrate((app) => {
  const p = app.findCollectionByNameOrId("protokoll");
  p.fields.add(new TextField({ name: "original", max: 5000 }));
  p.fields.add(new TextField({ name: "geaendertAm", max: 40 }));
  p.updateRule = "@request.auth.role = 'admin' || (@request.auth.role = 'tablet' && mission.status != 'abgeschlossen' && @request.body.mission:isset = false)";
  app.save(p);
}, (app) => {
  const p = app.findCollectionByNameOrId("protokoll");
  p.fields.removeByName("original"); p.fields.removeByName("geaendertAm");
  p.updateRule = "@request.auth.role = 'admin'";
  app.save(p);
});
