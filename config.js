/**
 * Edit these defaults or override location settings with URL parameters:
 * ?lat=52.4357&lon=13.5406&name=Berlin-Adlershof&timezone=Europe/Berlin
 */
export const DEFAULT_CONFIG = Object.freeze({
  version: "2.2.0",
  latitude: 52.4357,
  longitude: 13.5406,
  locationName: "Berlin-Adlershof",
  timezone: "Europe/Berlin",
  locale: "de-DE",
  // Keep credentials and required identification headers in a server-side proxy.
  weatherProvider: "openMeteoDwd",
  providerProxyUrl: "",
  refreshIntervalMinutes: 10,
  flipIntervalSeconds: 30,
  retryIntervalSeconds: 60,
  cacheMaxAgeHours: 12,
  forecastDays: 7,
});
