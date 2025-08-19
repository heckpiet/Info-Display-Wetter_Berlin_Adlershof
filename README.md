# Wetter-Info-Display (Google Apps Script)

Ein leichtgewichtiges Info-Display für iPad/Browser in **deutscher Umgebung** (Zeitzone Europe/Berlin, 24‑h‑Format, deutsche Texte). Das Frontend ist eine einzelne `index.html`. Das Backend (`Code.gs`) liefert Konfiguration, holt Wetterdaten von **Open‑Meteo (ICON‑D2/DWD)** und cached kurzzeitig zur Stabilisierung.

> **Kommentare im Code sind auf Englisch**, UI‑Texte/Formatierung sind **Deutsch**.

## Features
- „Aktuelles Wetter“ groß, 4 Prognose‑Kacheln (stunden-/tagesweise im Wechsel)
- Automatischer Dark‑Mode (nach Sonnenstand), Auto‑Reload & Retry
- Stabile Fallbacks (wenn einzelne Felder fehlen)
- Keine API‑Keys erforderlich (Open‑Meteo)
- Für iPad (Querformat) optimiert, skaliert aber bis Desktop

## Projektstruktur
```
/apps-script-weather-display
├─ Code.gs          # Server: doGet(), getWeatherData(), Config, Caching
├─ index.html       # Client: UI/Rendering/Flip/Reload
├─ appsscript.json  # Manifest (wird von GAS generiert, hier als Vorlage)
├─ LICENSE
├─ README.md
├─ .gitignore
├─ SECURITY.md
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
└─ CHANGELOG.md
```

## Schnellstart (ohne CLI)
1. **script.google.com** öffnen → Neues Projekt.
2. Datei **Code.gs** anlegen → Inhalt aus diesem Repo einfügen.
3. Datei **index** (HTML) anlegen → Inhalt aus `index.html` einfügen.
4. (Optional) Datei **appsscript.json** via „Projektmanifest“ übernehmen.
5. Im `Code.gs` die Konfiguration (`CFG`) prüfen/anpassen (Koordinaten, Name).
6. **Bereitstellen → Als Web‑App bereitstellen**  
   - Ausführen als: *Ich selbst*  
   - Zugriff: *Jeder, der den Link kennt* (oder restriktiver)
7. Web‑App‑URL im iPad (Querformat) öffnen → Zum Homescreen hinzufügen.

## Konfiguration
- `CFG.locale = "de-DE"`, `CFG.timezone = "Europe/Berlin"`
- Standort (Standard: **Berlin‑Adlershof**): `CFG.lat`, `CFG.lon`, `CFG.locationName`
- Auto‑Reload/Flip/Retry: `CFG.refreshIntervalMin`, `CFG.flipIntervalSec`, `CFG.retryOnFailureSec`

## Datenquelle
- Open‑Meteo ICON‑D2 (DWD) – stündlich/aktuell/täglich. Keine API‑Keys notwendig.
- `getWeatherData()` mappt:  
  - **current**: temp, wind, winddir, pressure, humidity, precip, weathercode, sunrise/sunset, time  
  - **hourly[]**: time, temp, wind, precip, weathercode  
  - **daily[]**: date, tmin, tmax, precipSum, weathercode, sunrise, sunset

## Lizenz
[MIT](LICENSE)

---

### FAQ
**Es lädt, aber zeigt Fehler?**  
Erster Abruf erfordert in Apps Script evtl. Berechtigungen (UrlFetchApp). Einmal bestätigen.  
**Kann ich die Koordinaten ändern?**  
Ja – `CFG.lat`/`CFG.lon` anpassen, `CFG.locationName` aktualisieren.  
**Darf ich Styles ändern?**  
Klar! Achte darauf, die Daten‑IDs (`data‑*`) in der HTML beizubehalten.