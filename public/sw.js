const CACHE_NAME = 'vr-fps-cafe-v5.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - activate immediately for updates
self.addEventListener('install', (event) => {
  console.log('SW: Installing new version...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate immediately
        console.log('SW: Skipping waiting to activate immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating new version...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      console.log('SW: Taking control of all clients');
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the update and trigger reload
      console.log('SW: New version activated, notifying clients');
      return self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_ACTIVATED',
            version: CACHE_NAME,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // For HTML files, always try network first to get updates
  if (request.destination === 'document' || request.url.includes('.html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the fresh response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
  } else {
    // For other assets, use cache first
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request);
        })
    );
  }
});

// Simplified message handling - no complex update flows needed
self.addEventListener('message', (event) => {
  console.log('SW: Received message:', event.data);
  // Silent updates handle everything automatically
}); 