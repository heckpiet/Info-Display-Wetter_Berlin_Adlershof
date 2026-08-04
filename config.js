/**
 * Edit these defaults or override location settings with URL parameters:
 * ?lat=52.4357&lon=13.5406&name=Berlin-Adlershof&timezone=Europe/Berlin
 */
export const DEFAULT_CONFIG = Object.freeze({
  version: "3.4.0",
  latitude: 52.4357,
  longitude: 13.5406,
  locationName: "Berlin-Adlershof",
  timezone: "Europe/Berlin",
  locale: "de-DE",
  // Keep credentials and required identification headers in a server-side proxy.
  weatherProvider: "openMeteoDwd",
  providerProxyUrl: "",
  themeMode: "auto",
  fontScale: 1,
  density: "comfortable",
  informationMode: "detailed",
  forecastRotation: "auto",
  yearProgressMode: "both",
  layoutMode: "auto",
  deviceProfile: "auto",
  displayScale: 1,
  contentWidthPercent: 100,
  controlsAutoHideSeconds: 8,
  refreshIntervalMinutes: 10,
  flipIntervalSeconds: 30,
  retryIntervalSeconds: 60,
  cacheMaxAgeHours: 12,
  forecastDays: 7,
});
