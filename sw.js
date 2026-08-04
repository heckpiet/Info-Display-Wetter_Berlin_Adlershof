const VERSION = "3.17.0";
const CACHE = `weather-display-shell-v${VERSION}`;
const asset = (path) => `${path}?v=${VERSION}`;
const ICON_PACKS = ["fill", "flat", "line", "animated"];
const ICON_NAMES = [
  "clear-day",
  "clear-night",
  "mostly-clear-day",
  "mostly-clear-night",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "overcast",
  "fog",
  "drizzle",
  "sleet",
  "rain",
  "snow",
  "partly-cloudy-day-rain",
  "partly-cloudy-night-rain",
  "partly-cloudy-day-snow",
  "partly-cloudy-night-snow",
  "thunderstorms",
  "thunderstorms-hail",
  "not-available",
];
const ICON_ASSETS = ICON_PACKS.flatMap((pack) =>
  ICON_NAMES.map((name) => asset(`./assets/meteocons/${pack}/${name}.svg`)),
);
const ASSETS = [
  "./",
  asset("./index.html"),
  asset("./styles.css"),
  asset("./app.js"),
  asset("./config.js"),
  asset("./weather.js"),
  asset("./providers.js"),
  asset("./settings.js"),
  asset("./progress.js"),
  asset("./display.js"),
  asset("./i18n.js"),
  asset("./version.js"),
  asset("./manifest.webmanifest"),
  ...ICON_ASSETS,
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached ?? caches.match(asset("./index.html"))),
      ),
  );
});
