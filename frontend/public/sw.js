const CACHE_NAME = 'zibonbaba-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore webpack HMR / hot-reload sockets in development
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('webpack-hmr') || url.pathname.includes('hot-update')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            // Cache static assets
            if (
              url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2|json)$/) ||
              url.pathname === '/'
            ) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and user requests a page, render fallback HTML
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return new Response(
              `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline | Zibonbaba</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 50px 20px; background: #F8F9FA; color: #1F2937; }
                  .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                  h1 { color: #E0A800; font-size: 24px; margin-bottom: 10px; }
                  p { color: #4B5563; font-size: 14px; margin-bottom: 25px; line-height: 1.5; }
                  .btn { display: inline-block; background: #1F2937; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; transition: background 0.2s; }
                  .btn:hover { background: #FFC107; color: #1F2937; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Offline Connection</h1>
                  <p>You are currently browsing offline. Zibonbaba app is running in cached fallback mode. Check your connection and try again.</p>
                  <a href="/" class="btn">Reload Web App</a>
                </div>
              </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
    })
  );
});
