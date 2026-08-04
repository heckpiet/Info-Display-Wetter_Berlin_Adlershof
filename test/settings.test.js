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
