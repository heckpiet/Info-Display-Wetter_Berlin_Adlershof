import test from "node:test";
import assert from "node:assert/strict";
import {
  compareVersions,
  getLatestRelease,
  VERSION_CACHE_KEY,
} from "../version.js";

test("compares semantic release versions", () => {
  assert.equal(compareVersions("v3.1.0", "3.0.3"), 1);
  assert.equal(compareVersions("3.0.3", "v3.0.3"), 0);
  assert.equal(compareVersions("3.0.2", "3.0.3"), -1);
});

test("loads and caches the latest GitHub release", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ tag_name: "v3.0.3" }),
  });

  assert.equal(
    await getLatestRelease({ fetchImpl, storage, now: 1000 }),
    "3.0.3",
  );
  assert.match(values.get(VERSION_CACHE_KEY), /3\.0\.3/);
  assert.equal(
    await getLatestRelease({
      fetchImpl,
      storage,
      now: 2000,
      cacheKey: `${VERSION_CACHE_KEY}:3.7.2`,
    }),
    "3.0.3",
  );
  assert.match(values.get(`${VERSION_CACHE_KEY}:3.7.2`), /3\.0\.3/);
});
