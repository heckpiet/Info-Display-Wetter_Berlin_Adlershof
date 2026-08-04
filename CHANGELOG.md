# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [3.17.0] - 2026-08-04

### Added

- Add showSunTimes settings dropdown control to toggle visibility of sunrise and sunset times (Visible vs Hidden)

### Changed

- Remove legacy 1400px container width restriction from .wrap rule in styles.css
- Implement 100% full-width and full-height responsive layout expansion for widescreen, 1440p, 4K, and wall kiosk displays

### Added

- Relocate layoutStructure selector to Appearance & behavior settings tab
- Add 2 new layout structures: Magazine Editorial & Weather Story and Ambient Room Clock & Weather Strip (8 layout options total)
- Add custom background image engine supporting atmospheric presets, web image URLs, and local file uploads
- Add card opacity & glass transparency slider (10% to 100%)

### Fixed

- Add crash-safe fallback handling to formatDate for invalid locale or timezone edge cases
- Force Service Worker PWA cache eviction to immediately serve non-cached release modules on GitHub Pages

### Added

- Add 5 new layout structure modes inspired by user reference designs: Hero Header & Bottom Cards (Image 0), Smart Display Grid (Image 1), Split Columns, Compact Banner Bar, and Focused Hero Deck
- Add layout structure selector dropdown in display settings dialog
- Add full German and English localization for all 6 layout structure options

### Added

- Add updated v3.12.0 UI screenshots in docs/images/ reflecting the Glassmorphic layout and Custom Theme Builder
- Add automated official GitHub Release publishing workflow via gh release create
- Update workspace standards for strict visual documentation and mandatory release management

### Added

- Add interactive Custom Theme Builder with HTML5 color pickers for background, tile cards, text, accent, and badge chip colors
- Add 3 simple minimal & high-contrast themes: Minimal Dark, Minimal Light, and High Contrast
- Add complete documentation updates in README.md and docs/SETTINGS.md for the new custom theme builder and expanded color theme suite

### Added

- Add 5 selectable Color Themes in Display Settings: Sky Glass (Default), Cyberpunk Neon, Nordic Slate, Forest Aurora, and Sunset Coral
- Add full 5 Day Phase coverage (Morning, Noon, Afternoon, Evening, Night) for EVERY color theme
- Add Afternoon day phase detection and dropdown override selection
- Add German and English localization for all color themes and day phases

### Added

- Add modern Glassmorphism visual design system with `backdrop-filter: blur(16px)` and subtle card borders
- Add dynamic atmospheric HSL background gradients for Morning, Noon, Evening, and Night day phases
- Add tactile hover interactions and glowing accent shadows for kiosk controls and forecast cards

### Changed

- Adopt native privacy-friendly System-Font-Stack for zero-latency offline rendering without external font CDNs
- Enhance card padding, border-radius, and visual contrast across desktop, tablet, and mobile views

### Added

- Add local Meteocons Fill, Flat, Outline, and Animated SVG icon packs
- Add day/night-specific icons for clear, mostly clear, partly cloudy, rain-shower, and snow-shower conditions
- Add automatic static Fill fallback when the browser requests reduced motion
- Add complete offline pre-caching and automated WMO coverage checks for every bundled pack
- Add third-party asset attribution and MIT license notices

### Changed

- Replace the Unicode Color emoji, Monochrome, and Minimal packs with consistent SVG artwork
- Make Meteocons Fill the default icon style
- Refresh the documentation and screenshots for the new icon selector and default presentation

## [3.7.2] - 2026-08-04

### Changed

- Refresh every README screenshot from the current production interface at a consistent 1280×720 viewport
- Add separate Display and Appearance settings screenshots covering edge spacing and secondary-information controls
- Rewrite the project overview, feature summary, privacy notes, configuration guidance, and CI/CD description for the current application
- Update repository description and discovery topics for kiosk, wall-display, PWA, dashboard, and bilingual use cases
- Scope the cached GitHub release result to the installed application version so a new release checks immediately instead of showing an older cached version

## [3.7.1] - 2026-08-04

### Fixed

- Prevent mixed-release settings layouts by versioning every local asset and JavaScript module URL
- Version service-worker registration and offline pre-cache entries as one atomic release set
- Validate asset, module, application, package, and service-worker version alignment in CI

## [3.7.0] - 2026-08-04

### Added

- Add always-visible, inactivity-dimmed, inactivity-hidden, and important-only secondary-information modes
- Add a configurable 3–300 second inactivity delay
- Keep update, offline, cached-data, and error notices visible as important states

### Changed

- Treat provider, timezone, version, routine freshness, and year progress as secondary kiosk information

## [3.6.1] - 2026-08-04

### Fixed

- Preview year-progress labels immediately when their display mode changes
- Restore the saved year-progress presentation when the settings dialog is cancelled

## [3.6.0] - 2026-08-04

### Added

- Add a configurable 0–500 px outer display inset for kiosk bezels and overscan
- Add uniform and independent top, right, bottom, and left spacing modes
- Keep the settings control inside the configured visible display frame

## [3.5.0] - 2026-08-04

### Added

- Add complete German and English runtime localization with matching locale formatting
- Add color emoji, monochrome, and minimal offline weather icon packs
- Add validated language and icon-pack settings with export/import support

## [3.4.0] - 2026-08-04

### Changed

- Reorganize settings into Location & Data, Display, Appearance & Behavior, and Backup & Reset tabs
- Add WAI-ARIA tab semantics, roving focus, arrow/Home/End keyboard navigation, and responsive mobile panels

## [3.3.0] - 2026-08-04

### Added

- Add viewport-aware phone, tablet, desktop, and TV/kiosk display profiles
- Show detected viewport, pixel ratio, pointer, hover, offline-cache, and fullscreen capabilities
- Add manual device-profile, 75–150% display-scale, and 70–100% content-width controls

## [3.2.0] - 2026-08-04

### Added

- Add percentage, elapsed-day, combined, and hidden year-progress display options
- Calculate day-of-year totals with automatic Gregorian leap-year handling

## [3.1.0] - 2026-08-04

### Added

- Add detailed, essential, and distance-optimized glance information modes
- Add automatic or manual-only forecast rotation
- Increase kiosk touch targets and document the display hierarchy guidance

## [3.0.4] - 2026-08-04

### Fixed

- Force service-worker update checks to bypass HTTP caches and reload once when a new worker takes control

## [3.0.3] - 2026-08-04

### Added

- Show the running application version and the latest GitHub release on the display
- Cache GitHub release checks for six hours and highlight available updates

## [3.0.2] - 2026-08-04

### Documentation

- Add screenshots of the hourly kiosk view, daily forecast, and display settings to the project overview

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
