# Local settings

Open the gear button to adjust the kiosk locally. Settings are stored only in browser `localStorage` and override `config.js`; URL location parameters remain the final override. Reset removes the local override. Export/import transfers the allow-listed non-secret settings as JSON.

Never store API keys in settings. Provider credentials belong in the controlled proxy described in [WEATHER_PROVIDERS.md](WEATHER_PROVIDERS.md).
