const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
const n = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
const kmh = (value) => (value == null ? null : Number(value) * 3.6);

function cors(origin, allowed) {
  if (!origin || origin !== allowed) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,OPTIONS",
    vary: "Origin",
  };
}

function metCode(symbol = "") {
  if (symbol.includes("thunder")) return 95;
  if (symbol.includes("snow")) return 71;
  if (symbol.includes("rain") || symbol.includes("sleet")) return 61;
  if (symbol.includes("fog")) return 45;
  if (symbol.includes("cloudy")) return 3;
  if (symbol.includes("partlycloudy")) return 2;
  return 0;
}

export function mapMetNo(payload, timezone = "UTC") {
  const rows = payload.properties?.timeseries ?? [];
  const hourly = rows.map((row) => {
    const d = row.data.instant.details;
    const next = row.data.next_1_hours ?? {};
    return {
      time: row.time,
      temp: n(d.air_temperature),
      precipitation: n(next.details?.precipitation_amount),
      precipitationProbability: n(next.details?.probability_of_precipitation),
      weatherCode: metCode(next.summary?.symbol_code),
      wind: kmh(d.wind_speed),
      windDirection: n(d.wind_from_direction),
      uvIndex: n(d.ultraviolet_index_clear_sky),
    };
  });
  const days = new Map();
  for (const row of hourly) {
    const date = row.time.slice(0, 10);
    const day = days.get(date) ?? {
      time: date,
      temps: [],
      precipitation: 0,
      probabilities: [],
      codes: [],
    };
    day.temps.push(row.temp);
    day.precipitation += row.precipitation ?? 0;
    day.probabilities.push(row.precipitationProbability);
    day.codes.push(row.weatherCode);
    days.set(date, day);
  }
  const daily = [...days.values()].map((d) => ({
    time: d.time,
    tempMin: Math.min(...d.temps),
    tempMax: Math.max(...d.temps),
    precipitation: d.precipitation,
    precipitationProbability: Math.max(
      ...d.probabilities.filter(Number.isFinite),
      0,
    ),
    weatherCode: Math.max(...d.codes),
    windGust: null,
    sunrise: null,
    sunset: null,
  }));
  const first = rows[0]?.data.instant.details ?? {};
  return {
    fetchedAt: new Date().toISOString(),
    timezone,
    current: {
      time: rows[0]?.time,
      temp: n(first.air_temperature),
      feelsLike: n(first.air_temperature),
      humidity: n(first.relative_humidity),
      pressure: n(first.air_pressure_at_sea_level),
      precipitation: hourly[0]?.precipitation,
      wind: kmh(first.wind_speed),
      windDirection: n(first.wind_from_direction),
      windGust: kmh(first.wind_speed_of_gust),
      weatherCode: hourly[0]?.weatherCode,
      uvIndex: hourly[0]?.uvIndex,
      tempMin: daily[0]?.tempMin,
      tempMax: daily[0]?.tempMax,
      sunrise: null,
      sunset: null,
    },
    hourly,
    daily,
  };
}

function owmCode(id) {
  if (id === 800) return 0;
  if (id < 300) return 95;
  if (id < 600) return 61;
  if (id < 700) return 71;
  if (id < 800) return 45;
  if (id === 801) return 1;
  if (id === 802) return 2;
  return 3;
}
export function mapOpenWeather(p) {
  const iso = (v) => new Date(v * 1000).toISOString();
  const hourly = (p.hourly ?? []).map((h) => ({
    time: iso(h.dt),
    temp: n(h.temp),
    precipitation: n(h.rain?.["1h"] ?? h.snow?.["1h"] ?? 0),
    precipitationProbability: n(h.pop) * 100,
    weatherCode: owmCode(h.weather?.[0]?.id),
    wind: kmh(h.wind_speed),
    windDirection: n(h.wind_deg),
    uvIndex: n(h.uvi),
  }));
  const daily = (p.daily ?? []).map((d) => ({
    time: iso(d.dt).slice(0, 10),
    tempMin: n(d.temp?.min),
    tempMax: n(d.temp?.max),
    precipitation: n(d.rain ?? d.snow ?? 0),
    precipitationProbability: n(d.pop) * 100,
    weatherCode: owmCode(d.weather?.[0]?.id),
    windGust: kmh(d.wind_gust),
    uvIndexMax: n(d.uvi),
    sunrise: iso(d.sunrise),
    sunset: iso(d.sunset),
  }));
  const c = p.current;
  return {
    fetchedAt: new Date().toISOString(),
    timezone: p.timezone,
    current: {
      time: iso(c.dt),
      temp: n(c.temp),
      feelsLike: n(c.feels_like),
      humidity: n(c.humidity),
      pressure: n(c.pressure),
      precipitation: n(c.rain?.["1h"] ?? c.snow?.["1h"] ?? 0),
      wind: kmh(c.wind_speed),
      windDirection: n(c.wind_deg),
      windGust: kmh(c.wind_gust),
      weatherCode: owmCode(c.weather?.[0]?.id),
      uvIndex: n(c.uvi),
      tempMin: daily[0]?.tempMin,
      tempMax: daily[0]?.tempMax,
      sunrise: iso(c.sunrise),
      sunset: iso(c.sunset),
    },
    hourly,
    daily,
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = cors(request.headers.get("origin"), env.ALLOWED_ORIGIN);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "GET")
      return json({ error: "Method not allowed" }, 405, headers);
    const provider = url.searchParams.get("provider"),
      lat = url.searchParams.get("latitude"),
      lon = url.searchParams.get("longitude"),
      timezone = url.searchParams.get("timezone") ?? "UTC";
    if (!lat || !lon)
      return json({ error: "Missing coordinates" }, 400, headers);
    let upstream,
      mapper = (x) => x;
    if (provider === "metNo") {
      upstream = new Request(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
        { headers: { "user-agent": env.METNO_USER_AGENT } },
      );
      mapper = (p) => mapMetNo(p, timezone);
    } else if (provider === "openWeather") {
      if (!env.OPENWEATHER_API_KEY)
        return json({ error: "OpenWeather is not configured" }, 503, headers);
      upstream = `https://api.openweathermap.org/data/3.0/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&appid=${env.OPENWEATHER_API_KEY}`;
      mapper = mapOpenWeather;
    } else if (provider === "dwdOpenData") {
      if (!env.DWD_INGESTION_URL)
        return json(
          { error: "DWD GRIB2 ingestion endpoint is not configured" },
          503,
          headers,
        );
      upstream = `${env.DWD_INGESTION_URL}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&timezone=${encodeURIComponent(timezone)}`;
    } else return json({ error: "Unsupported provider" }, 400, headers);
    const cache = caches.default,
      key = new Request(url.toString(), request);
    let response = await cache.match(key);
    if (response) return response;
    const source = await fetch(upstream);
    if (!source.ok)
      return json({ error: `Upstream HTTP ${source.status}` }, 502, headers);
    response = json(mapper(await source.json()), 200, {
      ...headers,
      "cache-control": "public,max-age=600",
    });
    ctx.waitUntil(cache.put(key, response.clone()));
    return response;
  },
};
