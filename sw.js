/* Bitshil Deal service worker (t334u install; t367u/t368u card-art cache). It must never serve an old version.
 *  - The page itself (navigations: index.html) is always fetched from the network first (cache: 'no-store'), so a new
 *    deploy shows up on the very next open. Only when the phone is offline is the last copy shown.
 *  - Card pictures (art/<file>?v=<content hash>, the hash written in at build time below) are kept on the phone:
 *    cache-first, so a later visit draws them straight from the phone. A changed picture has a new hash = a new URL, so
 *    it is fetched fresh; on activate every copy whose hash is not current any more is deleted. Only same-origin art/
 *    URLs whose ?v= matches this build's hash are cached (≈2.6 MB); anything else in art/ goes to the network untouched.
 *  - Everything else (version.json, hashed JS/CSS, sounds, tables, the room server, any API) is NOT touched: no
 *    respondWith, so the browser loads it exactly as without a service worker (version.json keeps its no-store check).
 *  - The page tells the worker the admin switches (Tuning › Loading): art cache off = every saved picture deleted and
 *    nothing cached; backfill = once the card faces are in, save the pictures fetched before this worker took over.
 *  - A new sw.js (every build that changes a picture) takes over at once (skipWaiting + claim).
 * Kill switch if ever needed: deploy a sw.js that calls self.registration.unregister(). */
const CACHE = 'bd-shell-v1';
const ART = 'bd-art-v1';
/** art path (relative to art/) → content hash; filled in by the build (vite.config.ts artCacheSw) */
const ART_V = {"action/BANKRUPTCY.thumb.webp":"6af6f05898","action/BANKRUPTCY.webp":"b1ce34d972","action/DOUBLE_NO.thumb.webp":"6864aab91d","action/DOUBLE_NO.webp":"b6aa144e70","action/DOUBLE_RENT.thumb.webp":"49e904b303","action/DOUBLE_RENT.webp":"13a26218a4","action/DRAW_2.thumb.webp":"3d72f8e1c9","action/DRAW_2.webp":"c88edc4147","action/DRAW_2_RENEW.thumb.webp":"6e4b378a54","action/DRAW_2_RENEW.webp":"90d90cbb1b","action/EXTRA_2_MOVES.thumb.webp":"9c0dccaa39","action/EXTRA_2_MOVES.webp":"267abbb061","action/FENCE.thumb.webp":"73fbb1eadc","action/FENCE.webp":"10c875065c","action/HOUSE.thumb.webp":"103a1230fa","action/HOUSE.webp":"adb61ec2c7","action/JOKER.thumb.webp":"c457552726","action/JOKER.webp":"fc7f6a651d","action/JOKER_STEALER.thumb.webp":"705cec318d","action/JOKER_STEALER.webp":"926952d9ee","action/LAND_BUY.thumb.webp":"b267b359fc","action/LAND_BUY.webp":"0ce85803a6","action/LAND_STEAL.thumb.webp":"75fa8ec29c","action/LAND_STEAL.webp":"2331db9ae4","action/LAND_SWAP.thumb.webp":"daface402e","action/LAND_SWAP.webp":"efeee33607","action/LAND_THROW.thumb.webp":"74ef01d1dd","action/LAND_THROW.webp":"6a92934209","action/NO.thumb.webp":"9aa8af64f8","action/NO.webp":"6cca8ef169","action/PLAY_ONLY_1_MOVE.thumb.webp":"37a69236c2","action/PLAY_ONLY_1_MOVE.webp":"a73f32ece9","action/REVERSE_RENT.thumb.webp":"83af633d8c","action/REVERSE_RENT.webp":"9ccf965768","action/SET_BREAKER.thumb.webp":"9d5020f29d","action/SET_BREAKER.webp":"8f5b140448","action/SET_STEALER.thumb.webp":"96cba8741d","action/SET_STEALER.webp":"23e5f56f86","action/SHOW_HAND.thumb.webp":"6d121f469a","action/SHOW_HAND.webp":"0884d865fb","action/SLEEP.thumb.webp":"516195c70e","action/SLEEP.webp":"9e03884deb","action/SWAP_HANDS.thumb.webp":"f2fa052865","action/SWAP_HANDS.webp":"aef81a40cd","back/CARD_BACK.thumb.webp":"1f0704e0d6","back/CARD_BACK.webp":"424034a135","back/CARD_BACK_CORAL.thumb.webp":"ec87b5cb7a","back/CARD_BACK_CORAL.webp":"ea04840ccc","back/CARD_BACK_GOLD.thumb.webp":"5de60c7942","back/CARD_BACK_GOLD.webp":"8bd7750b37","back/CARD_BACK_ROSE.thumb.webp":"f2d4a3f5a2","back/CARD_BACK_ROSE.webp":"69c6ffe0e2","back/CARD_BACK_TEAL.thumb.webp":"e29f85cbd8","back/CARD_BACK_TEAL.webp":"eed693846b","back/CARD_BACK_VIOLET.thumb.webp":"870d78aa73","back/CARD_BACK_VIOLET.webp":"3878a2975d","land/DUAL_AQUA_RED.thumb.webp":"c8a1c69f88","land/DUAL_AQUA_RED.webp":"0c80eee155","land/DUAL_BROWN_PURPLE.thumb.webp":"29615eb6b4","land/DUAL_BROWN_PURPLE.webp":"b3a02ab286","land/DUAL_ORANGE_GREEN.thumb.webp":"8e292b838d","land/DUAL_ORANGE_GREEN.webp":"8dfec682af","land/DUAL_PINK_YELLOW.thumb.webp":"b8a51a1ad7","land/DUAL_PINK_YELLOW.webp":"7af0d3a056","land/LAND_AQUA_BLUE.thumb.webp":"9f27c1cbd7","land/LAND_AQUA_BLUE.webp":"e09063f672","land/LAND_AQUA_BLUE_2.thumb.webp":"2db38fa068","land/LAND_AQUA_BLUE_2.webp":"8079950e99","land/LAND_AQUA_BLUE_3.thumb.webp":"1bcc8b785d","land/LAND_AQUA_BLUE_3.webp":"c77d8c67a1","land/LAND_BROWN.thumb.webp":"1c61f2ac1a","land/LAND_BROWN.webp":"01cfcfec89","land/LAND_BROWN_2.thumb.webp":"15cca782d5","land/LAND_BROWN_2.webp":"a251ba10e2","land/LAND_DARK_BLUE.thumb.webp":"a51cb9ed26","land/LAND_DARK_BLUE.webp":"707d1fa0c4","land/LAND_DARK_BLUE_2.thumb.webp":"ffb567f3ac","land/LAND_DARK_BLUE_2.webp":"41621d8b48","land/LAND_DARK_BLUE_3.thumb.webp":"2fbc319969","land/LAND_DARK_BLUE_3.webp":"c0f2aec66b","land/LAND_GREEN.thumb.webp":"9e8edc04ee","land/LAND_GREEN.webp":"15e25c3383","land/LAND_GREEN_2.thumb.webp":"c7367ad740","land/LAND_GREEN_2.webp":"5e291f2e82","land/LAND_GREEN_3.thumb.webp":"3397cfb108","land/LAND_GREEN_3.webp":"9f51987bb3","land/LAND_ORANGE.thumb.webp":"78b3e50afc","land/LAND_ORANGE.webp":"45a31c30b5","land/LAND_ORANGE_2.thumb.webp":"a3865ffd3b","land/LAND_ORANGE_2.webp":"ba9721c44d","land/LAND_ORANGE_3.thumb.webp":"e86d7223ed","land/LAND_ORANGE_3.webp":"55d51a0df2","land/LAND_PINK.thumb.webp":"0836b6e16b","land/LAND_PINK.webp":"097e401de7","land/LAND_PINK_2.thumb.webp":"efdc925c39","land/LAND_PINK_2.webp":"408b071f3a","land/LAND_PURPLE.thumb.webp":"fe80aa8ece","land/LAND_PURPLE.webp":"93f1756435","land/LAND_PURPLE_2.thumb.webp":"8b34259273","land/LAND_PURPLE_2.webp":"9133b0ee4b","land/LAND_PURPLE_3.thumb.webp":"b0e703707c","land/LAND_PURPLE_3.webp":"542e29344c","land/LAND_RED.thumb.webp":"831d387d7f","land/LAND_RED.webp":"a1663bd7d3","land/LAND_RED_2.thumb.webp":"3daaef07c9","land/LAND_RED_2.webp":"fa77f1d4ed","land/LAND_RED_3.thumb.webp":"c3bf2477b4","land/LAND_RED_3.webp":"006564229e","land/LAND_RED_4.thumb.webp":"ba7ac17570","land/LAND_RED_4.webp":"af67b200af","land/LAND_YELLOW.thumb.webp":"10abde9889","land/LAND_YELLOW.webp":"f64e212ec4","land/LAND_YELLOW_2.thumb.webp":"be8a3f0a2d","land/LAND_YELLOW_2.webp":"4052ec58a0","money/MONEY_1.thumb.webp":"1f47e489ef","money/MONEY_1.webp":"a4c35e0049","money/MONEY_10.thumb.webp":"ffc2e964b8","money/MONEY_10.webp":"201f4dcd9f","money/MONEY_2.thumb.webp":"addc8384c5","money/MONEY_2.webp":"30eb792766","money/MONEY_20.thumb.webp":"2175b103db","money/MONEY_20.webp":"7be862a63a","money/MONEY_5.thumb.webp":"533c5bd85f","money/MONEY_5.webp":"440c2b14a0","rage2-girl/1-calm-128.webp":"d7449561e3","rage2-girl/1-calm-160.webp":"7e87046eaa","rage2-girl/1-calm-64.webp":"10c4c7a96d","rage2-girl/1-calm-96.webp":"fc6504b24c","rage2-girl/2-mild-128.webp":"a35ff116f4","rage2-girl/2-mild-160.webp":"32fc5e6b6f","rage2-girl/2-mild-64.webp":"9f37e8d8c9","rage2-girl/2-mild-96.webp":"f00e20300b","rage2-girl/3-frown-128.webp":"247cdab16f","rage2-girl/3-frown-160.webp":"8e34aeb12b","rage2-girl/3-frown-64.webp":"09cca6ddc4","rage2-girl/3-frown-96.webp":"ffa80033c6","rage2-girl/4-teeth-128.webp":"de38140be7","rage2-girl/4-teeth-160.webp":"070768475f","rage2-girl/4-teeth-64.webp":"2b5869f003","rage2-girl/4-teeth-96.webp":"6b2231dcc7","rage2-girl/5-shout-128.webp":"1da10c8564","rage2-girl/5-shout-160.webp":"06befdc001","rage2-girl/5-shout-64.webp":"3b60156bfd","rage2-girl/5-shout-96.webp":"220470bd91","rage2/1-calm-128.webp":"0e898b500b","rage2/1-calm-160.webp":"0965eb22cb","rage2/1-calm-64.webp":"0f332c1438","rage2/1-calm-96.webp":"a262c501c8","rage2/2-mild-128.webp":"210ba04846","rage2/2-mild-160.webp":"c45baba049","rage2/2-mild-64.webp":"c3bef93b2c","rage2/2-mild-96.webp":"01858f5a87","rage2/3-frown-128.webp":"180fcd7f2d","rage2/3-frown-160.webp":"9aaa3b9173","rage2/3-frown-64.webp":"4c0becd377","rage2/3-frown-96.webp":"f227d06780","rage2/4-teeth-128.webp":"ca1f1b4fd2","rage2/4-teeth-160.webp":"ea30cee1ca","rage2/4-teeth-64.webp":"ffa66e7ae4","rage2/4-teeth-96.webp":"58f3de234d","rage2/5-shout-128.webp":"e58192759e","rage2/5-shout-160.webp":"b71369973d","rage2/5-shout-64.webp":"3810f46401","rage2/5-shout-96.webp":"66a50bacb7","rent/RENT_01.thumb.webp":"34d870ee8d","rent/RENT_01.webp":"3edda88f8c","rent/RENT_02.thumb.webp":"8f706c3e02","rent/RENT_02.webp":"c7cda4fb8d","rent/RENT_03.thumb.webp":"70374b4cea","rent/RENT_03.webp":"484bda6d26","rent/RENT_04.thumb.webp":"0d4b4af420","rent/RENT_04.webp":"ba902252b6","rent/RENT_05.thumb.webp":"3135cf3251","rent/RENT_05.webp":"fc44b26090","rent/RENT_06.thumb.webp":"b7c3368797","rent/RENT_06.webp":"8058f1b02b","rent/RENT_07.thumb.webp":"07a62ad6a3","rent/RENT_07.webp":"06001d712a","rent/RENT_08.thumb.webp":"b347e73f4a","rent/RENT_08.webp":"55d250216d","rent/RENT_09.thumb.webp":"2599ce8bce","rent/RENT_09.webp":"af513268c9"} || {};
const KEEP = new Set([CACHE, ART]);
const FLAG_OFF = 'art-cache-off';
const scopeUrl = new URL(self.registration.scope);
const artBase = new URL('art/', scopeUrl).href;
let artOff = null; // null = not read yet (the flag survives worker restarts in the shell cache)
const isOff = async () => {
  if (artOff === null) artOff = !!(await caches.open(CACHE).then((c) => c.match(FLAG_OFF)).catch(() => undefined));
  return artOff;
};
const setOff = async (off) => {
  artOff = off;
  const c = await caches.open(CACHE);
  if (off) { await c.put(FLAG_OFF, new Response('1')); await caches.delete(ART); } else await c.delete(FLAG_OFF);
};
/** the current-build key of an art request, or null when it is not a cacheable art URL */
const artKey = (u) => {
  if (u.origin !== scopeUrl.origin || !u.href.startsWith(artBase)) return null;
  const path = decodeURIComponent(u.pathname.slice(new URL(artBase).pathname.length));
  const v = ART_V[path];
  if (!v) return null;
  const q = [...u.searchParams.keys()];
  if (q.length !== 1 || u.searchParams.get('v') !== v) return null; // an old / other build's hash, or an image-heal retry
  return `${artBase}${path}?v=${v}`;
};
async function prune() {
  const c = await caches.open(ART);
  for (const r of await c.keys()) { if (artKey(new URL(r.url)) !== r.url) await c.delete(r); }
}
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!KEEP.has(k)) await caches.delete(k);
    await prune().catch(() => {});
    await self.clients.claim();
  })());
});
async function artFetch(e, req, key) {
  if (await isOff()) return fetch(req);
  const c = await caches.open(ART);
  const hit = await c.match(key);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.status === 200 && res.type === 'basic') { const copy = res.clone(); e.waitUntil(c.put(key, copy).catch(() => {})); }
  return res;
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode !== 'navigate') {
    let key = null;
    try { key = artKey(new URL(req.url)); } catch { /* not a URL we know */ }
    if (key) e.respondWith(artFetch(e, req, key).catch(() => fetch(req)));
    return; // everything else: pass-through, the browser handles it as normal
  }
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
/** save every current picture not on the phone yet, 2 at a time, low priority (mostly from the browser's own cache) */
let filling = null;
async function backfill() {
  if (await isOff()) return { added: 0 };
  const c = await caches.open(ART);
  const have = new Set((await c.keys()).map((r) => r.url));
  const todo = Object.entries(ART_V).map(([p, v]) => `${artBase}${p}?v=${v}`).filter((u) => !have.has(u));
  let added = 0;
  const one = async () => {
    for (let u = todo.shift(); u; u = todo.shift()) {
      try { const r = await fetch(u, { priority: 'low' }); if (r.ok && r.status === 200 && !(await isOff())) { await c.put(u, r); added++; } } catch { /* next visit */ }
    }
  };
  await Promise.all([one(), one()]);
  return { added };
}
self.addEventListener('message', (e) => {
  const m = e.data || {};
  if (m.type !== 'art-cache') return;
  e.waitUntil((async () => {
    await setOff(!m.on);
    if (m.on && m.backfill) { filling ??= backfill().finally(() => { filling = null; }); await filling; }
    const c = await caches.open(ART);
    const n = (await c.keys()).length;
    e.source?.postMessage?.({ type: 'art-cache', on: !artOff, cached: n, total: Object.keys(ART_V).length });
  })());
});
