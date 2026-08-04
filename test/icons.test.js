import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { weatherInfo } from "../weather.js";

const WMO_CODES = [0, 1, 2, 3, 45, 51, 56, 61, 66, 71, 80, 85, 95, 96, -1];
const PACKS = ["fill", "flat", "line", "animated"];

test("every bundled pack covers every mapped WMO group by day and night", async () => {
  const iconPaths = new Set();
  for (const pack of PACKS)
    for (const code of WMO_CODES)
      for (const isNight of [false, true])
        iconPaths.add(weatherInfo(code, "en", pack, isNight).icon);

  const results = await Promise.allSettled(
    [...iconPaths].map((path) => access(path)),
  );
  const missing = [...iconPaths].filter(
    (_, index) => results[index].status === "rejected",
  );
  assert.deepEqual(missing, []);
});
