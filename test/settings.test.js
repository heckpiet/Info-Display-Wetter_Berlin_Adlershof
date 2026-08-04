import test from "node:test";
import assert from "node:assert/strict";
import { loadSettings, sanitizeSettings } from "../settings.js";

test("settings allow-list excludes secrets and unknown properties", () => {
  const result = sanitizeSettings({
    locationName: "Berlin",
    apiKey: "secret",
    unknown: true,
  });
  assert.deepEqual(result, { locationName: "Berlin" });
});

test("invalid stored settings fail safely", () => {
  const storage = { getItem: () => "not-json" };
  assert.deepEqual(loadSettings(storage), {});
});

test("information mode is included in portable settings", () => {
  assert.deepEqual(
    sanitizeSettings({
      informationMode: "glance",
      forecastRotation: "manual",
      yearProgressMode: "days",
    }),
    {
      informationMode: "glance",
      forecastRotation: "manual",
      yearProgressMode: "days",
    },
  );
  assert.deepEqual(
    sanitizeSettings({ informationMode: "unknown", forecastRotation: "yes" }),
    {},
  );
  assert.deepEqual(sanitizeSettings({ yearProgressMode: "invalid" }), {});
  assert.deepEqual(
    sanitizeSettings({
      deviceProfile: "tv",
      displayScale: 1.2,
      contentWidthPercent: 90,
    }),
    { deviceProfile: "tv", displayScale: 1.2, contentWidthPercent: 90 },
  );
  assert.deepEqual(
    sanitizeSettings({
      deviceProfile: "watch",
      displayScale: 4,
      contentWidthPercent: 20,
    }),
    {},
  );
});
