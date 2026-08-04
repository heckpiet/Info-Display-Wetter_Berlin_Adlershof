# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
