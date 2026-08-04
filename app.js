import { DEFAULT_CONFIG } from "./config.js";
import { cacheKey, configFromUrl, weatherInfo } from "./weather.js";
import { fetchWeather, getProvider } from "./providers.js";
import { initialiseSettings, loadSettings } from "./settings.js";
import { compareVersions, getLatestRelease, RELEASES_URL } from "./version.js";
import { formatYearProgress, getYearProgress } from "./progress.js";
import {
  detectDisplay,
  formatDisplaySummary,
  resolveDisplay,
} from "./display.js";
import { applyStaticTranslations, translate } from "./i18n.js";

const config = configFromUrl({ ...DEFAULT_CONFIG, ...loadSettings() });
config.locale = config.language === "de" ? "de-DE" : "en-GB";
const t = (key, values) => translate(config.language, key, values);
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
let retryAttempt = 0;

async function renderVersionStatus() {
  const element = $("latest-version");
  element.href = RELEASES_URL;
  try {
    const latest = await getLatestRelease();
    const updateAvailable = compareVersions(latest, config.version) > 0;
    element.textContent = updateAvailable
      ? t("updateAvailable", { version: latest })
      : t("githubLatest", { version: latest });
    element.classList.toggle("update-available", updateAvailable);
  } catch {
    element.textContent = t("githubUnavailable");
  }
}

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
  let theme = config.themeMode;
  if (theme === "auto") {
    if (!Number.isFinite(sunrise) || !Number.isFinite(sunset))
      theme =
        new Date().getHours() < 6 || new Date().getHours() >= 21
          ? "night"
          : "noon";
    else if (now < sunrise || now >= sunset) theme = "night";
    else if (now < sunrise + 3 * 3600000) theme = "morning";
    else if (now >= sunset - 2 * 3600000) theme = "evening";
    else theme = "noon";
  }
  document.body.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content =
    theme === "night" ? "#0b0f16" : "#f6f8fb";
}

function renderCurrent(data) {
  const current = data.current;
  const info = weatherInfo(
    current.weatherCode,
    config.language,
    config.iconPack,
  );
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
  $("view-label").textContent = hourlyView ? t("nextHours") : t("nextDays");
  const container = $("forecast-slots");
  container.replaceChildren(
    ...rows.map((row) => {
      const fragment = $("slot-template").content.cloneNode(true);
      const info = weatherInfo(
        row.weatherCode,
        config.language,
        config.iconPack,
      );
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
      const details = fragment.querySelector(".slot-details");
      details.replaceChildren(
        Object.assign(document.createElement("span"), {
          textContent: `${info.icon} ${info.description}`,
        }),
        Object.assign(document.createElement("span"), {
          className: "slot-precip metric-detail",
          textContent: ` · ${formatNumber(row.precipitation, 1)} mm`,
        }),
        Object.assign(document.createElement("span"), {
          className: "slot-probability",
          textContent: probability,
        }),
      );
      return fragment;
    }),
  );
  hourlyView = !hourlyView;
}

function flipForecast() {
  document.querySelector(".forecast").classList.add("flipping");
  setTimeout(() => {
    renderForecast();
    document.querySelector(".forecast").classList.remove("flipping");
  }, 175);
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
    ? t("offline", { age: ageMinutes })
    : t("updated", {
        date: formatDate(data.fetchedAt, {
          dateStyle: "short",
          timeStyle: "medium",
        }),
        age: ageMinutes,
      });
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
    retryAttempt = 0;
    retryTimer = setTimeout(loadWeather, config.refreshIntervalMinutes * 60000);
  } catch (error) {
    const cached = readCache();
    if (cached) render(cached, true);
    else $("status").textContent = t("unavailable", { error: error.message });
    document.body.classList.add("offline");
    const retrySeconds = Math.min(
      config.retryIntervalSeconds * 2 ** retryAttempt,
      900,
    );
    retryAttempt += 1;
    $("status").textContent +=
      ` · ${t("nextRetry", { seconds: retrySeconds })}`;
    retryTimer = setTimeout(loadWeather, retrySeconds * 1000);
  }
}

function initialise() {
  applyStaticTranslations(config.language);
  initialiseSettings(config);
  const applyDisplay = () => {
    const detected = detectDisplay();
    const resolved = resolveDisplay(config, detected);
    document.documentElement.style.setProperty(
      "--font-scale",
      String(resolved.scale),
    );
    document.documentElement.style.setProperty(
      "--content-width",
      `${resolved.widthPercent}%`,
    );
    for (const [side, value] of Object.entries(resolved.insets))
      document.documentElement.style.setProperty(
        `--frame-inset-${side}`,
        `${value}px`,
      );
    document.body.dataset.deviceProfile = resolved.profile;
    $("display-summary").textContent = formatDisplaySummary(
      detected,
      config.language,
    );
  };
  applyDisplay();
  addEventListener("resize", applyDisplay, { passive: true });
  document.body.dataset.density = config.density;
  document.body.dataset.iconPack = config.iconPack;
  document.body.dataset.informationMode = config.informationMode;
  document.body.dataset.layout = config.layoutMode;
  document.title = `${t("weather")} – ${config.locationName}`;
  $("title").textContent = `${t("weather")} – ${config.locationName}`;
  $("timezone").textContent = config.timezone;
  $("version").textContent = t("running", { version: config.version });
  renderVersionStatus();
  $("provider-name").textContent = getProvider(
    config.weatherProvider,
  ).attribution;
  const yearProgress = getYearProgress(new Date(), config.timezone);
  $("year-progress").style.width = `${yearProgress.percentage}%`;
  $("year-label").textContent = formatYearProgress(
    yearProgress,
    config.yearProgressMode,
    config.language,
  );
  document
    .querySelector(".progress")
    .classList.toggle(
      "year-progress-hidden",
      config.yearProgressMode === "hidden",
    );
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
  $("flip-button").addEventListener("click", flipForecast);
  if (config.forecastRotation === "auto")
    setInterval(flipForecast, config.flipIntervalSeconds * 1000);
  loadWeather();
}

initialise();
