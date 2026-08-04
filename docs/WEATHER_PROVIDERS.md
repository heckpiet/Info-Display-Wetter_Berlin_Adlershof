# Weather provider integration

The display uses a provider abstraction while keeping **Open-Meteo DWD ICON** as the default. The default works directly from a static browser and requires no credential.

## Available profiles

| Configuration value | Source                          | Browser support | Credential                             | Status                        |
| ------------------- | ------------------------------- | --------------- | -------------------------------------- | ----------------------------- |
| `openMeteoDwd`      | Open-Meteo DWD ICON             | Direct          | None for normal non-commercial use     | Default and fully operational |
| `dwdOpenData`       | DWD Open Data                   | Proxy required  | None                                   | Prepared                      |
| `metNo`             | MET Norway Locationforecast 2.0 | Proxy required  | No key; identified User-Agent required | Prepared                      |
| `openWeather`       | OpenWeather One Call 3.0        | Proxy required  | API key and product subscription       | Prepared                      |

## Why the alternatives require a proxy

- DWD distributes native ICON forecast fields as compressed GRIB2 files. A service must download, parse, spatially select, and map those files.
- MET Norway requires a unique identifying `User-Agent`. Browser JavaScript cannot set that protected header reliably, and MET Norway documents browser CORS limitations.
- OpenWeather requires an API key. Any key embedded in `config.js`, source code, a URL, or browser storage is public and must be considered compromised.

The proxy is responsible for provider credentials, required headers, rate limiting, caching, upstream response mapping, and CORS policy. The static site never receives a provider secret.

## Selecting a prepared provider

In `config.js`:

```js
weatherProvider: "metNo",
providerProxyUrl: "https://weather-proxy.example.net/forecast",
```

The display calls the configured proxy with these query parameters:

```text
?provider=metNo
&latitude=52.4357
&longitude=13.5406
&timezone=Europe/Berlin
&forecastDays=7
```

Only set `providerProxyUrl` to infrastructure you control. The proxy should restrict allowed origins and validate all parameters.

## Deploying the bundled Cloudflare Worker

### Prerequisites

The proxy is optional. The default `openMeteoDwd` provider does not require it. To operate Package E, all common prerequisites and the requirements for at least one alternative provider must be satisfied.

#### Common requirements

- A Cloudflare account with permission to create and operate Workers.
- Node.js 24 or newer and npm on the administration workstation or CI runner.
- Wrangler CLI access through `npx wrangler` and an authenticated session (`npx wrangler login`) or a narrowly scoped Cloudflare API token in CI.
- A deployed HTTPS URL for the Worker.
- The exact public display origin for `ALLOWED_ORIGIN`, without a path or trailing slash. For the production GitHub Pages site this is `https://heckpiet.github.io`.
- Permission to edit `config.js` and redeploy the display after the Worker URL is known.
- Operational ownership for monitoring errors, quotas, upstream changes, cost, secret rotation, and incident response.
- Review and acceptance of the selected provider's current licence, attribution, retention, and commercial-use terms.

Do not deploy the proxy until the origin restriction and provider configuration have been reviewed. Never place secrets in `wrangler.toml`, GitHub Pages, repository variables intended for the browser, URLs, logs, or exported display settings.

#### Provider-specific requirements

| Provider      | Required account/secret                                                                                                          | Additional infrastructure                                                           | Ready after Worker deployment? |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| MET Norway    | No API key. A truthful `METNO_USER_AGENT` containing an application identifier and maintained contact URL or email is mandatory. | None                                                                                | Yes                            |
| OpenWeather   | OpenWeather account, activated One Call 3.0 product/subscription, and `OPENWEATHER_API_KEY` Worker secret.                       | Quota/cost monitoring                                                               | Yes                            |
| DWD Open Data | No DWD API key.                                                                                                                  | A continuously operated GRIB2 ingestion service exposed through `DWD_INGESTION_URL` | No, not without that service   |

The bundled Worker does not decode DWD GRIB2 files. `dwdOpenData` becomes operational only when a separate service downloads model runs, decodes GRIB2, selects the requested grid point, maps units/weather codes, handles incomplete model updates, and returns the canonical contract.

### Installation and authentication

The `proxy/` directory contains the production proxy entry point and adapter tests. Install Wrangler, authenticate with your Cloudflare account, review `wrangler.toml`, and deploy from that directory. Configure secrets without committing them:

```sh
npm ci
npm test
cd proxy
npx wrangler login
npx wrangler secret put OPENWEATHER_API_KEY
npx wrangler secret put DWD_INGESTION_URL
npx wrangler deploy
```

Only create the secrets required by enabled providers. `DWD_INGESTION_URL` is a configuration secret because internal service URLs can expose infrastructure details. For automated deployment, use a narrowly scoped Cloudflare API token stored as a protected CI secret; do not reuse an unrestricted personal token.

`METNO_USER_AGENT` must identify the application and provide a valid contact URL or address. Set `ALLOWED_ORIGIN` to the exact site origin. After deployment, set `providerProxyUrl` to the Worker URL and choose `metNo`, `openWeather`, or `dwdOpenData`.

The DWD profile deliberately expects a separate `DWD_INGESTION_URL`: native ICON GRIB2 acquisition, decoding, grid selection, and model-run lifecycle management are unsuitable for an edge request handler. The ingestion service must return the canonical contract below.

### Go-live checklist

1. Run `npm ci`, `npm test`, `npm run lint`, and `npm run format:check` from the repository root.
2. Set `ALLOWED_ORIGIN` and `METNO_USER_AGENT` in `proxy/wrangler.toml` to maintained production values.
3. Create only the required Worker secrets.
4. Deploy the Worker and record its HTTPS URL.
5. Test a provider directly while sending the production origin:

   ```sh
   curl -H "Origin: https://heckpiet.github.io" \
     "https://YOUR-WORKER.workers.dev/?provider=metNo&latitude=52.4357&longitude=13.5406&timezone=Europe%2FBerlin&forecastDays=7"
   ```

6. Confirm HTTP 200, the exact `Access-Control-Allow-Origin`, at least four hourly and four daily records, metric units, plausible timestamps, and no secrets in the response.
7. Test that an unapproved origin receives no CORS permission.
8. Set `providerProxyUrl` and `weatherProvider` in `config.js`, run the full site checks, and deploy through the normal pull-request workflow.
9. Verify the provider attribution, online refresh, cached fallback, rate-limit behavior, and recovery after an upstream failure.
10. Configure Cloudflare and provider quota/cost alerts plus a secret-rotation owner and schedule.

### Production limitations

- The Worker is stateless apart from Cloudflare edge caching; it is not a monitoring or ingestion platform.
- Availability still depends on Cloudflare and the selected upstream provider.
- The current cache duration is ten minutes. Provider rules and response headers must be reviewed before changing it.
- The display accepts one configured proxy URL. Multi-region failover and automatic cross-provider switching are not included.
- OpenWeather billing or quota exhaustion and MET Norway policy violations can stop that provider.
- DWD operation requires a separately monitored ingestion pipeline and storage strategy.
- A custom domain, access logs, alerting, dashboards, retention controls, and formal service-level objectives remain operator responsibilities.

## Canonical proxy response

Every proxy-backed provider must return the same provider-independent JSON shape. Numeric values use Celsius, millimetres, hectopascals, kilometres per hour, degrees, and WMO weather codes.

```json
{
  "fetchedAt": "2026-08-04T14:00:00Z",
  "timezone": "Europe/Berlin",
  "current": {
    "time": "2026-08-04T16:00",
    "temp": 24.3,
    "feelsLike": 24.8,
    "humidity": 55,
    "pressure": 1016,
    "precipitation": 0,
    "wind": 12,
    "windDirection": 245,
    "weatherCode": 2,
    "sunrise": "2026-08-04T05:30",
    "sunset": "2026-08-04T20:52"
  },
  "hourly": [
    {
      "time": "2026-08-04T17:00",
      "temp": 24,
      "precipitation": 0,
      "precipitationProbability": 5,
      "weatherCode": 2,
      "wind": 12,
      "windDirection": 245
    }
  ],
  "daily": [
    {
      "time": "2026-08-05",
      "tempMin": 15,
      "tempMax": 26,
      "precipitation": 0.4,
      "precipitationProbability": 20,
      "weatherCode": 2,
      "windGust": 30,
      "sunrise": "2026-08-05T05:32",
      "sunset": "2026-08-05T20:50"
    }
  ]
}
```

At least four hourly and four daily records are required. The display validates this contract before caching or rendering it.

## Source-specific implementation notes

### DWD Open Data

Use the DWD ICON-D2/ICON-EU GRIB2 files and map their native parameters to the canonical units and WMO weather codes. This gives maximum control but adds substantial ingestion and model-update complexity.

### MET Norway

Use `https://api.met.no/weatherapi/locationforecast/2.0/compact`. Send a unique application and contact identifier in the server-side `User-Agent`, cache responses according to the upstream headers, and map MET symbol codes to WMO codes.

### OpenWeather

Use One Call 3.0 with metric units. Store `appid` only in the proxy's secret store. Confirm the current product subscription, call limits, attribution, and licensing requirements before enabling it.

## Adding another provider

1. Add provider metadata to `WEATHER_PROVIDERS` in `providers.js`.
2. Implement mapping in the controlled proxy to the canonical schema.
3. Add contract and error tests.
4. Document authentication, attribution, units, update frequency, and licensing.
5. Change the default only after a measured forecast-quality and operational-reliability comparison.
