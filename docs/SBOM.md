# Software Bill of Materials (SBOM / BOM)

This document lists all direct, transitive, development, asset, and data dependencies for **Info-Display-Wetter_Berlin_Adlershof** in accordance with Section 10 of the General Development & Coding Guidelines.

---

## 📦 Component Inventory

### 1. Application Core & Runtime

- **Application Name:** `info-display-weather-berlin-adlershof`
- **Version:** `3.23.0`
- **License:** MIT
- **Architecture:** Pure Frontend ES Modules (Backend-free, client-side PWA)

### 2. External Data Providers & APIs

| Name                       | Provider / Publisher                      | License / Terms       | Description                        |
| :------------------------- | :---------------------------------------- | :-------------------- | :--------------------------------- |
| **Open-Meteo DWD API**     | Deutscher Wetterdienst (DWD) / Open-Meteo | Open Data / CC BY 4.0 | High-resolution ICON forecast data |
| **MET Norway Weather API** | Norwegian Meteorological Institute        | Open Data / CC BY 4.0 | Fallback weather data provider     |
| **OpenWeatherMap API**     | OpenWeather Ltd.                          | Open Data / ODbL      | Optional weather provider proxy    |

### 3. Bundled Assets & Media

| Asset Family             | Author / Creator | License     | Description                                           |
| :----------------------- | :--------------- | :---------- | :---------------------------------------------------- |
| **Meteocons Icon Suite** | Bas Milius       | MIT License | Weather icon vectors (Fill, Flat, Line, Animated SVG) |

### 4. Development & Build Tooling

| Package Name | Version  | License | Scope       | Purpose                             |
| :----------- | :------- | :------ | :---------- | :---------------------------------- |
| `eslint`     | `10.8.0` | MIT     | Development | Static JavaScript linting           |
| `@eslint/js` | `10.0.1` | MIT     | Development | Official ESLint rules configuration |
| `prettier`   | `3.8.1`  | MIT     | Development | Code formatting enforcement         |

---

## 🔒 Security Audit & Vulnerability Checks

- All dependencies are audited during continuous integration via `npm audit`.
- Zero runtime npm dependencies are loaded on client browsers, ensuring a minimal attack surface.
