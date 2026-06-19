// Service Worker for ChronoX PWA
const CACHE_NAME = 'chronox-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/games.css',
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/auth.js',
    '/js/app.js'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            });
        })
    );
});
