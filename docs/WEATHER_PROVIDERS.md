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

The `proxy/` directory contains the production proxy entry point and adapter tests. Install Wrangler, authenticate with your Cloudflare account, review `wrangler.toml`, and deploy from that directory. Configure secrets without committing them:

```sh
npx wrangler secret put OPENWEATHER_API_KEY
npx wrangler secret put DWD_INGESTION_URL
npx wrangler deploy
```

`METNO_USER_AGENT` must identify the application and provide a valid contact URL or address. Set `ALLOWED_ORIGIN` to the exact site origin. After deployment, set `providerProxyUrl` to the Worker URL and choose `metNo`, `openWeather`, or `dwdOpenData`.

The DWD profile deliberately expects a separate `DWD_INGESTION_URL`: native ICON GRIB2 acquisition, decoding, grid selection, and model-run lifecycle management are unsuitable for an edge request handler. The ingestion service must return the canonical contract below.

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
