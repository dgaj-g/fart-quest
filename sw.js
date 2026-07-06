// FART QUEST — sw.js (UI agent)
const CACHE_V = 'fq-v3';

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.webmanifest',

  'css/main.css',
  'css/battle.css',
  'css/lesson.css',
  'css/formats.css',

  'js/main.js',
  'js/router.js',
  'js/db.js',
  'js/state.js',
  'js/rng.js',
  'js/audio.js',
  'js/engine/battle.js',
  'js/engine/lesson.js',
  'js/engine/formats/mcq.js',
  'js/engine/formats/numpad.js',
  'js/engine/formats/index.js',
  'js/gen/placevalue.js',
  'js/gen/decimals.js',
  'js/gen/rounding.js',
  'js/gen/index.js',
  'js/screens/title.js',
  'js/screens/map.js',
  'js/screens/topic.js',
  'js/screens/lesson.js',
  'js/screens/battle.js',
  'js/screens/collection.js',
  'js/screens/armoury.js',
  'js/screens/parent.js',
  'js/screens/settings.js',

  'data/topics/place-value.js',
  'data/topics/decimals-x10.js',
  'data/topics/rounding.js',
  'data/map.js',
  'data/creatures.js',

  'assets/fonts/fredoka-500.woff2',
  'assets/fonts/fredoka-700.woff2',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
  'assets/apple-touch-180.png',
  'assets/monsters/baron-bumdigit.png',
  'assets/monsters/baron-bumdigit-shiny.png',
  'assets/monsters/pointy-mcpoopants.png',
  'assets/monsters/pointy-mcpoopants-shiny.png',
  'assets/monsters/sir-roundbottom.png',
  'assets/monsters/sir-roundbottom-shiny.png',
  'assets/monsters/stinkling-1.png',
  'assets/monsters/stinkling-2.png',
  'assets/monsters/stinkling-3.png',
  'assets/monsters/stinkling-4.png',
  'assets/monsters/stinkling-5.png',
  'assets/monsters/stinkling-6.png',
  'assets/monsters/whiffbeard.png',
  'assets/monsters/countfather-silhouette.png',
  'assets/ui/hill-1.png',
  'assets/ui/hill-2.png',
  'assets/ui/tree-1.png',
  'assets/ui/tree-2.png',
  'assets/ui/cloud-1.png',
  'assets/ui/cloud-2.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_V).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {
      // best-effort: cache what we can individually so one missing file
      // doesn't block install entirely.
      return Promise.all(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
      );
    }))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_V).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isVoManifest(url) {
  return url.pathname.endsWith('/audio/vo/manifest.json');
}

function isAudio(url) {
  return url.pathname.includes('/audio/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // VO manifest: network-first so new recordings show up immediately.
  if (isVoManifest(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_V).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // audio/**: runtime cache-first
  if (isAudio(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_V).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // everything else (shell): cache-first, fall back to network, then update cache
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_V).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
