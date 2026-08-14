const CACHE_NAME = "A.H.M.A-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/login.html",
  "/plantopedia.html",
  "/sensores.html",
  "/manifest.json",
  "/sw.js",

  // Serviços e utilitários
  "/services/plant-service.js",

  // CSS Base
  "/assets/css/base/reset.css",
  "/assets/css/base/typography.css",
  "/assets/css/base/variables.css",

  // CSS Componentes
  "/assets/css/components/content-boxes.css",
  "/assets/css/components/footer.css",
  "/assets/css/components/header.css",
  "/assets/css/components/nav-hamburger.css",

  // CSS Páginas
  "/assets/css/pages/login.css",
  "/assets/css/pages/plantopedia.css",
  "/assets/css/pages/sensores.css",
];
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', (event) => {
 
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      
      if (cachedResponse) {
        return cachedResponse;
      }
      // 
      return fetch(event.request);
    })
  );
});
