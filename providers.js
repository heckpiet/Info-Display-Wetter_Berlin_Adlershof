import { buildWeatherUrl, normalizeWeather } from "./weather.js?v=3.23.0";

export const WEATHER_PROVIDERS = Object.freeze({
  openMeteoDwd: Object.freeze({
    id: "openMeteoDwd",
    name: "Open-Meteo DWD ICON",
    attribution: "DWD ICON via Open-Meteo",
    transport: "direct",
  }),
  dwdOpenData: Object.freeze({
    id: "dwdOpenData",
    name: "DWD Open Data",
    attribution: "Deutscher Wetterdienst (DWD)",
    transport: "proxy",
  }),
  metNo: Object.freeze({
    id: "metNo",
    name: "MET Norway Locationforecast",
    attribution: "MET Norway",
    transport: "proxy",
  }),
  openWeather: Object.freeze({
    id: "openWeather",
    name: "OpenWeather One Call",
    attribution: "OpenWeather",
    transport: "proxy",
  }),
});

export function getProvider(providerId) {
  const provider = WEATHER_PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown weather provider: ${providerId}`);
  return provider;
}

export function buildProxyUrl(config) {
  const provider = getProvider(config.weatherProvider);
  if (provider.transport !== "proxy")
    throw new Error(`${provider.name} does not use the provider proxy`);
  if (!config.providerProxyUrl) {
    throw new Error(
      `${provider.name} requires providerProxyUrl; never put API keys in this browser application`,
    );
  }

  const url = new URL(config.providerProxyUrl);
  url.searchParams.set("provider", provider.id);
  url.searchParams.set("latitude", String(config.latitude));
  url.searchParams.set("longitude", String(config.longitude));
  url.searchParams.set("timezone", config.timezone);
  url.searchParams.set("forecastDays", String(config.forecastDays));
  return url.toString();
}

export async function fetchWeather(
  config,
  fetchImplementation = globalThis.fetch,
) {
  const provider = getProvider(config.weatherProvider);
  const url =
    provider.transport === "direct"
      ? buildWeatherUrl(config)
      : buildProxyUrl(config);
  const response = await fetchImplementation(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`${provider.name} returned HTTP ${response.status}`);

  const payload = await response.json();
  return provider.transport === "direct"
    ? normalizeWeather(payload, config)
    : validateCanonicalResponse(payload, config);
}

export function validateCanonicalResponse(payload, config) {
  if (!payload || typeof payload !== "object")
    throw new Error("Provider proxy returned no JSON object");
  if (
    !payload.current?.time ||
    !Array.isArray(payload.hourly) ||
    !Array.isArray(payload.daily)
  ) {
    throw new Error(
      "Provider proxy response does not match the canonical weather schema",
    );
  }
  if (payload.hourly.length < 4 || payload.daily.length < 4) {
    throw new Error("Provider proxy returned an incomplete forecast");
  }
  return {
    ...payload,
    fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
    locationName: config.locationName,
    timezone: payload.timezone ?? config.timezone,
  };
}
