/* FounderDash Service Worker v3 */
const CACHE = 'founderdash-v3';
const STATIC = [
  './',
  './index.html',
  './assets/manifest.json',
  './sw.js',
];

/* Install: cache core shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

/* Activate: delete old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch: network-first for API/Google, cache-first for shell */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET, cross-origin video/heavy media, Google APIs
  if (e.request.method !== 'GET') return;
  if (url.hostname.includes('imgur.com')) return;          // videos load fresh
  if (url.hostname.includes('googleapis.com')) return;     // Google APIs
  if (url.hostname.includes('accounts.google.com')) return;
  if (url.hostname.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
