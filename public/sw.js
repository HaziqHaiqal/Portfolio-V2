/*
 * Reusable PWA service worker.
 * Registered by <PwaKit> as /sw.js?v=<version>&offline=<path>, with the site's
 * scope. Pages are network-first with a timeout, so a weak signal falls back
 * to the last saved copy; assets are served from cache and refreshed behind.
 */
const params = new URL(self.location.href).searchParams;
const VERSION = params.get('v') || '1';
const OFFLINE_URL = params.get('offline') || '/offline';
const PREFIX = `pwa:${self.registration.scope}:`;
const PAGES = `${PREFIX}pages:${VERSION}`;
const ASSETS = `${PREFIX}assets:${VERSION}`;
const NETWORK_TIMEOUT_MS = 4000;
const MAX_PAGES = 30;
const MAX_ASSETS = 120;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(PREFIX) && key !== PAGES && key !== ASSETS
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - max))
      .map((key) => cache.delete(key))
  );
}

const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  );

async function networkFirst(event) {
  const cache = await caches.open(PAGES);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then(async (response) => {
    if (response.ok) {
      await cache.put(event.request, response.clone());
      await trim(cache, MAX_PAGES);
    }
    return response;
  });
  event.waitUntil(network.catch(() => undefined));
  try {
    return await (cached
      ? Promise.race([network, timeout(NETWORK_TIMEOUT_MS)])
      : network);
  } catch {
    return cached || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then(async (response) => {
    // Opaque responses are cross-origin images, such as hotlinked photos.
    if (response.ok || response.type === 'opaque') {
      await cache.put(event.request, response.clone());
      await trim(cache, MAX_ASSETS);
    }
    return response;
  });
  if (cached) {
    event.waitUntil(network.catch(() => undefined));
    return cached;
  }
  return network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    if (url.origin === self.location.origin)
      event.respondWith(networkFirst(event));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isAsset =
    (sameOrigin && url.pathname.startsWith('/_next/static/')) ||
    ['image', 'font', 'style', 'script'].includes(request.destination);
  // Data requests (RSC payloads, APIs) always go to the network.
  if (isAsset) event.respondWith(staleWhileRevalidate(event));
});
