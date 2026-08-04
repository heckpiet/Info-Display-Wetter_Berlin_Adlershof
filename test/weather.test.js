import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONFIG } from "../config.js";
import {
  buildWeatherUrl,
  cacheKey,
  configFromUrl,
  isNightTime,
  normalizeWeather,
  weatherInfo,
} from "../weather.js";

test("Adlershof is the default example", () => {
  assert.equal(DEFAULT_CONFIG.locationName, "Berlin-Adlershof");
  assert.equal(DEFAULT_CONFIG.latitude, 52.4357);
  assert.equal(DEFAULT_CONFIG.longitude, 13.5406);
  assert.equal(DEFAULT_CONFIG.locale, "de-DE");
});

test("valid URL settings override the defaults", () => {
  const config = configFromUrl(
    DEFAULT_CONFIG,
    "?lat=53.55&lon=9.99&name=Hamburg&locale=de-DE",
  );
  assert.equal(config.latitude, 53.55);
  assert.equal(config.longitude, 9.99);
  assert.equal(config.locationName, "Hamburg");
  assert.equal(config.locale, "de-DE");
});

test("invalid coordinates are ignored", () => {
  const config = configFromUrl(DEFAULT_CONFIG, "?lat=200&lon=wrong");
  assert.equal(config.latitude, DEFAULT_CONFIG.latitude);
  assert.equal(config.longitude, DEFAULT_CONFIG.longitude);
});

test("invalid locale and timezone overrides are ignored", () => {
  const config = configFromUrl(
    DEFAULT_CONFIG,
    "?locale=not_a_locale&timezone=Not/A_Timezone",
  );
  assert.equal(config.locale, DEFAULT_CONFIG.locale);
  assert.equal(config.timezone, DEFAULT_CONFIG.timezone);
});

test("API URL requests the selected DWD endpoint and expected fields", () => {
  const url = new URL(buildWeatherUrl(DEFAULT_CONFIG));
  assert.equal(url.hostname, "api.open-meteo.com");
  assert.equal(url.pathname, "/v1/dwd-icon");
  assert.match(url.searchParams.get("hourly"), /precipitation_probability/);
  assert.equal(url.searchParams.get("timezone"), "Europe/Berlin");
});

test("normalizes an API response", () => {
  const source = {
    timezone: "Europe/Berlin",
    current: { time: "2026-08-04T12:00", temperature_2m: 21, weather_code: 2 },
    hourly: { time: ["2026-08-04T13:00"], temperature_2m: [22] },
    daily: {
      time: ["2026-08-04"],
      sunrise: ["2026-08-04T05:30"],
      sunset: ["2026-08-04T20:50"],
    },
  };
  const result = normalizeWeather(
    source,
    DEFAULT_CONFIG,
    "2026-08-04T10:00:00Z",
  );
  assert.equal(result.current.temp, 21);
  assert.equal(result.current.sunrise, "2026-08-04T05:30");
  assert.equal(result.hourly[0].temp, 22);
});

test("maps WMO weather codes and creates location-specific cache keys", () => {
  assert.equal(weatherInfo(95).description, "Thunderstorm");
  assert.deepEqual(weatherInfo(61, "de", "line"), {
    icon: "assets/meteocons/line/rain.svg",
    description: "Regen",
  });
  assert.equal(
    weatherInfo(0, "en", "flat", true).icon,
    "assets/meteocons/flat/clear-night.svg",
  );
  assert.equal(
    weatherInfo(0, "en", "animated", false, true).icon,
    "assets/meteocons/fill/clear-day.svg",
  );
  assert.match(cacheKey(DEFAULT_CONFIG), /52\.4357:13\.5406/);
});

test("detects day and night from local provider timestamps", () => {
  assert.equal(
    isNightTime("2026-08-04T04:45", "2026-08-04T05:30", "2026-08-04T20:52"),
    true,
  );
  assert.equal(
    isNightTime("2026-08-04T12:00", "2026-08-04T05:30", "2026-08-04T20:52"),
    false,
  );
});
