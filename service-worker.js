'use strict';

const CACHE_NAME = 'pesewa-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/dashboard.css',
  '/assets/css/forms.css',
  '/assets/css/tables.css',
  '/assets/css/animations.css',
  '/assets/js/app.js',
  '/assets/js/auth.js',
  '/assets/js/roles.js',
  '/assets/js/groups.js',
  '/assets/js/lending.js',
  '/assets/js/borrowing.js',
  '/assets/js/ledger.js',
  '/assets/js/blacklist.js',
  '/assets/js/subscriptions.js',
  '/assets/js/countries.js',
  '/assets/js/collectors.js',
  '/assets/js/calculator.js',
  '/assets/js/pwa.js',
  '/assets/js/utils.js',
  '/assets/images/logo.svg',
  '/pages/dashboard/borrower-dashboard.html',
  '/pages/dashboard/lender-dashboard.html',
  '/pages/dashboard/admin-dashboard.html',
  '/pages/lending.html',
  '/pages/borrowing.html',
  '/pages/ledger.html',
  '/pages/groups.html',
  '/pages/subscriptions.html',
  '/pages/blacklist.html',
  '/pages/debt-collectors.html',
  '/pages/about.html',
  '/pages/qa.html',
  '/pages/contact.html',
  '/pages/countries/index.html',
  '/pages/countries/kenya.html',
  '/pages/countries/uganda.html',
  '/pages/countries/tanzania.html',
  '/pages/countries/rwanda.html',
  '/pages/countries/burundi.html',
  '/pages/countries/somalia.html',
  '/pages/countries/south-sudan.html',
  '/pages/countries/ethiopia.html',
  '/pages/countries/congo.html',
  '/pages/countries/nigeria.html',
  '/pages/countries/south-africa.html',
  '/pages/countries/ghana.html',
  '/data/countries.json',
  '/data/subscriptions.json',
  '/data/categories.json',
  '/data/collectors.json',
  '/data/demo-groups.json',
  '/data/demo-users.json',
  '/data/demo-ledgers.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and Chrome extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip API calls (they should be handled by network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          // For other file types, return a placeholder or nothing
          return new Response('You are offline. Please check your connection.', {
            status: 503,
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

// Background sync for form submissions when online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  // This function would sync any pending form submissions
  // For now, we just log it
  console.log('Syncing forms...');
  // In a real app, you would get pending submissions from IndexedDB and send them
}

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Pesewa',
    icon: '/assets/images/logo.svg',
    badge: '/assets/images/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pesewa', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          if (windowClients.length > 0) {
            return windowClients[0].focus();
          } else {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cache') {
      event.waitUntil(updateCache());
    }
  });
}

async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of urlsToCache) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log(`Failed to update cache for ${url}:`, error);
    }
  }
}