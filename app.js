import { DEFAULT_CONFIG } from "./config.js";
import { cacheKey, configFromUrl, weatherInfo } from "./weather.js";
import { fetchWeather, getProvider } from "./providers.js";

const config = configFromUrl(DEFAULT_CONFIG);
const $ = (id) => document.getElementById(id);
const formatNumber = (value, digits = 0) =>
  value == null
    ? "--"
    : new Intl.NumberFormat(config.locale, {
        maximumFractionDigits: digits,
      }).format(value);
const formatDate = (value, options) =>
  new Intl.DateTimeFormat(config.locale, {
    ...options,
    timeZone: config.timezone,
  }).format(new Date(value));
let latestData;
let hourlyView = true;
let retryTimer;

function wind(value, direction) {
  if (value == null) return "-- km/h";
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const index =
    direction == null
      ? null
      : Math.round((((direction % 360) + 360) % 360) / 45) % 8;
  return `${formatNumber(value)} km/h${index == null ? "" : ` (${arrows[index]})`}`;
}

function setTheme(current) {
  const now = Date.now();
  const sunrise = Date.parse(current.sunrise);
  const sunset = Date.parse(current.sunset);
  const dark =
    Number.isFinite(sunrise) && Number.isFinite(sunset)
      ? now < sunrise || now > sunset
      : new Date().getHours() < 6 || new Date().getHours() >= 21;
  document.body.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]').content = dark
    ? "#0b0f16"
    : "#f6f8fb";
}

function renderCurrent(data) {
  const current = data.current;
  const info = weatherInfo(current.weatherCode);
  $("now-temp").textContent = `${formatNumber(current.temp)}°C`;
  $("now-icon").textContent = info.icon;
  $("now-description").textContent = info.description;
  $("now-feels").textContent = `${formatNumber(current.feelsLike)}°C`;
  $("now-range").textContent =
    `${formatNumber(current.tempMin)} / ${formatNumber(current.tempMax)}°C`;
  $("now-precip").textContent = `${formatNumber(current.precipitation, 1)} mm`;
  $("now-humidity").textContent = `${formatNumber(current.humidity)} %`;
  $("now-pressure").textContent = `${formatNumber(current.pressure)} hPa`;
  $("now-wind").textContent = wind(current.wind, current.windDirection);
  $("now-gust").textContent = `${formatNumber(current.windGust)} km/h`;
  $("now-uv").textContent = formatNumber(current.uvIndex, 1);
  $("now-sun").textContent =
    current.sunrise && current.sunset
      ? `${formatDate(current.sunrise, { hour: "2-digit", minute: "2-digit" })} / ${formatDate(current.sunset, { hour: "2-digit", minute: "2-digit" })}`
      : "--:-- / --:--";
  setTheme(current);
}

function renderForecast() {
  if (!latestData) return;
  const now = Date.now();
  const rows = hourlyView
    ? latestData.hourly.filter((row) => Date.parse(row.time) > now).slice(0, 4)
    : latestData.daily
        .filter(
          (row) => row.time !== String(latestData.current.time).slice(0, 10),
        )
        .slice(0, 4);
  $("view-label").textContent = hourlyView ? "Next hours" : "Next days";
  const container = $("forecast-slots");
  container.replaceChildren(
    ...rows.map((row) => {
      const fragment = $("slot-template").content.cloneNode(true);
      const info = weatherInfo(row.weatherCode);
      fragment.querySelector("h3").textContent = hourlyView
        ? formatDate(row.time, { hour: "2-digit", minute: "2-digit" })
        : formatDate(row.time, {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
          });
      fragment.querySelector(".slot-temp").textContent = hourlyView
        ? `${formatNumber(row.temp)}°C`
        : `${formatNumber(row.tempMin)}–${formatNumber(row.tempMax)}°C`;
      const probability =
        row.precipitationProbability == null
          ? ""
          : ` · ${formatNumber(row.precipitationProbability)}%`;
      fragment.querySelector(".slot-details").textContent =
        `${info.icon} ${info.description} · ${formatNumber(row.precipitation, 1)} mm${probability}`;
      return fragment;
    }),
  );
  hourlyView = !hourlyView;
}

function render(data, cached = false) {
  latestData = data;
  renderCurrent(data);
  hourlyView = true;
  renderForecast();
  const ageMinutes = Math.max(
    0,
    Math.round((Date.now() - Date.parse(data.fetchedAt)) / 60000),
  );
  $("status").textContent = cached
    ? `Offline · cached data from ${ageMinutes} min ago · retrying automatically`
    : `Updated ${formatDate(data.fetchedAt, { dateStyle: "short", timeStyle: "medium" })} · ${ageMinutes} min old`;
  document.body.classList.toggle("offline", cached);
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey(config)));
    const age = Date.now() - Date.parse(cached?.fetchedAt);
    return age <= config.cacheMaxAgeHours * 3600000 ? cached : null;
  } catch {
    return null;
  }
}

async function loadWeather() {
  clearTimeout(retryTimer);
  try {
    const data = await fetchWeather(config);
    localStorage.setItem(cacheKey(config), JSON.stringify(data));
    render(data);
    retryTimer = setTimeout(loadWeather, config.refreshIntervalMinutes * 60000);
  } catch (error) {
    const cached = readCache();
    if (cached) render(cached, true);
    else
      $("status").textContent =
        `Weather unavailable · ${error.message} · retrying automatically`;
    document.body.classList.add("offline");
    retryTimer = setTimeout(loadWeather, config.retryIntervalSeconds * 1000);
  }
}

function initialise() {
  document.title = `Weather – ${config.locationName}`;
  $("title").textContent = `Weather – ${config.locationName}`;
  $("timezone").textContent = config.timezone;
  $("version").textContent = `v${config.version}`;
  $("provider-name").textContent = getProvider(
    config.weatherProvider,
  ).attribution;
  const yearPercentage = (
    ((Date.now() - new Date(new Date().getFullYear(), 0, 1)) /
      (new Date(new Date().getFullYear() + 1, 0, 1) -
        new Date(new Date().getFullYear(), 0, 1))) *
    100
  ).toFixed(2);
  $("year-progress").style.width = `${yearPercentage}%`;
  $("year-label").textContent = `${yearPercentage}% of year`;
  const tick = () => {
    $("clock").textContent = formatDate(new Date(), {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    $("date").textContent = formatDate(new Date(), {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  tick();
  setInterval(tick, 1000);
  setInterval(renderForecast, config.flipIntervalSeconds * 1000);
  loadWeather();
}

initialise();
