const CACHE_NAME = 'marmaid-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/01-reset.css',
  '/assets/css/02-theme.css',
  '/assets/css/03-layout.css',
  '/assets/css/04-components.css',
  '/js/01-app-init.js',
  '/js/02-router.js',
  '/js/03-pwa-install.js',
  '/pages/home/home.html',
  '/pages/home/home.css',
  '/pages/home/home.js',
  '/pages/escort-selection/escort-selection.html',
  '/pages/escort-selection/escort-selection.css',
  '/pages/escort-selection/escort-selection.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          
          return response;
        });
      })
      .catch(() => {
        // If offline and request fails, return offline page
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-location') {
    event.waitUntil(syncLocationData());
  }
});

async function syncLocationData() {
  const db = await openDatabase();
  const locations = await db.getAll('locations');
  
  for (const location of locations) {
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
      await db.delete('locations', location.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MarmaidDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('locations')) {
        db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      resolve({
        getAll: (storeName) => {
          return new Promise((res, rej) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => res(request.result);
            request.onerror = () => rej(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((res, rej) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => res();
            request.onerror = () => rej(request.error);
          });
        }
      });
    };
    
    request.onerror = reject;
  });
}