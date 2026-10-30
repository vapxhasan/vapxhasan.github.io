/* Service worker: offline fallback + faster repeat visits.
   Bump VERSION whenever you want every visitor to drop old cached files. */
const VERSION   = 'v2';
const STATIC    = 'static-' + VERSION;
const PAGES     = 'pages-' + VERSION;
const OFFLINE   = '/offline.html';
const SLOW_MS   = 8000;               // network slower than this -> show last saved copy of the page
const PRECACHE  = [OFFLINE, '/favicon.png', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {
        if (u === OFFLINE) throw new Error('offline.html missing');   // the offline page is required, the rest is optional
      }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // Firebase, fonts, YouTube etc. go straight to network
  if (url.searchParams.has('ping')) return;               // reachability checks must never be cached

  if (req.mode === 'navigate') { event.respondWith(handlePage(req)); return; }
  if (/\.(?:css|js|png|jpe?g|webp|avif|svg|gif|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

/* Pages: network first. If it fails or is very slow, fall back to the last saved copy, then to offline.html */
async function handlePage(req) {
  const cache = await caches.open(PAGES);
  try {
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    const timer = new Promise((resolve) => setTimeout(() => resolve(null), SLOW_MS));
    const first = await Promise.race([network, timer]);
    if (first) return first;
    const saved = await cache.match(req, { ignoreSearch: true });
    return saved || await network;                        // nothing saved yet: keep waiting for the network
  } catch (err) {
    const saved = await cache.match(req, { ignoreSearch: true });
    return saved || (await caches.match(OFFLINE)) || Response.error();
  }
}

/* Static files: serve instantly from cache, refresh in the background */
async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(req);
  const refresh = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await refresh) || Response.error();
}
