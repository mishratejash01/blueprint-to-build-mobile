// public/sw.js
const CACHE_NAME = 'veggieit-v2'; // Bumped cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Deletes old 'veggieit-v1' cache
          }
        })
      );
    })
  );
  self.clients.claim();
});

// MODIFIED: Network First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request) // 1. Try to fetch from the network
      .then((response) => {
        // 2. If successful, cache the new response
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 3. If network fails, fall back to the cache
        return caches.match(event.request);
      })
  );
});
