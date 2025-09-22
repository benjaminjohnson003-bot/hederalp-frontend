// Service Worker for SaucerSwap V2 LP Strategy Analyzer
const CACHE_NAME = 'lp-analyzer-v1.0.0';
const STATIC_CACHE_NAME = 'lp-analyzer-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'lp-analyzer-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other critical assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/pools/,
  /\/api\/health/,
  /\/api\/ohlcv/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE_NAME && 
                   cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (isAPIRequest(url)) {
    // API requests - Cache first for GET, network for others
    event.respondWith(apiCacheStrategy(request));
  } else if (isStaticAsset(url)) {
    // Static assets - Cache first
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Default - Network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network first strategy (for HTML and critical requests)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML documents
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response(
        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', request.url, error);
    throw error;
  }
}

// API cache strategy (for API requests)
async function apiCacheStrategy(request) {
  const url = new URL(request.url);
  
  // For health checks, always try network first
  if (url.pathname.includes('/health')) {
    try {
      const networkResponse = await fetch(request);
      return networkResponse;
    } catch (error) {
      // Return cached health status if available
      const cachedResponse = await caches.match(request);
      return cachedResponse || new Response(
        JSON.stringify({ status: 'offline', message: 'Service worker offline mode' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 503
        }
      );
    }
  }
  
  // For other API requests, try cache first
  const cachedResponse = await caches.match(request);
  
  // Check if cached data is still fresh (5 minutes for API data)
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - cachedDate < fiveMinutes) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      console.log('[SW] Network failed, returning stale cache:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') ||
         url.pathname.startsWith('/assets/') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncPendingAnalyses());
  }
});

// Sync pending analyses when back online
async function syncPendingAnalyses() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    // Find pending analysis requests
    const pendingAnalyses = requests.filter(request => 
      request.url.includes('/api/advanced-lp-strategy') && 
      request.method === 'POST'
    );
    
    for (const request of pendingAnalyses) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from cache once synced
          cache.delete(request);
          
          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { url: request.url }
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync analysis:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'LP Analysis Complete',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LP Strategy Analyzer', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ANALYSIS') {
    // Cache analysis data for offline use
    event.waitUntil(cacheAnalysisData(event.data.payload));
  }
});

// Cache analysis data
async function cacheAnalysisData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'date': new Date().toISOString()
      }
    });
    
    await cache.put('/offline-analysis', response);
    console.log('[SW] Analysis data cached for offline use');
  } catch (error) {
    console.error('[SW] Failed to cache analysis data:', error);
  }
}

