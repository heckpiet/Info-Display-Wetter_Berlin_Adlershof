const TEXT = {
  en: {
    weather: "Weather",
    current: "Current",
    forecast: "Forecast",
    loading: "Loading…",
    feels: "Feels like",
    range: "Today's low / high",
    precipitation: "Precipitation",
    humidity: "Humidity",
    pressure: "Air pressure",
    wind: "Wind",
    gusts: "Wind gusts",
    uv: "UV index",
    sun: "Sunrise / sunset",
    nextHours: "Next hours",
    nextDays: "Next days",
    settings: "Display settings",
    openSettings: "Open settings",
    switchForecast: "Switch forecast view",
    yearProgress: "Year progress",
    starting: "Starting…",
    running: "Running v{version}",
    githubLatest: "GitHub latest: v{version}",
    updateAvailable: "GitHub latest: v{version} · update available",
    githubUnavailable: "GitHub: unavailable",
    updated: "Updated {date} · {age} min old",
    offline:
      "Offline · cached data from {age} min ago · retrying automatically",
    unavailable: "Weather unavailable · {error} · retrying automatically",
    nextRetry: "next retry in {seconds}s",
    percentYear: "{percent}% of year",
    dayYear: "Day {day} of {total}",
  },
  de: {
    weather: "Wetter",
    current: "Aktuell",
    forecast: "Vorhersage",
    loading: "Wird geladen…",
    feels: "Gefühlt",
    range: "Heutiges Tief / Hoch",
    precipitation: "Niederschlag",
    humidity: "Luftfeuchtigkeit",
    pressure: "Luftdruck",
    wind: "Wind",
    gusts: "Windböen",
    uv: "UV-Index",
    sun: "Sonnenaufgang / -untergang",
    nextHours: "Nächste Stunden",
    nextDays: "Nächste Tage",
    settings: "Anzeigeeinstellungen",
    openSettings: "Einstellungen öffnen",
    switchForecast: "Vorhersage wechseln",
    yearProgress: "Jahresfortschritt",
    starting: "Startet…",
    running: "Installiert v{version}",
    githubLatest: "GitHub aktuell: v{version}",
    updateAvailable: "GitHub aktuell: v{version} · Update verfügbar",
    githubUnavailable: "GitHub: nicht erreichbar",
    updated: "Aktualisiert {date} · {age} Min. alt",
    offline: "Offline · Cache von vor {age} Min. · neuer Versuch automatisch",
    unavailable: "Wetter nicht verfügbar · {error} · neuer Versuch automatisch",
    nextRetry: "nächster Versuch in {seconds} Sek.",
    percentYear: "{percent}% des Jahres",
    dayYear: "Tag {day} von {total}",
  },
};

export function translate(language, key, values = {}) {
  let text = (TEXT[language] ?? TEXT.en)[key] ?? TEXT.en[key] ?? key;
  for (const [name, value] of Object.entries(values))
    text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

function label(form, name, text) {
  const element = form.elements[name]?.closest("label");
  if (element?.firstChild) element.firstChild.textContent = `${text} `;
}

function options(form, name, labels) {
  [...(form.elements[name]?.options ?? [])].forEach((option, index) => {
    option.textContent = labels[index] ?? option.textContent;
  });
}

export function applyStaticTranslations(language) {
  const de = language === "de";
  const t = (key) => translate(language, key);
  document.documentElement.lang = language;
  document.getElementById("now-heading").textContent = t("current");
  document.getElementById("forecast-heading").textContent = t("forecast");
  document.getElementById("now-description").textContent = t("loading");
  document.getElementById("settings-trigger").ariaLabel = t("openSettings");
  document.getElementById("flip-button").ariaLabel = t("switchForecast");
  document.querySelector(".progress").ariaLabel = t("yearProgress");
  document.getElementById("status").textContent = t("starting");
  const metrics = {
    "now-feels": "feels",
    "now-range": "range",
    "now-precip": "precipitation",
    "now-humidity": "humidity",
    "now-pressure": "pressure",
    "now-wind": "wind",
    "now-gust": "gusts",
    "now-uv": "uv",
    "now-sun": "sun",
  };
  for (const [id, key] of Object.entries(metrics))
    document.getElementById(id).previousElementSibling.textContent = t(key);

  const form = document.getElementById("settings-form");
  form.querySelector("h2").textContent = t("settings");
  const tabs = form.querySelectorAll('[role="tab"]');
  const tabNames = de
    ? ["Standort & Daten", "Anzeige", "Design & Verhalten", "Sicherung & Reset"]
    : ["Location & data", "Display", "Appearance & behavior", "Backup & reset"];
  tabs.forEach((tab, index) => (tab.textContent = tabNames[index]));
  label(form, "locationName", de ? "Standortname" : "Location name");
  label(form, "latitude", de ? "Breitengrad" : "Latitude");
  label(form, "longitude", de ? "Längengrad" : "Longitude");
  label(
    form,
    "refreshIntervalMinutes",
    de ? "Aktualisierung (Min.)" : "Refresh minutes",
  );
  label(form, "cacheMaxAgeHours", de ? "Cache (Stunden)" : "Cache hours");
  label(form, "deviceProfile", de ? "Geräteprofil" : "Device profile");
  label(form, "layoutMode", "Layout");
  label(form, "informationMode", de ? "Informationsmodus" : "Information mode");
  label(form, "density", de ? "Dichte" : "Density");
  label(form, "fontScale", de ? "Schriftgröße" : "Font scale");
  label(form, "displayScale", de ? "Anzeigeskalierung" : "Display scale");
  label(
    form,
    "contentWidthPercent",
    de ? "Inhaltsbreite (%)" : "Content width (%)",
  );
  label(form, "language", de ? "Sprache" : "Language");
  label(form, "iconPack", de ? "Icon-Paket" : "Icon pack");
  label(form, "themeMode", "Theme");
  label(
    form,
    "forecastRotation",
    de ? "Vorhersagewechsel" : "Forecast rotation",
  );
  label(form, "yearProgressMode", de ? "Jahresfortschritt" : "Year progress");
  options(
    form,
    "deviceProfile",
    de
      ? ["Automatisch", "Smartphone", "Tablet", "Desktop", "TV / Kiosk"]
      : ["Auto-detect", "Phone", "Tablet", "Desktop", "TV / kiosk"],
  );
  options(
    form,
    "informationMode",
    de
      ? ["Detailliert", "Wesentlich", "Fernansicht"]
      : ["Detailed", "Essential", "Glance"],
  );
  options(
    form,
    "density",
    de ? ["Großzügig", "Kompakt"] : ["Comfortable", "Compact"],
  );
  options(
    form,
    "forecastRotation",
    de ? ["Automatisch", "Nur manuell"] : ["Automatic", "Manual only"],
  );
  options(
    form,
    "yearProgressMode",
    de
      ? ["Prozent und Tage", "Nur Prozent", "Nur Tage", "Ausgeblendet"]
      : ["Percentage and days", "Percentage only", "Days only", "Hidden"],
  );
  options(form, "language", ["Deutsch", "English"]);
  options(
    form,
    "iconPack",
    de
      ? ["☀️ Farbige Emoji", "☀︎ Monochrom", "○ Minimal"]
      : ["☀️ Color emoji", "☀︎ Monochrome", "○ Minimal"],
  );
  form.querySelector(".settings-backup p").textContent = de
    ? "Einstellungen als JSON sichern, wieder importieren oder für diesen Browser zurücksetzen."
    : "Export a portable JSON backup, import saved settings, or restore all defaults for this browser.";
  document.getElementById("settings-export").textContent = de
    ? "Einstellungen exportieren"
    : "Export settings";
  document.querySelector(".import-button").firstChild.textContent = de
    ? "Einstellungen importieren"
    : "Import settings";
  document.getElementById("settings-reset").textContent = de
    ? "Standard wiederherstellen"
    : "Reset to defaults";
  form.querySelector('button[value="cancel"]').textContent = de
    ? "Abbrechen"
    : "Cancel";
  document.getElementById("settings-save").textContent = de
    ? "Einstellungen speichern"
    : "Save settings";
}
