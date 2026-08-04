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
  assert.deepEqual(result.insets, { top: 0, right: 0, bottom: 0, left: 0 });
});

test("resolves uniform and individual display edge spacing", () => {
  const detected = { detectedProfile: "desktop" };
  const base = {
    deviceProfile: "auto",
    fontScale: 1,
    displayScale: 1,
    contentWidthPercent: 100,
  };
  assert.deepEqual(
    resolveDisplay({ ...base, frameInset: 32 }, detected).insets,
    {
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    },
  );
  assert.deepEqual(
    resolveDisplay(
      {
        ...base,
        frameInsetMode: "individual",
        frameInsetTop: 10,
        frameInsetRight: 20,
        frameInsetBottom: 30,
        frameInsetLeft: 40,
      },
      detected,
    ).insets,
    { top: 10, right: 20, bottom: 30, left: 40 },
  );
});
