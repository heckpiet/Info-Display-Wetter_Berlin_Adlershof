const STORAGE_KEY = "weather-display:settings:v1";
const ALLOWED = [
  "locationName",
  "latitude",
  "longitude",
  "refreshIntervalMinutes",
  "cacheMaxAgeHours",
  "themeMode",
  "language",
  "iconPack",
  "fontScale",
  "density",
  "informationMode",
  "forecastRotation",
  "yearProgressMode",
  "secondaryInfoMode",
  "secondaryInfoDelaySeconds",
  "layoutMode",
  "deviceProfile",
  "displayScale",
  "contentWidthPercent",
  "frameInsetMode",
  "frameInset",
  "frameInsetTop",
  "frameInsetRight",
  "frameInsetBottom",
  "frameInsetLeft",
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
    result.secondaryInfoMode !== undefined &&
    !["always", "dim", "autoHide", "important"].includes(
      result.secondaryInfoMode,
    )
  )
    delete result.secondaryInfoMode;
  if (
    result.secondaryInfoDelaySeconds !== undefined &&
    (!Number.isInteger(Number(result.secondaryInfoDelaySeconds)) ||
      Number(result.secondaryInfoDelaySeconds) < 3 ||
      Number(result.secondaryInfoDelaySeconds) > 300)
  )
    delete result.secondaryInfoDelaySeconds;
  if (
    result.deviceProfile !== undefined &&
    !["auto", "phone", "tablet", "desktop", "tv"].includes(result.deviceProfile)
  )
    delete result.deviceProfile;
  if (result.language !== undefined && !["de", "en"].includes(result.language))
    delete result.language;
  if (
    result.iconPack !== undefined &&
    !["color", "mono", "minimal"].includes(result.iconPack)
  )
    delete result.iconPack;
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
  if (
    result.frameInsetMode !== undefined &&
    !["uniform", "individual"].includes(result.frameInsetMode)
  )
    delete result.frameInsetMode;
  for (const key of [
    "frameInset",
    "frameInsetTop",
    "frameInsetRight",
    "frameInsetBottom",
    "frameInsetLeft",
  ]) {
    if (
      result[key] !== undefined &&
      (!Number.isInteger(Number(result[key])) ||
        Number(result[key]) < 0 ||
        Number(result[key]) > 500)
    )
      delete result[key];
  }
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
  const tabs = [...form.querySelectorAll('[role="tab"]')];
  const panels = [...form.querySelectorAll('[role="tabpanel"]')];
  const insetMode = form.elements.frameInsetMode;
  const yearProgressMode = form.elements.yearProgressMode;
  const secondaryInfoMode = form.elements.secondaryInfoMode;
  const updateInsetControls = () => {
    const individual = insetMode.value === "individual";
    form.elements.frameInset.readOnly = individual;
    for (const key of [
      "frameInsetTop",
      "frameInsetRight",
      "frameInsetBottom",
      "frameInsetLeft",
    ])
      form.elements[key].readOnly = !individual;
  };
  insetMode.addEventListener("change", updateInsetControls);
  const updateSecondaryInfoControls = () => {
    form.elements.secondaryInfoDelaySeconds.readOnly = ![
      "dim",
      "autoHide",
    ].includes(secondaryInfoMode.value);
  };
  secondaryInfoMode.addEventListener("change", updateSecondaryInfoControls);
  const previewYearProgress = (mode) =>
    dispatchEvent(
      new CustomEvent("weather-display:preview-year-progress", {
        detail: { mode },
      }),
    );
  yearProgressMode.addEventListener("change", () =>
    previewYearProgress(yearProgressMode.value),
  );
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "default")
      previewYearProgress(config.yearProgressMode);
  });
  const activateTab = (tab, focus = false) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let targetIndex;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") targetIndex = 0;
      else if (event.key === "End") targetIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[targetIndex], true);
    });
  });
  document.getElementById("settings-trigger").addEventListener("click", () => {
    populate(config);
    updateInsetControls();
    updateSecondaryInfoControls();
    activateTab(tabs[0]);
    dialog.showModal();
    tabs[0].focus();
  });
  document.getElementById("settings-save").addEventListener("click", () => {
    const data = Object.fromEntries(new FormData(form));
    for (const key of [
      "latitude",
      "longitude",
      "refreshIntervalMinutes",
      "cacheMaxAgeHours",
      "secondaryInfoDelaySeconds",
      "fontScale",
      "displayScale",
      "contentWidthPercent",
      "frameInset",
      "frameInsetTop",
      "frameInsetRight",
      "frameInsetBottom",
      "frameInsetLeft",
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
