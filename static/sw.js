const CACHE_NAME = "aura-mobile-v3"; // change version when update

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (e) => {
  if (!e.request.url.startsWith("http")) return;

  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;

      return fetch(e.request)
        .then(network => {
          const clone = network.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, clone);
          });
          return network;
        })
        .catch(() => {
          return caches.match("/index.html");
        });
    })
  );
});
