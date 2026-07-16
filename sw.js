// sw.js - Service Worker for WhatsApp India Direct PWA

const CACHE_NAME = 'whatsapp-india-direct-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    // Add any other assets you want to cache (CSS, JS, images)
    // Note: Font Awesome and other CDN resources are loaded from CDN
    // You can optionally cache them here if you want offline support
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Skip waiting to activate immediately');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
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
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses or external resources
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched resource for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                try {
                                    cache.put(event.request, responseToCache);
                                } catch (e) {
                                    console.warn('[SW] Failed to cache:', event.request.url, e);
                                }
                            });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline fallback
                        // You can return a custom offline page here if needed
                        console.warn('[SW] Network and cache failed for:', event.request.url);
                        return new Response('Offline - Please check your internet connection', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle push notifications (optional - can be implemented later)
self.addEventListener('push', (event) => {
    // Placeholder for push notifications if needed
    console.log('[SW] Push notification received:', event);
});

// Handle background sync (optional - can be implemented later)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event);
});

// Log service worker events
console.log('[SW] WhatsApp India Direct service worker loaded');
