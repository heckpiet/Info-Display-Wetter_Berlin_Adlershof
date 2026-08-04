import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "weather.js",
  "providers.js",
  "settings.js",
  "version.js",
  "progress.js",
  "display.js",
  "i18n.js",
  "sw.js",
  "manifest.webmanifest",
  "config.js",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "assets/meteocons/fill/clear-day.svg",
  "assets/meteocons/flat/clear-day.svg",
  "assets/meteocons/line/clear-day.svg",
  "assets/meteocons/animated/clear-day.svg",
  "docs/images/kiosk-desktop.png",
  "docs/images/kiosk-daily-forecast.png",
  "docs/images/settings-dialog.png",
  "docs/images/settings-appearance.png",
  "docs/images/mode-essential.png",
  "docs/images/mode-glance.png",
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [html, config, packageJson, app, providers, progress, serviceWorker] =
  await Promise.all([
    readFile("index.html", "utf8"),
    readFile("config.js", "utf8"),
    readFile("package.json", "utf8").then(JSON.parse),
    readFile("app.js", "utf8"),
    readFile("providers.js", "utf8"),
    readFile("progress.js", "utf8"),
    readFile("sw.js", "utf8"),
  ]);

const failures = [];
if (!/<html lang="en">/.test(html))
  failures.push("The English interface must declare lang=en");
const releaseQuery = `?v=${packageJson.version}`;
if (!html.includes(`src="app.js${releaseQuery}"`))
  failures.push("index.html must load the release-versioned app.js");
if (!html.includes(`href="styles.css${releaseQuery}"`))
  failures.push("index.html must load styles.css");
if (!html.includes(`register("./sw.js${releaseQuery}"`))
  failures.push(
    "index.html must register the release-versioned service worker",
  );
if (/google\.script|<\?=/.test(html))
  failures.push("Legacy Apps Script syntax is not allowed");
if (!/locale: "de-DE"/.test(config))
  failures.push("Adlershof must default to de-DE formatting");
if (!/weatherProvider: "openMeteoDwd"/.test(config))
  failures.push("Open-Meteo DWD ICON must remain the default provider");
if (!/iconPack: "fill"/.test(config))
  failures.push("Meteocons Fill must remain the default icon pack");
if (!config.includes(`version: "${packageJson.version}"`))
  failures.push("App and package versions must match");
for (const [name, source] of Object.entries({ app, providers, progress })) {
  const localImports = [...source.matchAll(/from "(\.\/[^"?]+)([^"]*)"/g)];
  if (localImports.some((match) => match[2] !== releaseQuery))
    failures.push(`${name}.js contains an unversioned local module import`);
}
if (!serviceWorker.includes(`const VERSION = "${packageJson.version}"`))
  failures.push("Service-worker and package versions must match");

if (failures.length) throw new Error(failures.join("\n"));
console.log(`Static site validation passed for v${packageJson.version}.`);
