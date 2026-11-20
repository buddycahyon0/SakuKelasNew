/* SakuKelas service worker.
 * Setiap rilis: naikkan CACHE_VERSION supaya HP user mengambil file baru. */
const CACHE_VERSION = 14;
const CACHE = 'sakukelas-k1-v' + CACHE_VERSION;
const ASSETS = [
  './index.html',
  './styles.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/nunito-500.woff2',
  './fonts/nunito-600.woff2',
  './fonts/nunito-700.woff2',
  './fonts/nunito-800.woff2',
  './fonts/nunito-900.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => (k.startsWith('pintarsd-') || k.startsWith('sakukelas-')) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache dulu (cepat & offline), perbarui diam-diam di belakang layar.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // YouTube dll lewat jaringan biasa

  const isNav = req.mode === 'navigate';
  const key = isNav ? './index.html' : req;

  event.respondWith(
    caches.match(key).then((hit) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy));
        }
        return res;
      }).catch(() => null);
      if (hit) return hit;
      return network.then((res) => res || (isNav
        ? new Response('Offline. Buka sekali dengan internet dulu.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        : Response.error()));
    })
  );
});
