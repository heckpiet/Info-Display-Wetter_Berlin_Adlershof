# Local settings

Open the gear button to adjust the kiosk locally. Settings are stored only in browser `localStorage` and override `config.js`; URL location parameters remain the final override. Reset removes the local override. Export/import transfers the allow-listed non-secret settings as JSON.

The dialog groups controls into four keyboard-accessible tabs:

- **Location & data:** location, coordinates, refresh interval, and cache duration
- **Display:** detected capabilities, device profile, layout, information density, and scaling
- **Appearance & behavior:** theme, forecast rotation, and year-progress presentation
- **Backup & reset:** JSON export/import and restoring defaults

Use `Left Arrow` and `Right Arrow` to move between tabs, or `Home` and `End` to jump to the first or last tab. The active tab and keyboard focus remain visibly distinct, following the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Never store API keys in settings. Provider credentials belong in the controlled proxy described in [WEATHER_PROVIDERS.md](WEATHER_PROVIDERS.md).

## Language and weather icons

Choose **Deutsch** or **English** under **Appearance & behavior**. The language changes the complete runtime interface, weather descriptions, status messages, accessibility labels, dates, times, and number formatting. Repository documentation and source code remain English.

Three dependency-free icon packs are included and work offline:

| Pack            | Example                                   | Character      |
| --------------- | ----------------------------------------- | -------------- |
| **Color emoji** | Familiar, colorful weather symbols        | ☀️ ⛅ 🌧️ ❄️ ⛈️ |
| **Monochrome**  | Quiet single-color symbols                | ☀︎ ◒ ☂ ❄ ϟ      |
| **Minimal**     | Geometric symbols for clean kiosk layouts | ○ ◑ ▥ ✳ ↯      |

Icon packs change presentation only; WMO weather-code mapping and text descriptions remain identical.

## Information modes

| Mode          | Best for                      | Visible information                                                                                                   |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Detailed**  | Desks and close viewing       | All current measurements, precipitation amounts, forecast probabilities, and technical version metadata               |
| **Essential** | Wall tablets and shared rooms | Core conditions plus feels-like temperature, humidity, wind, sunrise/sunset, and forecast probability                 |
| **Glance**    | TVs and distant kiosk viewing | Large temperature, condition, daily range, precipitation, forecast condition/probability, clock, and offline warnings |

The modes change information hierarchy without changing the underlying weather request. Font scale and density remain independent controls, so each profile can be tuned for the physical screen and viewing distance.

Set **Forecast rotation** to **Manual only** when changing content would make the display harder to follow. The forecast switch remains available as a large touch target.

## Year progress

The footer can show **Percentage and days**, **Percentage only**, **Days only**, or be **Hidden**. The combined default looks like `58.90% of year · Day 216 of 365`. Leap years are detected automatically and use 366 as the total.

## Display detection and manual overrides

With **Device profile** set to **Auto-detect**, the application classifies the current CSS viewport as phone, tablet, desktop, or large TV/kiosk and recalculates the layout whenever the browser window or screen orientation changes. It also detects coarse-pointer, hover, device-pixel-ratio, service-worker, and fullscreen capabilities. It does not use the user-agent string or collect a hardware fingerprint.

The settings dialog shows the detected viewport and capabilities. Override the automatic result with **Phone**, **Tablet**, **Desktop**, or **TV / kiosk** when the physical viewing situation differs from the viewport heuristic.

- **Display scale** applies a global 75–150% visual scale on top of the existing font scale.
- **Content width** limits the dashboard to 70–100% of the viewport.
- **Layout**, **Density**, **Information mode**, and **Font scale** remain independent controls.

Automatic detection uses standards-based [CSS media features](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries) and progressive [feature detection](https://web.dev/learn/pwa/foundations), avoiding unreliable browser-name assumptions.

The profiles follow practical accessibility principles: strong text contrast, scalable text, touch controls at least 44 CSS pixels in size, a reduced-motion fallback, and fewer competing elements in distance-viewing modes.

Reference guidance:

- [WCAG 2.2 contrast and text resizing](https://www.w3.org/TR/WCAG22/#distinguishable)
- [WCAG target size (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)
- [WCAG pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [GOV.UK responsive type scale](https://design-system.service.gov.uk/styles/type-scale/)
