import test from "node:test";
import assert from "node:assert/strict";
import { mapMetNo, mapOpenWeather } from "../worker.js";
test("MET Norway mapper creates canonical data", () => {
  const row = {
    time: "2026-08-04T12:00:00Z",
    data: {
      instant: { details: { air_temperature: 20, wind_speed: 2 } },
      next_1_hours: {
        summary: { symbol_code: "partlycloudy_day" },
        details: { precipitation_amount: 0 },
      },
    },
  };
  const result = mapMetNo({
    properties: {
      timeseries: Array.from({ length: 96 }, (_, i) => ({
        ...row,
        time: new Date(Date.parse(row.time) + i * 3600000).toISOString(),
      })),
    },
  });
  assert.equal(result.current.temp, 20);
  assert.ok(result.daily.length >= 4);
});
test("OpenWeather mapper converts wind to km/h", () => {
  const c = {
    dt: 1,
    temp: 20,
    wind_speed: 2,
    sunrise: 1,
    sunset: 2,
    weather: [{ id: 800 }],
  };
  const result = mapOpenWeather({
    timezone: "UTC",
    current: c,
    hourly: [c],
    daily: [
      {
        dt: 1,
        temp: { min: 10, max: 20 },
        sunrise: 1,
        sunset: 2,
        weather: [{ id: 800 }],
      },
    ],
  });
  assert.equal(result.current.wind, 7.2);
});
