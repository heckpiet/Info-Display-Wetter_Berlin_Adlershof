# Weather Info Display

A privacy-friendly, bilingual weather dashboard for unattended kiosk, wall-tablet, and smart-display browsers. The standard configuration uses the high-resolution DWD ICON forecast through Open-Meteo, runs entirely as static files, and requires no API key.

[Live demo](https://heckpiet.github.io/Info-Display-Wetter_Berlin_Adlershof/) · [Latest release](https://github.com/heckpiet/Info-Display-Wetter_Berlin_Adlershof/releases/latest) · [Documentation](docs/SETTINGS.md) · [Provider setup](docs/WEATHER_PROVIDERS.md)

Berlin-Adlershof is the included example location. Location, language, visual density, icon style, kiosk spacing, and secondary-information behavior can be changed without rebuilding the application.

## Screenshots

### Kiosk overview

![Desktop kiosk view with current weather and the hourly forecast](docs/images/kiosk-desktop.png)

The default desktop layout prioritizes current conditions, four upcoming hours, and a live clock. Routine provider, version, freshness, and year-progress information automatically leaves the layout after inactivity; important offline, error, and update states remain visible.

### Daily forecast

![Desktop kiosk view with the four-day forecast](docs/images/kiosk-daily-forecast.png)

The forecast card switches automatically or manually between the next four hours and the next four days.

### Display and appearance settings

| Display, scaling, and kiosk edges                                                              | Language, icons, and secondary information                                                               |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| ![Display settings with responsive profiles and edge spacing](docs/images/settings-dialog.png) | ![Appearance settings with language, icon, and visibility controls](docs/images/settings-appearance.png) |

The four keyboard-accessible tabs cover location/data, display/layout, appearance/behavior, and backup/reset. Settings are stored only in the local browser and can be exported or imported as JSON.

> The screenshots show live forecast data captured for the Berlin-Adlershof example. Values and the adaptive theme change with time and weather conditions.

### Reduced information modes

| Essential                                                                        | Glance                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ![Essential mode with core weather measurements](docs/images/mode-essential.png) | ![Glance mode with large distance-readable values](docs/images/mode-glance.png) |

Choose **Essential** for a quieter wall display or **Glance** for maximum readability from a distance. The original full view remains available as **Detailed**.

## Features

- Current conditions and alternating four-hour/four-day forecast
- Daily low/high, wind gusts, UV index, sunrise/sunset times toggle, full date, and explicit data age
- 8 selectable layout structure modes (Standard Kiosk Grid, Hero Header & Bottom Cards [Bild 1], Smart Display Grid [Bild 2], Split Columns, Compact Banner Bar, Focused Hero Deck, Magazine Editorial, Ambient Room Clock)
- Custom background image support (Atmospheric presets, custom Web URLs, and local image file upload) with customizable card opacity slider (10% - 100%)
- 8 selectable color themes (Sky Glass, Cyberpunk Neon, Nordic Slate, Forest Aurora, Sunset Coral, Minimal Dark, Minimal Light, High Contrast)
- Built-in Custom Theme Builder with HTML5 color pickers for background, tile, text, accent, and chip colors
- 5 adaptive day-phase themes (Morning, Noon, Afternoon, Evening, Night), manual forecast switching, and kiosk display profiles
- Responsive kiosk layout for phones, tablets, desktop displays, and TVs
- Detailed, essential, and distance-optimized glance information modes
- Cached last-known-good data when the network or API is unavailable
- Automatic refresh, timeout, and retry handling
- URL-based location configuration
- Provider abstraction with proxy-ready DWD, MET Norway, and OpenWeather profiles
- Atomic, versioned offline assets that prevent mixed-release layouts
- GitHub Pages deployment after pull-request and main-branch quality checks
- Running and latest GitHub release versions shown directly on the display
- Configurable year progress as percentage, elapsed days, both, or hidden
- Viewport- and capability-aware device profiles with manual scale and width overrides
- Uniform or per-side pixel spacing for kiosk bezels, overscan, and asymmetric mounting frames
- Configurable secondary-information dimming or auto-hide with persistent critical status notices
- Thematically grouped, keyboard-accessible settings tabs
- Complete German/English runtime localization and four local Meteocons icon styles
- Day/night-aware weather symbols with automatic static fallback for reduced-motion users
- No cookies, analytics, account, backend, or secrets

## Quick start

Static ES modules must be served over HTTP; opening `index.html` directly with `file://` is not supported.

```sh
python -m http.server 8080
```

Open <http://localhost:8080>.

## Configuration

Edit [`config.js`](config.js) to change the permanent defaults. Adlershof remains the shipped example:

```js
latitude: 52.4357,
longitude: 13.5406,
locationName: "Berlin-Adlershof",
timezone: "Europe/Berlin",
locale: "de-DE",
```

For one display, override the location in its kiosk URL:

```text
https://example.github.io/repository/?lat=53.5511&lon=9.9937&name=Hamburg&timezone=Europe/Berlin
```

Supported parameters are `lat`, `lon`, `name`, `timezone`, and `locale`. Invalid coordinates are ignored. Use an [IANA timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

`locale` controls date, time, and number formatting. The independently selectable interface language supports German and English; `de-DE` is the appropriate default formatting locale for the Berlin-Adlershof example. Unsupported locale and timezone overrides are ignored safely.

## Kiosk mode

Microsoft Edge on Windows:

```powershell
msedge.exe --kiosk "https://example.github.io/repository/" --edge-kiosk-type=fullscreen --no-first-run
```

Google Chrome:

```powershell
chrome.exe --kiosk "https://example.github.io/repository/" --no-first-run --disable-session-crashed-bubble
```

Configure the operating system to start the browser after login and to keep the display awake. Test recovery after disconnecting and reconnecting the network before leaving the display unattended.

## Data source decision

The project intentionally keeps Open-Meteo's dedicated DWD ICON endpoint.

- **Open-Meteo DWD ICON (selected):** browser-friendly JSON, no key for non-commercial use, CORS support, and automatic combination of ICON-D2 (~2 km), ICON-EU, and ICON Global forecasts.
- **Direct DWD Open Data:** authoritative source, but primarily distributed as GRIB2 files. Parsing and spatial extraction require a backend or build pipeline, which conflicts with this static deployment.
- **Bright Sky:** an excellent simple DWD JSON API for station observations and MOSMIX forecasts, but it does not improve this display's forecast use case enough to justify changing providers.

For commercial use, check the current Open-Meteo licensing and pricing terms. Attribution to DWD and Open-Meteo remains visible in the interface.

Alternative provider profiles are prepared but disabled by default. Direct DWD Open Data requires GRIB2 processing, MET Norway requires an identified server-side client and has browser CORS constraints, and OpenWeather requires an API key. Keys must never be placed in this static application. See [Weather provider integration](docs/WEATHER_PROVIDERS.md) for the proxy contract and activation instructions.

Version 3 includes a deployable Cloudflare Worker proxy with MET Norway and OpenWeather adapters plus a controlled DWD ingestion-service hook. It remains inactive until the operator supplies external hosting and any required secrets.

Before enabling it, review the complete [Package E prerequisites and go-live checklist](docs/WEATHER_PROVIDERS.md#prerequisites). The default display requires none of this proxy infrastructure.

## CI/CD and deployment

`quality.yml` runs linting, formatting checks, automated tests, static-site validation, release-asset version alignment, and a live API smoke test on pushes and pull requests. `deploy-pages.yml` publishes the exact static files to GitHub Pages only after quality checks pass on `main`. Versioned module, stylesheet, manifest, and service-worker URLs keep online and offline clients on one coherent release.

To enable deployment:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the deployment workflow manually.

No repository secret is required. Pull requests do not deploy.

## Development

Requires Node.js 24 or newer.

```sh
npm ci
npm test
npm run lint
npm run format:check
npm run validate:site
npm run smoke
```

`npm run smoke` contacts the production weather API. The other checks run locally without network access.

## Privacy and resilience

The default browser contacts `api.open-meteo.com` for weather and GitHub's public releases API for the optional update indicator. The latest successful forecast is stored in browser `localStorage` for up to 12 hours. It contains public forecast data and the configured location, not personal data. There are no cookies, analytics, or accounts. If no usable cache exists, the page remains visible with an error state and retries automatically.

## Weather icons

The display bundles a curated, release-pinned subset of [Meteocons](https://github.com/basmilius/meteocons) as local SVG files. Fill, Flat, Outline, and Animated styles cover every mapped WMO condition without a CDN. Clear and partly cloudy conditions use distinct day/night artwork. When the browser requests reduced motion, the Animated selection automatically renders the static Fill artwork. See [Third-party notices](THIRD_PARTY_NOTICES.md) for the MIT license and attribution.

## Legacy Apps Script migration

Version 2 removes `Code.gs` and `appsscript.json`. Configuration, weather response mapping, caching, and retries now run in the browser. Existing Apps Script deployments can remain online while the static URL is tested, then be retired.

## License

[MIT](LICENSE). Bundled third-party assets retain their licenses as documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
