const CACHE_NAME = "A.H.M.A-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./plantopedia.html",
  "./sensores.html",
  "./manifest.json",

  "./src/services/plant-service.js",

  "./assets/css/base/reset.css",
  "./assets/css/base/typography.css",
  "./assets/css/base/variables.css",

  "./assets/css/components/content-boxes.css",
  "./assets/css/components/footer.css",
  "./assets/css/components/header.css",
  "./assets/css/components/nav-hamburger.css",

  "./assets/css/pages/login.css",
  "./assets/css/pages/plantopedia.css",
  "./assets/css/pages/sensores.css",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache
            .add(url)
            .catch((err) => console.warn("[PWA] Falhou ao cachear:", url, err)),
        ),
      );
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("[PWA] Removendo cache antigo:", cache);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); 
          });
          return networkResponse;
        })
        .catch(() => cachedResponse); // se offline, cai no cache

      return cachedResponse || fetchPromise;
    }),
  );
});
