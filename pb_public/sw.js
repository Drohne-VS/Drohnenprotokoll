// Offline-Unterstützung: App-Dateien werden auf dem Gerät zwischengespeichert.
// Daten (/api/) laufen nie über diesen Cache – die speichert die App selbst.
const CACHE = "uas-flugbuch-v8";
const SHELL = ["./", "index.html", "vendor/pocketbase.umd.js", "vendor/jspdf.umd.min.js", "manifest.webmanifest", "icon-192.png", "icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/_/")) return;
  const isPage = req.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html");
  if (isPage || url.origin !== location.origin) {
    // Netz zuerst (immer aktuelle Version), bei Funkloch aus dem Speicher
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(isPage ? "index.html" : req, c)); } return r; })
      .catch(() => caches.match(isPage ? "index.html" : req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
});
