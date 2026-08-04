# Offline and recovery behavior

The service worker caches the application shell so the display can start offline after one successful online visit. Forecast responses remain in the location/provider-specific `localStorage` cache and expire after `cacheMaxAgeHours`.

Failed refreshes use exponential backoff up to 15 minutes. Success resets the delay. Cached data is marked offline with its age; expired data is never presented as current. Browser and operating-system restart remain kiosk-device responsibilities.

Every local stylesheet, script, module import, manifest, and service-worker registration carries the application release version. A newly deployed HTML document therefore requests one matching release set instead of reusing same-named files from an older shell cache. CI rejects releases with mismatched asset versions.
