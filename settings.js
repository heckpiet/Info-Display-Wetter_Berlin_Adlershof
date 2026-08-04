const STORAGE_KEY = "weather-display:settings:v1";
const ALLOWED = [
  "locationName",
  "latitude",
  "longitude",
  "refreshIntervalMinutes",
  "cacheMaxAgeHours",
  "themeMode",
  "fontScale",
  "density",
  "informationMode",
  "forecastRotation",
  "yearProgressMode",
  "layoutMode",
  "deviceProfile",
  "displayScale",
  "contentWidthPercent",
  "controlsAutoHideSeconds",
];

export function sanitizeSettings(value = {}) {
  const result = {};
  for (const key of ALLOWED)
    if (value[key] !== undefined) result[key] = value[key];
  if (
    result.informationMode !== undefined &&
    !["detailed", "essential", "glance"].includes(result.informationMode)
  )
    delete result.informationMode;
  if (
    result.forecastRotation !== undefined &&
    !["auto", "manual"].includes(result.forecastRotation)
  )
    delete result.forecastRotation;
  if (
    result.yearProgressMode !== undefined &&
    !["percentage", "days", "both", "hidden"].includes(result.yearProgressMode)
  )
    delete result.yearProgressMode;
  if (
    result.deviceProfile !== undefined &&
    !["auto", "phone", "tablet", "desktop", "tv"].includes(result.deviceProfile)
  )
    delete result.deviceProfile;
  if (
    result.displayScale !== undefined &&
    (!Number.isFinite(Number(result.displayScale)) ||
      Number(result.displayScale) < 0.75 ||
      Number(result.displayScale) > 1.5)
  )
    delete result.displayScale;
  if (
    result.contentWidthPercent !== undefined &&
    (!Number.isFinite(Number(result.contentWidthPercent)) ||
      Number(result.contentWidthPercent) < 70 ||
      Number(result.contentWidthPercent) > 100)
  )
    delete result.contentWidthPercent;
  return result;
}

export function loadSettings(storage = globalThis.localStorage) {
  try {
    return sanitizeSettings(JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}"));
  } catch {
    return {};
  }
}

export function initialiseSettings(config) {
  const dialog = document.getElementById("settings-dialog");
  const form = document.getElementById("settings-form");
  const populate = (values) =>
    ALLOWED.forEach((key) => {
      if (form.elements[key]) form.elements[key].value = values[key] ?? "";
    });
  document.getElementById("settings-trigger").addEventListener("click", () => {
    populate(config);
    dialog.showModal();
  });
  document.getElementById("settings-save").addEventListener("click", () => {
    const data = Object.fromEntries(new FormData(form));
    for (const key of [
      "latitude",
      "longitude",
      "refreshIntervalMinutes",
      "cacheMaxAgeHours",
      "fontScale",
      "displayScale",
      "contentWidthPercent",
    ])
      data[key] = Number(data[key]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSettings(data)));
    location.reload();
  });
  document.getElementById("settings-reset").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
  document.getElementById("settings-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(sanitizeSettings(config), null, 2)], {
      type: "application/json",
    });
    const link = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "weather-display-settings.json",
    });
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document
    .getElementById("settings-import")
    .addEventListener("change", async (event) => {
      const imported = sanitizeSettings(
        JSON.parse(await event.target.files[0].text()),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      location.reload();
    });
  let timer;
  const showControls = () => {
    document.body.classList.remove("controls-hidden");
    clearTimeout(timer);
    timer = setTimeout(
      () => document.body.classList.add("controls-hidden"),
      config.controlsAutoHideSeconds * 1000,
    );
  };
  ["mousemove", "pointerdown", "keydown"].forEach((name) =>
    addEventListener(name, showControls, { passive: true }),
  );
  showControls();
}
