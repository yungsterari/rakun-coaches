const CACHE = 'rakun-coaches-v1';
const PAGE = './rakun-quincenas-coaches.html';
const FONTS = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    try { await c.add(new Request(PAGE, { cache: 'reload' })); } catch (_) {}
    try { await c.add(new Request(FONTS, { mode: 'no-cors' })); } catch (_) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Con internet: carga la versión más nueva y la guarda. Sin internet: usa la guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const res = await fetch(e.request);
      if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
      return res;
    } catch (err) {
      const hit = await c.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      if (e.request.mode === 'navigate') {
        const page = await c.match(PAGE);
        if (page) return page;
      }
      throw err;
    }
  })());
});
