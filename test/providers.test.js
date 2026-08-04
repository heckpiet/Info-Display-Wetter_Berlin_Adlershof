import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONFIG } from "../config.js";
import {
  buildProxyUrl,
  fetchWeather,
  getProvider,
  validateCanonicalResponse,
} from "../providers.js";

test("Open-Meteo DWD ICON remains the direct default", () => {
  assert.equal(DEFAULT_CONFIG.weatherProvider, "openMeteoDwd");
  assert.equal(getProvider(DEFAULT_CONFIG.weatherProvider).transport, "direct");
});

test("prepared providers require a controlled proxy", () => {
  const config = { ...DEFAULT_CONFIG, weatherProvider: "metNo" };
  assert.throws(() => buildProxyUrl(config), /requires providerProxyUrl/);
});

test("proxy URL contains provider-neutral location parameters", () => {
  const config = {
    ...DEFAULT_CONFIG,
    weatherProvider: "openWeather",
    providerProxyUrl: "https://proxy.example/forecast",
  };
  const url = new URL(buildProxyUrl(config));
  assert.equal(url.searchParams.get("provider"), "openWeather");
  assert.equal(url.searchParams.get("latitude"), "52.4357");
  assert.equal(url.searchParams.get("timezone"), "Europe/Berlin");
  assert.equal(url.searchParams.get("forecastDays"), "7");
});

test("unknown provider IDs fail closed", () => {
  assert.throws(() => getProvider("unknown"), /Unknown weather provider/);
});

test("canonical proxy responses require complete forecasts", () => {
  assert.throws(
    () =>
      validateCanonicalResponse(
        { current: { time: "now" }, hourly: [], daily: [] },
        DEFAULT_CONFIG,
      ),
    /incomplete forecast/,
  );
});

test("proxy provider responses are accepted without exposing credentials", async () => {
  const config = {
    ...DEFAULT_CONFIG,
    weatherProvider: "dwdOpenData",
    providerProxyUrl: "https://proxy.example/forecast",
  };
  const row = { time: "2026-08-04T17:00", temp: 20, weatherCode: 2 };
  const payload = {
    fetchedAt: "2026-08-04T14:00:00Z",
    timezone: "Europe/Berlin",
    current: { time: "2026-08-04T16:00", temp: 21, weatherCode: 2 },
    hourly: Array.from({ length: 4 }, () => row),
    daily: Array.from({ length: 4 }, (_, index) => ({
      ...row,
      time: `2026-08-0${index + 5}`,
    })),
  };
  let requestedUrl;
  const fakeFetch = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => payload };
  };
  const result = await fetchWeather(config, fakeFetch);
  assert.match(requestedUrl, /provider=dwdOpenData/);
  assert.equal(result.locationName, "Berlin-Adlershof");
  assert.equal(result.hourly.length, 4);
});
