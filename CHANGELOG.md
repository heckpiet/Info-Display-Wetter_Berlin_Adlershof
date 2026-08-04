# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [3.0.1] - 2026-08-04

### Documentation

- Define the complete Package E infrastructure, account, runtime, secret, provider, legal, and operational prerequisites
- Add secure installation steps, a production go-live checklist, limitations, and a proxy-local documentation entry point

## [3.0.0] - 2026-08-04

### Added

- Deployable Cloudflare Worker provider proxy with origin restriction and edge caching
- MET Norway and OpenWeather canonical response adapters
- Configurable DWD GRIB2 ingestion-service integration point
- Proxy contract tests and secure deployment documentation

## [2.5.0] - 2026-08-04

### Added

- Service-worker application shell and installable web-app manifest
- Exponential retry backoff capped at 15 minutes
- Offline and recovery operations documentation

## [2.4.0] - 2026-08-04

### Added

- Local settings overlay for location, refresh/cache intervals, themes, scale, density, and layout
- Local save/reset plus JSON export/import
- Configurable inactivity auto-hide for kiosk controls

## [2.3.0] - 2026-08-04

### Added

- Automatic morning, noon, evening, and night themes with manual overrides
- Font scaling, compact density, and kiosk layout configuration
- Manual forecast switch with a reduced-duration flip animation

## [2.2.0] - 2026-08-04

### Added

- Today's low/high, current gusts and UV index
- Full local date, numeric year progress, and visible online data age

## [2.1.0] - 2026-08-04

### Added

- Provider abstraction with Open-Meteo DWD ICON retained as the operational default
- Proxy-ready profiles for direct DWD Open Data, MET Norway Locationforecast, and OpenWeather One Call
- Canonical provider response validation and provider-specific cache separation
- Security and implementation documentation for alternative data sources

### Changed

- Display the active provider attribution dynamically
- Exercise the provider abstraction in the production API smoke test

## [2.0.1] - 2026-08-04

### Changed

- Use `de-DE` formatting for the Berlin-Adlershof default while keeping the interface language English
- Keep the document language independent from regional number and date formatting
- Ignore unsupported locale and timezone URL overrides instead of allowing rendering failures
- Add static-site validation and automated dependency update configuration

## [2.0.0] - 2026-08-04

### Added

- Backend-free static kiosk application
- URL and file-based location configuration
- Last-known-good browser cache and visible offline recovery
- Precipitation probability and wind-gust forecast fields
- Automated tests, linting, formatting, API smoke test, and GitHub Pages deployment
- English operations, security, contribution, and migration documentation

### Changed

- Kept Open-Meteo DWD ICON as the selected forecast source after a provider review
- Replaced Apps Script RPC and server cache with browser-native `fetch` and `localStorage`
- Updated the responsive layout and weather-code descriptions

### Removed

- Google Apps Script backend and manifest

## [1.0.0] - 2025-08-19

- Initial Google Apps Script weather display
