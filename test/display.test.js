import test from "node:test";
import assert from "node:assert/strict";
import { detectDisplay, resolveDisplay } from "../display.js";

function environment(width, height, coarse = false) {
  return {
    innerWidth: width,
    innerHeight: height,
    devicePixelRatio: 2,
    matchMedia: (query) => ({ matches: coarse && query.includes("coarse") }),
    navigator: { serviceWorker: {} },
    document: { fullscreenEnabled: true },
  };
}

test("classifies actual viewport sizes without user-agent sniffing", () => {
  assert.equal(
    detectDisplay(environment(390, 844, true)).detectedProfile,
    "phone",
  );
  assert.equal(
    detectDisplay(environment(900, 1200, true)).detectedProfile,
    "tablet",
  );
  assert.equal(
    detectDisplay(environment(1440, 900)).detectedProfile,
    "desktop",
  );
  assert.equal(detectDisplay(environment(1920, 1080)).detectedProfile, "tv");
});

test("manual profile and scale override automatic display behavior", () => {
  const result = resolveDisplay(
    {
      deviceProfile: "tv",
      fontScale: 1,
      displayScale: 1.1,
      contentWidthPercent: 90,
    },
    { detectedProfile: "phone" },
  );
  assert.equal(result.profile, "tv");
  assert.equal(result.scale, 1.265);
  assert.equal(result.widthPercent, 90);
});
