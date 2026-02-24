const CACHE_NAME = 'clock-app-v7';
const CORE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

const OPTIONAL_ASSETS = [
  'https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fscenic_background-1771215837530.png',
  'https://placehold.co/192x192/008080/ffffff?text=Clock',
  'https://placehold.co/512x512/008080/ffffff?text=Clock'
];

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      // Cache core assets first - these MUST succeed
      return cache.addAll(CORE_ASSETS)
        .then(() => {
          // Try to cache optional assets (images) but don't fail installation if they fail
          // Use no-cors to handle opaque responses (cross-origin images)
          const optionalCaching = OPTIONAL_ASSETS.map(url => {
            const req = new Request(url, { mode: 'no-cors' });
            return fetch(req)
              .then(response => cache.put(req, response))
              .catch(err => console.warn('Failed to cache optional asset:', url, err));
          });
          return Promise.all(optionalCaching);
        });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching for time APIs to ensure we always get fresh time data
  if (event.request.url.includes('timeapi.io') || event.request.url.includes('worldtimeapi.org')) {
    return; // Fallback to network only
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
