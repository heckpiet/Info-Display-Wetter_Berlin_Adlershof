import { DEFAULT_CONFIG } from "../config.js";
import { buildWeatherUrl, normalizeWeather } from "../weather.js";

const response = await fetch(buildWeatherUrl(DEFAULT_CONFIG), {
  signal: AbortSignal.timeout(20000),
});
if (!response.ok)
  throw new Error(`Open-Meteo smoke test failed with HTTP ${response.status}`);
const data = normalizeWeather(await response.json(), DEFAULT_CONFIG);
if (!data.current.time || data.hourly.length < 4 || data.daily.length < 4) {
  throw new Error("Open-Meteo smoke test returned incomplete forecast data");
}
console.log(
  `Open-Meteo smoke test passed: ${data.hourly.length} hourly and ${data.daily.length} daily records.`,
);
