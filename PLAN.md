# Implementation Plan: KindleDash SSR Autonomous E-Ink Appliance (Full Product)

## 1. Vision & Architecture Overview
KindleDash is a fully headless, server-side rendered (SSR) E-Ink dashboard system modeled after TRMNL. The Amazon Kindle acts as a low-power "dumb client" that uses hardware RTC alarms to suspend kernel to RAM between refreshes, downloading and painting high-contrast 1-bit/grayscale PNG images directly to the framebuffer via `FBInk`.

```
+-------------------------------------------------------------------------+
|                        Admin Web Portal (/admin)                        |
| - Carousel Mode Switch (Auto-cycle through enabled screens on each wake)|
| - Pinned View Selector (Radio buttons: Clock, Weather, F1, News)        |
| - Discrete Refresh Interval Slider (15 min, 30 min, 1 hour, 2 hours)    |
| - Night Mode Schedule Toggle (Start Time & End Time with Sleep Screen)  |
| - Live 600x800 Scaled Simulator Frame with Screen Switching Tabs        |
| - Real-time Hardware Telemetry (Kindle Battery %, Signal RSSI)          |
+------------------------------------+------------------------------------+
                                     | POST /api/config
                                     v
+-------------------------------------------------------------------------+
|                  In-Memory State & Engine (`api/index.js`)              |
| - Carousel Rotator: Advances screen index on each Kindle wake cycle     |
| - Night Mode Evaluator: Serves Sleep Screen & calculates night sleep    |
| - Satori + Resvg Pipeline: Converts JSX layouts into 600x800 PNG buffers|
| - Telemetry Collector: POST /api/log stores Kindle battery & status     |
+------------------------------------+------------------------------------+
                                     | Evaluated PNG & Refresh Interval
                                     v
+-------------------------------------------------------------------------+
|               Kindle Hardware Client (`trmnl/bin/calendar.sh`)          |
| - Wakes from deep sleep via RTC alarm                                   |
| - Queries GET /api/display (sends Battery % and RSSI headers)           |
| - Downloads 600x800 PNG from GET /api/render-image                      |
| - Paints PNG directly to framebuffer using FBInk                        |
| - Turns off Wi-Fi (releases WLAN wakelocks)                             |
| - Arms RTC alarm for next interval (e.g. 15m, 30m, 1h, 2h, or morning)  |
| - Suspends Linux kernel to RAM (`echo mem > /sys/power/state`)          |
+-------------------------------------------------------------------------+
```

---

## 2. Component Specifications & Requirements

### 2.1 Complete Satori Template Suite (`services/satori-templates.js`)
All templates MUST conform strictly to Satori requirements:
- Root container: `width: 600px`, `height: 800px`, `display: flex`, `flexDirection: column`.
- Zero CSS Grid (Flexbox only).
- Strict 1-bit palette: `#000000` (black) / `#111111` (dark ink) and `#FFFFFF` (white canvas).
- Bundled offline fonts: `SpaceGrotesk` for numerals/headers, `Inter` for metadata.
- Reusable 85px Bottom Bar across all screens (`Back` label on left, `[SCREEN NAME]` on right).

**The 5 Templates:**
1. **Clock Face (`generateClockLayout`)**:
   - Standard: Space Grotesk 170px hero digits, divider line, weekday, full date.
   - Race-Weekend Split: Top half clock, bottom half live Top 5 classification and GP session badge.
2. **Weather Face (`generateWeatherLayout`)**:
   - 170px hero temperature, hero weather vector icon, condition label, 3-day forward forecast (left), and environmental metrics (precipitation, humidity, wind) (right).
3. **Formula 1 Face (`generateF1Layout`)**:
   - Replicates `templates/screens/f1.js`.
   - Top Container: Upcoming Grand Prix hero card with race name, country, countdown badge (*"X DAYS TO GO" / "RACE TOMORROW"*), circuit name, and timetable pills.
   - Bottom Container: Top 5 World Drivers' Championship table with positions, driver codes, team names, and points.
4. **World News Face (`generateNewsLayout`)**:
   - Replicates `templates/news.js`.
   - Headlines card with 3-4 news items from BBC RSS feed, timestamps, category badge, and clean editorial typography.
5. **Night Sleep Face (`generateSleepLayout`)**:
   - Clean inverted or high-contrast night graphic: geometric crescent moon & starfield vector art with soothing text (*"Good night. Sleep well."*). Completely static with zero timers.

### 2.2 In-Memory State & Engine (`api/index.js`)
Global config structure:
```javascript
let globalConfig = {
  carousel_enabled: false,           // boolean
  active_view: "clock",              // "clock" | "weather" | "f1" | "news"
  refresh_interval: 900,             // 900 (15m), 1800 (30m), 3600 (1h), 7200 (2h)
  night_mode_enabled: true,          // boolean
  night_start: "23:00",              // string "HH:MM"
  night_end: "07:00",                // string "HH:MM"
  timezone: "Asia/Kolkata"
};
```
- **Carousel Engine**: Maintains `carouselIndex`. When `carousel_enabled === true`, each completed cycle or display request steps through `['clock', 'weather', 'f1', 'news']`.
- **Night Mode Evaluator**:
  - Compares current time in the configured timezone against `night_start` and `night_end`.
  - When in night mode:
    - Serves `generateSleepLayout()`.
    - Automatically calculates remaining seconds until `night_end` (e.g. 28,800s for 8 hours) and returns this in `refresh_rate` so the Kindle remains in deep sleep until morning.
- **Kindle Telemetry Endpoint (`POST /api/log`)**:
  - Parses logs and headers sent by `calendar.sh` (`Battery-Percent`, `RSSI`, `ID`).
  - Stores `latestTelemetry = { battery, rssi, lastSeen }` in memory to display on `/admin`.

### 2.3 Admin Dashboard Redesign (`templates/admin.js`)
- **Carousel vs. Pinned View Control**:
  - Toggle Switch: **Auto-Cycle Carousel Mode**.
  - When Carousel is **OFF**: The 4 radio buttons (**Clock**, **Weather**, **Formula 1**, **World News**) are clickable.
  - When Carousel is **ON**: The radio buttons are visually disabled/grayed out, indicating the Kindle will cycle through all screens automatically.
- **Night Mode Control**:
  - Toggle Switch: **Enable Night Mode**.
  - Start Time & End Time dropdown selects (e.g. 21:00 to 09:00).
  - Explanatory note explaining that the Kindle will display a Sleep screen and deep sleep all night without waking.
- **Discrete Refresh Interval Slider**:
  - Slider with 4 snap points:
    - `0`: **15 Minutes** (900s)
    - `1`: **30 Minutes** (1800s)
    - `2`: **1 Hour** (3600s)
    - `3`: **2 Hours** (7200s)
  - Clear label showing the selected human-readable duration.
- **Telemetry Card**:
  - Displays real-time Kindle Battery %, Signal RSSI, and Last Check-in timestamp from `/api/log`.
- **Live Preview Frame with Screen Tabs**:
  - Preview frame with quick tabs (`Clock`, `Weather`, `F1`, `News`, `Sleep`) so the user can preview any generated PNG directly from the browser.

### 2.4 Kindle Shell Script Deep Sleep Hardening (`trmnl/bin/calendar.sh`)
- **Watchdog Dynamic Scaling**:
  - Currently `WD_STALE` is hardcoded to `1800` (30m). For 1-hour and 2-hour refresh intervals, the watchdog would trigger a false-alarm reboot.
  - Fix: Dynamically set `WD_STALE=$(( SERVED_INTERVAL * 2 + 600 ))` whenever a valid interval is received from the server, preventing premature watchdog wakeups during deep sleep.
- **Ensure Full Autonomous Operation**:
  - Script correctly invokes `takeover_begin` to halt userland framework (`initctl stop framework`), turns off Wi-Fi, programs RTC alarm, and executes `echo mem > /sys/power/state`.

---

## 3. Verification & Acceptance Criteria
1. **Template Accuracy**: All 4 dashboard views + Sleep view generate valid 600x800 PNG images with zero layout errors.
2. **Carousel Rotation**: When Carousel is toggled ON, sequential requests to `/api/render-image` cycle through Clock -> Weather -> F1 -> News.
3. **Pinned Selection**: When Carousel is toggled OFF, selecting any radio button pins that exact screen.
4. **Night Mode Deep Sleep**: During night hours, `/api/display` returns the Sleep screen URL and sets `refresh_rate` to the duration until morning.
5. **Slider Behavior**: The admin slider snaps only to 15m, 30m, 1h, and 2h.
6. **Watchdog Safety**: `calendar.sh` dynamically scales `WD_STALE` to match long refresh rates.
