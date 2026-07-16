
const CACHE_NAME = "whatsapp-v2";
const ASSETS_TO_CACHE = [
  "/WhatsappSender/",
  "/WhatsappSender/index.html",
  "/WhatsappSender/manifest.json",
  "/WhatsappSender/icons/icon-192x192.png"
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of ASSETS_TO_CACHE) {
        try {
          console.log("Caching:", file);

          const response = await fetch(file);

          console.log(file, response.status);

          await cache.put(file, response);
        } catch (err) {
          console.error("FAILED:", file, err);
        }
      }

      self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

console.log('[SW] WhatsApp India Direct service worker loaded');
