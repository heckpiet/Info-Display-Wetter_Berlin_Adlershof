/**
 * Edit these defaults or override location settings with URL parameters:
 * ?lat=52.4357&lon=13.5406&name=Berlin-Adlershof&timezone=Europe/Berlin
 */
export const DEFAULT_CONFIG = Object.freeze({
  version: "2.0.1",
  latitude: 52.4357,
  longitude: 13.5406,
  locationName: "Berlin-Adlershof",
  timezone: "Europe/Berlin",
  locale: "de-DE",
  refreshIntervalMinutes: 10,
  flipIntervalSeconds: 30,
  retryIntervalSeconds: 60,
  cacheMaxAgeHours: 12,
  forecastDays: 7,
});
