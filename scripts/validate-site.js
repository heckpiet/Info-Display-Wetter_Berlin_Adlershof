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
  "sw.js",
  "manifest.webmanifest",
  "config.js",
  "LICENSE",
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [html, config, packageJson] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("config.js", "utf8"),
  readFile("package.json", "utf8").then(JSON.parse),
]);

const failures = [];
if (!/<html lang="en">/.test(html))
  failures.push("The English interface must declare lang=en");
if (!/src="app\.js"/.test(html)) failures.push("index.html must load app.js");
if (!/href="styles\.css"/.test(html))
  failures.push("index.html must load styles.css");
if (/google\.script|<\?=/.test(html))
  failures.push("Legacy Apps Script syntax is not allowed");
if (!/locale: "de-DE"/.test(config))
  failures.push("Adlershof must default to de-DE formatting");
if (!/weatherProvider: "openMeteoDwd"/.test(config))
  failures.push("Open-Meteo DWD ICON must remain the default provider");
if (!config.includes(`version: "${packageJson.version}"`))
  failures.push("App and package versions must match");

if (failures.length) throw new Error(failures.join("\n"));
console.log(`Static site validation passed for v${packageJson.version}.`);
