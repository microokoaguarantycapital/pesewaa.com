'use strict';

const CACHE_NAME = 'pesewa-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // CSS files
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/dashboard.css',
  '/assets/css/forms.css',
  '/assets/css/tables.css',
  '/assets/css/animations.css',
  
  // JavaScript files
  '/assets/js/app.js',
  '/assets/js/utils.js',
  '/assets/js/auth.js',
  '/assets/js/roles.js',
  '/assets/js/groups.js',
  '/assets/js/lending.js',
  '/assets/js/borrowing.js',
  '/assets/js/ledger.js',
  '/assets/js/calculator.js',
  '/assets/js/countries.js',
  '/assets/js/pwa.js',
  
  // Images
  '/assets/images/logo.svg',
  
  // Pages
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/qa.html',
  '/pages/groups.html',
  '/pages/lending.html',
  '/pages/borrowing.html',
  '/pages/ledger.html',
  '/pages/blacklist.html',
  '/pages/debt-collectors.html',
  '/pages/subscriptions.html',
  '/pages/admin.html',
  
  // Dashboard pages
  '/pages/dashboard/borrower-dashboard.html',
  '/pages/dashboard/lender-dashboard.html',
  '/pages/dashboard/admin-dashboard.html',
  
  // Country pages
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
  '/pages/countries/ghana.html'
];

// Install event - cache assets
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
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          response => {
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
          }
        ).catch(error => {
          // Return offline page for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          
          // Return error for other requests
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(syncForms());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Pesewa.com',
    icon: '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Pesewa.com', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncForms() {
  const db = await openFormDatabase();
  const forms = await db.getAll('pendingForms');
  
  for (const form of forms) {
    try {
      const response = await fetch(form.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form.data)
      });
      
      if (response.ok) {
        await db.delete('pendingForms', form.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

function openFormDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PesewaForms', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingForms')) {
        db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onerror = event => {
      reject(event.target.error);
    };
  });
}