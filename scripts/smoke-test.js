import { DEFAULT_CONFIG } from "../config.js";
import { fetchWeather } from "../providers.js";

const data = await fetchWeather(DEFAULT_CONFIG);
if (!data.current.time || data.hourly.length < 4 || data.daily.length < 4) {
  throw new Error("Open-Meteo smoke test returned incomplete forecast data");
}
console.log(
  `Open-Meteo smoke test passed: ${data.hourly.length} hourly and ${data.daily.length} daily records.`,
);
