# Weather Info Display

A backend-free weather dashboard designed for an unattended browser in kiosk mode. It uses the high-resolution DWD ICON forecast through Open-Meteo, ships as static files, and requires no API key.

Berlin-Adlershof is the included example location. You can change it without rebuilding the application.

## Features

- Current conditions and alternating hourly/daily forecast
- Automatic light/dark theme based on sunrise and sunset
- Responsive kiosk layout for tablets and desktop displays
- Cached last-known-good data when the network or API is unavailable
- Automatic refresh, timeout, and retry handling
- URL-based location configuration
- GitHub Pages deployment and pull-request quality checks
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
locale: "en-GB",
```

For one display, override the location in its kiosk URL:

```text
https://example.github.io/repository/?lat=53.5511&lon=9.9937&name=Hamburg&timezone=Europe/Berlin
```

Supported parameters are `lat`, `lon`, `name`, `timezone`, and `locale`. Invalid coordinates are ignored. Use an [IANA timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

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

## CI/CD and deployment

`quality.yml` runs linting, formatting checks, tests, and a live API smoke test on pushes and pull requests. `deploy-pages.yml` publishes the exact static files to GitHub Pages after quality checks pass on `main`.

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
npm run smoke
```

`npm run smoke` contacts the production weather API. The other checks run locally without network access.

## Privacy and resilience

The browser contacts only `api.open-meteo.com`. The latest successful response is stored in browser `localStorage` for up to 12 hours. It contains public forecast data and the configured location, not personal data. If no usable cache exists, the page remains visible with an error state and retries automatically.

## Legacy Apps Script migration

Version 2 removes `Code.gs` and `appsscript.json`. Configuration, weather response mapping, caching, and retries now run in the browser. Existing Apps Script deployments can remain online while the static URL is tested, then be retired.

## License

[MIT](LICENSE)
