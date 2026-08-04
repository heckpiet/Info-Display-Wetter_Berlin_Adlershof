export const RELEASES_URL =
  "https://github.com/heckpiet/Info-Display-Wetter_Berlin_Adlershof/releases/latest";
export const LATEST_RELEASE_API =
  "https://api.github.com/repos/heckpiet/Info-Display-Wetter_Berlin_Adlershof/releases/latest";
export const VERSION_CACHE_KEY = "weather-display:latest-release";
export const VERSION_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export function normalizeVersion(value) {
  return String(value ?? "")
    .trim()
    .replace(/^v/i, "")
    .split("-")[0];
}

export function compareVersions(left, right) {
  const a = normalizeVersion(left).split(".").map(Number);
  const b = normalizeVersion(right).split(".").map(Number);
  if (a.some(Number.isNaN) || b.some(Number.isNaN)) return 0;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

function readCachedRelease(storage, now, cacheKey) {
  try {
    const cached = JSON.parse(storage.getItem(cacheKey));
    if (
      cached?.version &&
      Number.isFinite(cached.checkedAt) &&
      now - cached.checkedAt < VERSION_CACHE_TTL_MS
    )
      return cached.version;
  } catch {
    // Ignore unavailable or malformed browser storage.
  }
  return null;
}

export async function getLatestRelease({
  fetchImpl = fetch,
  storage = localStorage,
  now = Date.now(),
  cacheKey = VERSION_CACHE_KEY,
} = {}) {
  const cached = readCachedRelease(storage, now, cacheKey);
  if (cached) return cached;

  const response = await fetchImpl(LATEST_RELEASE_API, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok)
    throw new Error(`GitHub release check failed (${response.status})`);
  const release = await response.json();
  const version = normalizeVersion(release.tag_name);
  if (!/^\d+\.\d+\.\d+$/.test(version))
    throw new Error("GitHub returned an invalid release version");
  try {
    storage.setItem(cacheKey, JSON.stringify({ version, checkedAt: now }));
  } catch {
    // The live result remains usable when storage is unavailable.
  }
  return version;
}
