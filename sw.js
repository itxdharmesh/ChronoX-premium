/**
 * ChronoX Service Worker
 * Handles caching and offline support
 */

const CACHE_NAME = 'chronox-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/global.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/theme.css',
    '/css/utility.css',
    '/js/utils.js',
    '/js/storage.js',
    '/js/database.js',
    '/js/auth.js',
    '/js/router.js',
    '/js/app.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Strategy - Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        return response;
                    });
            })
            .catch(() => {
                return new Response('Offline - Please check your connection');
            })
    );
});
