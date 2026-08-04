import test from "node:test";
import assert from "node:assert/strict";
import { translate } from "../i18n.js";

test("translates runtime messages in German and English", () => {
  assert.equal(translate("de", "current"), "Aktuell");
  assert.equal(translate("en", "current"), "Current");
  assert.equal(
    translate("de", "updateAvailable", { version: "4.0.0" }),
    "GitHub aktuell: v4.0.0 · Update verfügbar",
  );
});

test("falls back to English for unsupported language codes", () => {
  assert.equal(translate("fr", "forecast"), "Forecast");
});
