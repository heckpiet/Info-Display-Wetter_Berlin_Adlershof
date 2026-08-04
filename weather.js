const API_BASE = "https://api.open-meteo.com/v1/dwd-icon";

export function configFromUrl(
  defaults,
  search = globalThis.location?.search ?? "",
) {
  const params = new URLSearchParams(search);
  const config = { ...defaults };
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lon"));

  if (
    params.has("lat") &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  ) {
    config.latitude = latitude;
  }
  if (
    params.has("lon") &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    config.longitude = longitude;
  }
  if (params.get("name")?.trim())
    config.locationName = params.get("name").trim().slice(0, 80);
  const timezone = params.get("timezone")?.trim().slice(0, 80);
  const locale = params.get("locale")?.trim().slice(0, 35);
  if (timezone && supportsTimezone(timezone)) config.timezone = timezone;
  if (locale && supportsLocale(locale)) config.locale = locale;
  return config;
}

function supportsTimezone(timezone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function supportsLocale(locale) {
  try {
    new Intl.NumberFormat(locale).format();
    return true;
  } catch {
    return false;
  }
}

export function buildWeatherUrl(config) {
  const params = new URLSearchParams({
    latitude: String(config.latitude),
    longitude: String(config.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_gusts_10m_max",
      "uv_index_max",
    ].join(","),
    timezone: config.timezone,
    forecast_days: String(config.forecastDays),
  });
  return `${API_BASE}?${params}`;
}

const numberOrNull = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : null;

export function normalizeWeather(
  data,
  config,
  fetchedAt = new Date().toISOString(),
) {
  if (!data?.current || !data?.hourly || !data?.daily)
    throw new Error("Incomplete weather response");
  const mapRows = (source, fields) =>
    (source.time ?? []).map((time, index) => {
      const row = { time };
      for (const [target, key] of Object.entries(fields))
        row[target] = numberOrNull(source[key]?.[index]);
      return row;
    });

  const hourly = mapRows(data.hourly, {
    temp: "temperature_2m",
    precipitation: "precipitation",
    precipitationProbability: "precipitation_probability",
    weatherCode: "weather_code",
    wind: "wind_speed_10m",
    windDirection: "wind_direction_10m",
    uvIndex: "uv_index",
  });
  const daily = mapRows(data.daily, {
    tempMax: "temperature_2m_max",
    tempMin: "temperature_2m_min",
    precipitation: "precipitation_sum",
    precipitationProbability: "precipitation_probability_max",
    weatherCode: "weather_code",
    windGust: "wind_gusts_10m_max",
    uvIndexMax: "uv_index_max",
  }).map((row, index) => ({
    ...row,
    sunrise: data.daily.sunrise?.[index] ?? null,
    sunset: data.daily.sunset?.[index] ?? null,
  }));

  const today =
    daily.find((day) => day.time === String(data.current.time).slice(0, 10)) ??
    daily[0];
  const currentHour = hourly.find(
    (hour) =>
      String(hour.time).slice(0, 13) === String(data.current.time).slice(0, 13),
  );
  return {
    fetchedAt,
    locationName: config.locationName,
    timezone: data.timezone ?? config.timezone,
    current: {
      time: data.current.time,
      temp: numberOrNull(data.current.temperature_2m),
      feelsLike: numberOrNull(data.current.apparent_temperature),
      humidity: numberOrNull(data.current.relative_humidity_2m),
      pressure: numberOrNull(data.current.pressure_msl),
      precipitation: numberOrNull(data.current.precipitation),
      wind: numberOrNull(data.current.wind_speed_10m),
      windDirection: numberOrNull(data.current.wind_direction_10m),
      windGust: numberOrNull(data.current.wind_gusts_10m),
      weatherCode: numberOrNull(data.current.weather_code),
      uvIndex: currentHour?.uvIndex ?? null,
      tempMin: today?.tempMin ?? null,
      tempMax: today?.tempMax ?? null,
      sunrise: today?.sunrise ?? null,
      sunset: today?.sunset ?? null,
    },
    hourly,
    daily,
  };
}

export function weatherInfo(code) {
  const groups = [
    [[0], "☀️", "Clear sky"],
    [[1], "🌤️", "Mainly clear"],
    [[2], "⛅", "Partly cloudy"],
    [[3], "☁️", "Overcast"],
    [[45, 48], "🌫️", "Fog"],
    [[51, 53, 55], "🌦️", "Drizzle"],
    [[56, 57], "🌧️", "Freezing drizzle"],
    [[61, 63, 65], "🌧️", "Rain"],
    [[66, 67], "🌧️", "Freezing rain"],
    [[71, 73, 75, 77], "❄️", "Snow"],
    [[80, 81, 82], "🌦️", "Rain showers"],
    [[85, 86], "🌨️", "Snow showers"],
    [[95], "⛈️", "Thunderstorm"],
    [[96, 99], "⛈️", "Thunderstorm with hail"],
  ];
  const match = groups.find(([codes]) => codes.includes(Number(code)));
  return match
    ? { icon: match[1], description: match[2] }
    : { icon: "❔", description: "Unknown" };
}

export function cacheKey(config) {
  return `weather-display:v2:${config.weatherProvider}:${config.latitude}:${config.longitude}:${config.timezone}`;
}
