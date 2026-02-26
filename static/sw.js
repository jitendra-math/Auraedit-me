const CACHE_NAME = "aura-mobile-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// install
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// activate
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (e) => {
  if (!e.request.url.startsWith("http")) return;

  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;

      return fetch(e.request).then(network => {
        const clone = network.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, clone);
        });
        return network;
      }).catch(() => {
        return caches.match("/index.html");
      });
    })
  );
});