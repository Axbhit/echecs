/* Fait marcher l'appli sans réseau. */
const CACHE = 'echecs-v1';
const FILES = ["./","index.html","manifest.webmanifest","icone-180.png","icone-192.png","icone-512.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// La page : d'abord le réseau (pour avoir la dernière version), sinon le cache.
// Le reste (icônes, Stockfish…) : le cache d'abord ; ce qui vient du site est gardé pour la prochaine fois sans réseau.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  const same = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    if (same && r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  })));
});

