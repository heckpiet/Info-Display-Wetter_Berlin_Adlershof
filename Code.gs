/**
 * Weather Info Display (Apps Script) - v1.0.0 (2025-08-19)
 * Author: Peter Hecko
 *
 * Description:
 *   Minimal server for a kiosk-friendly weather dashboard.
 *   Comments are in ENGLISH, UI texts are in GERMAN.
 *   Tailored for Germany: locale "de-DE", timezone "Europe/Berlin".
 *
 * Key endpoints:
 *   - doGet(): serves the HTML and passes boot config
 *   - getWeatherData(): fetches Open-Meteo ICON data and returns a compact JSON structure
 *
 * License: MIT
 */

// ---------- Configuration (German environment) ----------
const CFG = {
  version: "1.0.0",
  // Berlin-Adlershof by default (customize as needed)
  lat: 52.4357,
  lon: 13.5406,
  locationName: "Berlin‑Adlershof",
  timezone: "Europe/Berlin",
  locale: "de-DE",

  // UI behaviour (read by the client via `boot`)
  refreshIntervalMin: 5,   // hard reload every N minutes
  flipIntervalSec: 30,     // switch hourly/daily view
  retryOnFailureSec: 60,   // retry once after failure

  // Server cache (seconds): reduce API/load and stabilize UI
  serverCacheSec: 90
};

// ---------- HTML Entry ----------
function doGet() {
  const tpl = HtmlService.createTemplateFromFile("index");
  // Provide boot configuration to the client
  tpl.boot = {
    version: CFG.version,
    locationName: CFG.locationName,
    locale: CFG.locale,
    timezone: CFG.timezone,
    refreshIntervalMin: CFG.refreshIntervalMin,
    flipIntervalSec: CFG.flipIntervalSec,
    retryOnFailureSec: CFG.retryOnFailureSec
  };
  const out = tpl.evaluate()
    .setTitle("Wetter – " + CFG.locationName)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return out;
}

// (optional) HTML templating helper
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ---------- Data Endpoint ----------
/**
 * Fetch weather data from Open-Meteo ICON and map to a compact structure.
 * Implements short server-side caching.
 */
function getWeatherData() {
  const cache = CacheService.getScriptCache();
  const key = "wx:" + [CFG.lat, CFG.lon, CFG.timezone].join(":");
  const cached = cache.get(key);
  if (cached) {
    const obj = JSON.parse(cached);
    obj.fromCache = true;
    return obj;
  }

  try {
    // Open-Meteo (ICON-D2) hourly+daily+current
    // Docs: https://open-meteo.com/
    const base = "https://api.open-meteo.com/v1/dwd-icon";
    const params = {
      latitude: CFG.lat,
      longitude: CFG.lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m"
      ].join(","),
      hourly: [
        "temperature_2m",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m"
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "precipitation_sum"
      ].join(","),
      timezone: CFG.timezone
    };

    const url = base + "?" + Object.keys(params).map(k => k + "=" + encodeURIComponent(params[k])).join("&");
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    const code = res.getResponseCode();
    if (code < 200 || code >= 300) {
      return { ok: false, error: "Bad status " + code, meta: { url, fetchedAt: new Date().toISOString() } };
    }
    const data = JSON.parse(res.getContentText());

    // Map CURRENT
    const cur = data.current || {};
    const current = {
      time: cur.time || null,
      temp: n(cur.temperature_2m),
      feels: n(cur.apparent_temperature),
      humidity: n(cur.relative_humidity_2m),
      pressure: n(cur.surface_pressure),
      precip: n(cur.precipitation),
      wind: n(cur.wind_speed_10m),
      winddir: n(cur.wind_direction_10m),
      weathercode: n(cur.weather_code)
    };

    // Map HOURLY (take aligned arrays)
    const h = data.hourly || {};
    const hourly = [];
    const lenH = (h.time || []).length;
    for (let i = 0; i < lenH; i++) {
      hourly.push({
        time: h.time[i] || null,
        temp: n(h.temperature_2m && h.temperature_2m[i]),
        precip: n(h.precipitation && h.precipitation[i]),
        weathercode: n(h.weather_code && h.weather_code[i]),
        wind: n(h.wind_speed_10m && h.wind_speed_10m[i]),
        winddir: n(h.wind_direction_10m && h.wind_direction_10m[i])
      });
    }

    // Map DAILY
    const d = data.daily || {};
    const daily = [];
    const lenD = (d.time || []).length;
    for (let i = 0; i < lenD; i++) {
      daily.push({
        date: d.time[i] || null,
        tmax: n(d.temperature_2m_max && d.temperature_2m_max[i]),
        tmin: n(d.temperature_2m_min && d.temperature_2m_min[i]),
        precipSum: n(d.precipitation_sum && d.precipitation_sum[i]),
        weathercode: n(d.weather_code && d.weather_code[i]),
        sunrise: d.sunrise && d.sunrise[i] || null,
        sunset: d.sunset && d.sunset[i] || null
      });
    }

    // For convenience: copy today's sunrise/sunset to current if available
    if (!current.sunrise || !current.sunset) {
      if (daily && daily.length) {
        const today = daily.find(x => x.date && isSameDay(x.date, current.time));
        if (today) {
          current.sunrise = today.sunrise;
          current.sunset = today.sunset;
        } else {
          current.sunrise = daily[0].sunrise;
          current.sunset = daily[0].sunset;
        }
      }
    }

    const out = {
      ok: true,
      fromCache: false,
      meta: {
        source: "open-meteo/dwd-icon",
        url,
        fetchedAt: new Date().toISOString(),
        lat: CFG.lat,
        lon: CFG.lon,
        locationName: CFG.locationName,
        timezone: CFG.timezone,
        locale: CFG.locale
      },
      current,
      hourly,
      daily
    };

    // Cache for short period
    cache.put(key, JSON.stringify(out), CFG.serverCacheSec);
    return out;
  } catch (e) {
    return { ok: false, error: String(e && e.message || e), meta: { fetchedAt: new Date().toISOString() } };
  }
}

// ---------- Helpers ----------
function n(v) {
  // Convert to number if possible, else null
  return (v === 0 || (v && !isNaN(v))) ? Number(v) : (v === 0 ? 0 : (v == null ? null : Number(v)));
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  // a,b are ISO strings with timezone applied by API
  return String(a).slice(0,10) === String(b).slice(0,10);
}
