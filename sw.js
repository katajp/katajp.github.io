const CACHE_NAME = "kp-pwa-cache-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./css/layout.css",
  "./css/chart.css",
  "./css/modal.css",
  "./css/quiz.css",
  "./css/progress.css",
  "./js/app.js",
  "./js/core/constants.js",
  "./js/core/utils.js",
  "./js/core/language.js",
  "./js/core/theme.js",
  "./js/core/tts.js",
  "./js/core/storage.js",
  "./js/core/router.js",
  "./js/data/hiragana.js",
  "./js/data/katakana.js",
  "./js/data/jlpt.js",
  "./js/data/categories.js",
  "./js/data/vocabulary.js",
  "./js/quiz/engine.js",
  "./js/quiz/setup.js",
  "./js/quiz/session.js",
  "./js/quiz/progress.js",
  "./js/quiz/review.js",
  "./js/quiz/weighted.js",
  "./js/stages/read.js",
  "./js/stages/recall.js",
  "./js/stages/typing.js",
  "./js/stages/listening.js",
  "./js/stages/matching.js",
  "./js/stages/writing.js",
  "./js/stages/vocabulary.js",
  "./js/ui/chart.js",
  "./js/ui/modal.js",
  "./js/ui/progress.js",
  "./js/ui/navigation.js",
  "./js/components/toast.js",
  "./js/components/progressBar.js",
  "./js/components/button.js",
  "./js/components/timer.js",
  "./js/components/dialog.js",
  "./js/api/cache.js",
  "./js/api/dictionary.js",
  "./js/api/vocabulary.js",
  "./js/api/jlptVocabApi.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon.svg"
];

// Install Service Worker
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch resources
self.addEventListener("fetch", (e) => {
  // Respect the offline requirement: do not serve from cache if offline block is active
  // But standard Service Worker fetch is fine because UI navigator.onLine blocks it.
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
