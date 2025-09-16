// Service Worker for BrokenExp PWA
const CACHE_NAME = 'brokenexp-pwa-v1';
const STATIC_CACHE_NAME = 'brokenexp-static-v1';
const DYNAMIC_CACHE_NAME = 'brokenexp-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/auth.js',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png'
];

// Network-first resources (API calls, user data)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase/,
  /auth/
];

// Cache-first resources (static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /fonts\./
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed', error);
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
  
  // Skip cross-origin requests unless they're from our domain
  if (url.origin !== location.origin && !isAllowedOrigin(url.origin)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for API calls and dynamic content
    if (isNetworkFirst(url)) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (isCacheFirst(url)) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      return await staleWhileRevalidate(request);
    }
    
    // Default to network-first
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    // Return cached version if available
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request.url, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await getCachedResponse(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request.url, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await getCachedResponse(request);
  
  // Start network request in background
  const networkResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request.url, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn('Background update failed:', error);
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cached version, wait for network
  return await networkResponsePromise;
}

// Helper functions
function isNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

function isCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

function isAllowedOrigin(origin) {
  const allowedOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.supabase.com',
    'https://cdn.jsdelivr.net'
  ];
  
  return allowedOrigins.includes(origin);
}

async function getCachedResponse(request) {
  const staticCache = await caches.open(STATIC_CACHE_NAME);
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  
  return await staticCache.match(request) || await dynamicCache.match(request);
}

async function getOfflinePage() {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/offline.html');
    
    if (offlinePage) {
      return offlinePage;
    }
  } catch (error) {
    console.error('Error getting offline page:', error);
  }
  
  // Return a basic offline HTML if offline.html is not available
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - BROKEN EXPERIENCES</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(180deg, #FFFFFF 0%, #E0EFFF 100%);
                color: #18181B;
                text-align: center;
                padding: 20px;
            }
            .offline-container {
                max-width: 400px;
                padding: 40px 20px;
            }
            .offline-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: #F3F4F6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
            }
            h1 {
                font-size: 24px;
                margin-bottom: 12px;
                font-weight: 600;
            }
            p {
                color: #6B7280;
                line-height: 1.5;
                margin-bottom: 24px;
            }
            .retry-button {
                background: #18181B;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>Check your connection and try again when you're back online.</p>
            <button class="retry-button" onclick="location.reload()">Try Again</button>
        </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle offline actions stored in IndexedDB
    console.log('Service Worker: Performing background sync');
    
    // This would typically sync offline-stored data
    // Implementation depends on your specific needs
    
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BROKEN EXPERIENCES', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Script loaded');