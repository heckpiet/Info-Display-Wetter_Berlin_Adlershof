# Local settings

Open the gear button to adjust the kiosk locally. Settings are stored only in browser `localStorage` and override `config.js`; URL location parameters remain the final override. Reset removes the local override. Export/import transfers the allow-listed non-secret settings as JSON.

Never store API keys in settings. Provider credentials belong in the controlled proxy described in [WEATHER_PROVIDERS.md](WEATHER_PROVIDERS.md).

## Information modes

| Mode          | Best for                      | Visible information                                                                                                   |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Detailed**  | Desks and close viewing       | All current measurements, precipitation amounts, forecast probabilities, and technical version metadata               |
| **Essential** | Wall tablets and shared rooms | Core conditions plus feels-like temperature, humidity, wind, sunrise/sunset, and forecast probability                 |
| **Glance**    | TVs and distant kiosk viewing | Large temperature, condition, daily range, precipitation, forecast condition/probability, clock, and offline warnings |

The modes change information hierarchy without changing the underlying weather request. Font scale and density remain independent controls, so each profile can be tuned for the physical screen and viewing distance.

Set **Forecast rotation** to **Manual only** when changing content would make the display harder to follow. The forecast switch remains available as a large touch target.

The profiles follow practical accessibility principles: strong text contrast, scalable text, touch controls at least 44 CSS pixels in size, a reduced-motion fallback, and fewer competing elements in distance-viewing modes.

Reference guidance:

- [WCAG 2.2 contrast and text resizing](https://www.w3.org/TR/WCAG22/#distinguishable)
- [WCAG target size (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)
- [WCAG pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [GOV.UK responsive type scale](https://design-system.service.gov.uk/styles/type-scale/)
