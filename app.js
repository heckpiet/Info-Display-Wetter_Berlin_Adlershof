import { DEFAULT_CONFIG } from "./config.js?v=3.12.0";
import {
  cacheKey,
  configFromUrl,
  isNightTime,
  weatherInfo,
} from "./weather.js?v=3.12.0";
import { fetchWeather, getProvider } from "./providers.js?v=3.12.0";
import { initialiseSettings, loadSettings } from "./settings.js?v=3.12.0";
import {
  compareVersions,
  getLatestRelease,
  RELEASES_URL,
  VERSION_CACHE_KEY,
} from "./version.js?v=3.12.0";
import {
  getYearProgress,
  getYearProgressPresentation,
} from "./progress.js?v=3.12.0";
import {
  detectDisplay,
  formatDisplaySummary,
  resolveDisplay,
} from "./display.js?v=3.12.0";
import { applyStaticTranslations, translate } from "./i18n.js?v=3.12.0";

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
const reducedMotion =
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function setWeatherIcon(element, info, className = "") {
  element.src = info.icon;
  element.alt = "";
  if (className) element.className = className;
}

async function renderVersionStatus() {
  const element = $("latest-version");
  element.href = RELEASES_URL;
  try {
    const latest = await getLatestRelease({
      cacheKey: `${VERSION_CACHE_KEY}:${config.version}`,
    });
    const updateAvailable = compareVersions(latest, config.version) > 0;
    element.textContent = updateAvailable
      ? t("updateAvailable", { version: latest })
      : t("githubLatest", { version: latest });
    element.classList.toggle("update-available", updateAvailable);
    document.body.classList.toggle("update-important", updateAvailable);
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
    if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) {
      const hours = new Date().getHours();
      if (hours < 6 || hours >= 22) theme = "night";
      else if (hours < 10) theme = "morning";
      else if (hours < 14) theme = "noon";
      else if (hours < 18) theme = "afternoon";
      else theme = "evening";
    } else if (now < sunrise || now >= sunset) {
      theme = "night";
    } else if (now < sunrise + 3 * 3600000) {
      theme = "morning";
    } else if (now >= sunset - 3 * 3600000) {
      theme = "evening";
    } else {
      const midDayStart = sunrise + 3 * 3600000;
      const eveningStart = sunset - 3 * 3600000;
      const halfWay = midDayStart + (eveningStart - midDayStart) / 2;
      theme = now < halfWay ? "noon" : "afternoon";
    }
  }
  document.body.dataset.theme = theme;
  document.body.dataset.colorTheme = config.colorTheme || "default";

  if (config.colorTheme === "custom") {
    document.body.style.setProperty("--bg", config.customBgColor || "#0f172a");
    document.body.style.setProperty(
      "--bg-gradient",
      config.customBgColor || "#0f172a",
    );
    document.body.style.setProperty(
      "--tile",
      config.customTileColor || "#1e293b",
    );
    document.body.style.setProperty(
      "--tile-border",
      "rgba(255, 255, 255, 0.15)",
    );
    document.body.style.setProperty(
      "--text",
      config.customTextColor || "#f8fafc",
    );
    document.body.style.setProperty(
      "--accent",
      config.customAccentColor || "#38bdf8",
    );
    document.body.style.setProperty(
      "--accent-glow",
      config.customAccentColor
        ? `${config.customAccentColor}40`
        : "rgba(56, 189, 248, 0.3)",
    );
    document.body.style.setProperty(
      "--chip",
      config.customChipColor || "#334155",
    );
    document.body.style.setProperty(
      "--chip-border",
      "rgba(255, 255, 255, 0.1)",
    );
  } else {
    document.body.style.removeProperty("--bg");
    document.body.style.removeProperty("--bg-gradient");
    document.body.style.removeProperty("--tile");
    document.body.style.removeProperty("--tile-border");
    document.body.style.removeProperty("--text");
    document.body.style.removeProperty("--accent");
    document.body.style.removeProperty("--accent-glow");
    document.body.style.removeProperty("--chip");
    document.body.style.removeProperty("--chip-border");
  }

  document.querySelector('meta[name="theme-color"]').content =
    theme === "night" ? "#090d16" : "#f0f4f9";
}

function renderCurrent(data) {
  const current = data.current;
  const info = weatherInfo(
    current.weatherCode,
    config.language,
    config.iconPack,
    isNightTime(current.time, current.sunrise, current.sunset),
    reducedMotion,
  );
  $("now-temp").textContent = `${formatNumber(current.temp)}°C`;
  setWeatherIcon($("now-icon"), info);
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
        hourlyView &&
          isNightTime(
            row.time,
            latestData.daily.find(
              (day) => day.time === String(row.time).slice(0, 10),
            )?.sunrise,
            latestData.daily.find(
              (day) => day.time === String(row.time).slice(0, 10),
            )?.sunset,
          ),
        reducedMotion,
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
      const icon = document.createElement("img");
      setWeatherIcon(icon, info, "forecast-icon");
      details.replaceChildren(
        icon,
        Object.assign(document.createElement("span"), {
          textContent: info.description,
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
  document.body.classList.toggle("status-important", cached);
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
    document.body.classList.add("status-important");
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
  document.body.dataset.secondaryInfoMode = config.secondaryInfoMode;
  let secondaryInfoTimer;
  const showSecondaryInfo = () => {
    if (config.secondaryInfoMode === "important") {
      document.body.classList.add("secondary-info-inactive");
      return;
    }
    document.body.classList.remove("secondary-info-inactive");
    clearTimeout(secondaryInfoTimer);
    if (["dim", "autoHide"].includes(config.secondaryInfoMode))
      secondaryInfoTimer = setTimeout(
        () => document.body.classList.add("secondary-info-inactive"),
        config.secondaryInfoDelaySeconds * 1000,
      );
  };
  ["mousemove", "pointerdown", "keydown"].forEach((name) =>
    addEventListener(name, showSecondaryInfo, { passive: true }),
  );
  showSecondaryInfo();
  document.title = `${t("weather")} – ${config.locationName}`;
  $("title").textContent = `${t("weather")} – ${config.locationName}`;
  $("timezone").textContent = config.timezone;
  $("version").textContent = t("running", { version: config.version });
  renderVersionStatus();
  $("provider-name").textContent = getProvider(
    config.weatherProvider,
  ).attribution;
  const renderYearProgress = (mode = config.yearProgressMode) => {
    const presentation = getYearProgressPresentation(
      getYearProgress(new Date(), config.timezone),
      mode,
      config.language,
    );
    $("year-progress").style.width = presentation.width;
    $("year-label").textContent = presentation.label;
    document
      .querySelector(".progress")
      .classList.toggle("year-progress-hidden", presentation.hidden);
  };
  renderYearProgress();
  addEventListener("weather-display:preview-year-progress", (event) =>
    renderYearProgress(event.detail.mode),
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
