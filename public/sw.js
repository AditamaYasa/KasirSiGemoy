const CACHE_NAME = "pos-system-v1"
const RUNTIME_CACHE = "pos-system-runtime-v1"
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error("[v0] Some assets failed to cache:", err)
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network first for API, cache first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clonedResponse = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log("[v0] Returning cached API response:", url.pathname)
              return cached
            }
            // Return offline response
            return new Response(JSON.stringify({ error: "Offline - cached data may be unavailable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            })
          })
        }),
    )
    return
  }

  // For HTML pages and other assets - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response
        }

        // Cache successful responses
        const clonedResponse = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, clonedResponse)
        })
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log("[v0] Returning cached response:", url.pathname)
            return cached
          }

          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/").catch(() => {
              return new Response("Offline - halaman tidak tersedia", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              })
            })
          }

          return new Response("Offline", { status: 503 })
        })
      }),
  )
})

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
