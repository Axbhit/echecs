/* Fait marcher l'appli sans réseau. */
const CACHE = 'echecs-v2';
const FILES = ["./","index.html","manifest.webmanifest","icone-180.png","icone-192.png","icone-512.png"];
// Bibliothèques à version figée (3D, Stockfish) : gardées après le premier usage, pour marcher sans réseau.
const PINNED = ['https://cdn.jsdelivr.net/npm/three@0.149.0/', 'https://unpkg.com/stockfish@18.0.8/'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// La page : d'abord le réseau (pour avoir la dernière version), sinon le cache.
// Le reste (icônes, 3D, Stockfish…) : le cache d'abord ; ce qui vient du site ou des bibliothèques figées est gardé.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); }   // jamais une page d'erreur
      return r;
    })
      .catch(() => caches.match('index.html')));
    return;
  }
  const url = e.request.url, same = new URL(url).origin === self.location.origin;
  if (!same && !PINNED.some((p) => url.startsWith(p))) return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  })));
});

