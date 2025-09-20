// Service Worker for Pots Financial App
// Provides offline functionality and caching

const CACHE_NAME = 'pots-finance-v1';
const STATIC_CACHE = 'pots-static-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for pending transactions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Sync pending transactions when online
async function syncTransactions() {
  try {
    // This would normally sync with your backend
    console.log('Service Worker: Syncing pending transactions...');
    
    // Get pending transactions from IndexedDB or localStorage
    // For now, we'll just log that sync would happen here
    
    // In a real implementation:
    // 1. Get pending transactions from local storage
    // 2. Send them to your backend API
    // 3. Remove them from local storage on success
    // 4. Notify the main thread of sync completion
    
    // Send message to main thread
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: { message: 'Transactions synced successfully' }
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    
    // Notify main thread of sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        payload: { error: error.message }
      });
    });
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_TRANSACTION') {
    // Cache a transaction for offline sync
    cacheTransaction(event.data.payload);
  }
});

// Cache transaction for later sync
function cacheTransaction(transaction) {
  // In a real app, you'd store this in IndexedDB
  console.log('Service Worker: Caching transaction for sync', transaction);
}

// Notification handlers (for budget alerts, etc.)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});

// Push notifications (for budget alerts)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Pots',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Pots Finance', options)
  );
});

console.log('Service Worker: Loaded successfully');
