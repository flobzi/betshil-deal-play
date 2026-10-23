/* Bitshil Deal service worker (t334u). Only here so Chrome offers "Install app"; it must never serve an old version.
 *  - The page itself (navigations: index.html) is always fetched from the network first (cache: 'no-store'), so a new
 *    deploy shows up on the very next open. Only when the phone is offline is the last copy shown.
 *  - Everything else (version.json, hashed JS/CSS, art, audio, the room server) is NOT touched: no respondWith, so the
 *    browser loads it exactly as without a service worker (version.json keeps its no-store check + silent reload).
 *  - No precache. A new sw.js takes over at once (skipWaiting + claim) and deletes any older cache name.
 * Kill switch if ever needed: deploy a sw.js that calls self.registration.unregister(). */
const CACHE = 'bd-shell-v1';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.mode !== 'navigate' || req.method !== 'GET') return; // pass-through: the browser handles it as normal
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-store' });
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('shell', copy)).catch(() => {}); }
      return res;
    } catch (err) {
      const hit = await caches.open(CACHE).then((c) => c.match('shell')).catch(() => undefined);
      if (hit) return hit;
      throw err;
    }
  })());
});
