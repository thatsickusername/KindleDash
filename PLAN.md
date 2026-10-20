# KindleDash 3.0: High-Contrast SmartWatch Faces & Dynamic Scheduler

## 1. Vision & Architecture Overview

KindleDash is an ultra-low-maintenance **Dumb Front-end Renderer** for Amazon Kindle (10th Gen Carta E-Ink display, 600x800). It operates as a continuous screen carousel where the user taps anywhere to cycle through screens.

```
+---------------------------------------------------------------------------------+
|                                Admin Web Portal (/admin)                        |
| - Screen Carousel Manager (Order, Enable/Disable, Edit)                         |
| - Dynamic Scheduling & Rules (e.g. Timezone, Weather coords, RSS feed)          |
| - Live 600x800 E-Ink Simulator & Device Telemetry Status                        |
+----------------------------------------+----------------------------------------+
                                         | Saves JSON Config
                                         v
+---------------------------------------------------------------------------------+
|                       Central Configuration & State API                         |
|   GET /api/config          - Returns full config & active screens               |
|   POST /api/config         - Saves updated configuration                        |
|   GET /api/active-screens  - Filters screens active right now                   |
|   GET /api/f1              - Cached Formula 1 schedule, results & standings     |
|   GET /api/battery         - Hardware telemetry storage & readout               |
+----------------------------------------+----------------------------------------+
                                         | Evaluated & rendered
                                         v
+---------------------------------------------------------------------------------+
|                        Kindle Device ("Dumb Renderer" at /)                     |
| - Single-view kiosk running on Kindle 10th Gen Carta E-Ink Display (600x800)    |
| - Tap / Swipe anywhere on screen to cycle to the next screen (5-15 taps / day)  |
| - Ultra-low power profile: passive display with scheduled nighttime deep idle   |
| - Screen 1: Dynamic Clock Face (Only ticks DOM when Clock is the active card)   |
| - Screen 2: Fullscreen Weather Face (Hero icon + Temperature + 2x3 metrics)     |
| - Screen 3: Dedicated Formula 1 Face (Always in carousel: Countdown + WDC)     |
| - Screen 4: Fullscreen World News Face                                          |
| - Fixed Bottom Bar: [Screen Name] (Left)   |   [Battery % + Icon] (Right)       |
| - Hardware anti-ghosting inversion: clean single black flash only on user tap   |
+----------------------------------------+----------------------------------------+
```

---

## 2. Screen Specifications

### 2.1 Screen 1: Dynamic Clock (`templates/clock.js`)
- **Normal Days**: Large, static centered clock with 170px hero numerals, calendar separator line, day of the week, and full date.
- **Qualifying Day**:
  - **Top Row (`1fr`)**: Digital Clock with 105px numerals, divider line, day, and date.
  - **Bottom Row (`1fr`)**: Grand Prix banner showing race name, location, `⏱️ QUALIFYING` session badge, and the **Qualifying Top 5 Positions with lap times / gaps** (e.g. `Q3: 1:31.373`).
- **Race Day**:
  - **Top Row (`1fr`)**: Digital Clock with 105px numerals, divider line, day, and date.
  - **Bottom Row (`1fr`)**: Grand Prix banner showing race name, location, `🏁 RACE DAY` session badge, and the **Race Top 5 Classification with race times / intervals / points**.

### 2.2 Screen 3: Dedicated F1 Screen (`templates/screens/f1.js`)
- **Always Visible**: Permanently present in the carousel rotation.
- **Top Container (`1fr`)**: Hero Grand Prix Card displaying upcoming race name, circuit, countdown (`X DAYS TO GO`, `RACE TOMORROW`, or `GRAND PRIX TODAY`), and timetable pills.
- **Bottom Container (`1fr`)**: Full World Drivers Championship (Top 5) table with positions, driver codes, names, constructors, and championship points.

---

## 3. Hyper-Optimization Battery Architecture (Passive Kiosk Profile)

### 3.1 Problem Root Cause Analysis
Under continuous browser execution, a Kindle normally drains 30–40% in ~12 hours because:
1. **Wi-Fi Radio Lock**: Background workers poll `/api/battery` every 60s, `shortcut_browser.sh` POSTs every 120s, and `/api/active-screens` polls every 5 minutes. Every network packet transitions the Wi-Fi transceiver to high-power mode (~150-250mA).
2. **CPU Wakeups & Layout Thrashing**: Even when viewing Weather, F1, or News, the hidden Clock ticker fires a JavaScript interval every 60s, triggering Chromium style recalculation and software Skia rasterization.
3. **Inefficient Anti-Ghosting**: Running periodic CSS-based color-swapping overlays (Black 350ms -> White 150ms) every 15 minutes causes 3 full-screen Skia redraws on a timer regardless of whether content changed.

### 3.2 Optimization Plan & Architectural Changes

#### Component 1: Wi-Fi & Network Request Squelching
- **Kill In-Browser Battery Poller**: Completely remove `setInterval(syncServerBattery, 60000)` in `templates/kiosk.js`. Battery status is passed directly via query params (`?batt=...`) on page load and pushed infrequently.
- **Calibrated Shell Battery Sync Interval**: Set `battery_sync_worker` push interval in `shortcut_browser.sh` to **1 hour (3600s)** during daytime (07:00–23:00) and **completely silent (no ping)** during night hours (23:00–07:00). At 16 transmissions/day totaling ~40s of radio time, this costs <0.2% battery/day while keeping telemetry accurate.
- **Scheduled Background Refresh**: Set `/api/active-screens` polling interval to **1 hour** during day hours, and disable it between 23:00 and 07:00.
- **Hourly Weather & News Cache**: Keep server-side caching warm; Kindle client only requests fresh data during scheduled carousel refreshes or user interaction.

#### Component 2: Clock, Carousel & Dedicated Night Screen Mode
- **Visibility-Aware Ticker**: Update `templates/clock.js` so that the 60-second minute ticker only executes DOM updates if and only if:
  1. The document is visible (`!document.hidden`).
  2. The Clock card is currently the **active** card (`.watch-face-card.active`).
- If the user is on the Weather, F1, or News screen, the clock ticker enters a frozen state (0 CPU cycles, 0 DOM recalculations). Upon cycling back to the Clock screen, it immediately resynchronizes.
- **Dedicated Night Sleep Mode (23:00 – 07:00)**:
  - During sleeping hours, KindleDash enters a dedicated full-screen Sleep view.
  - **No Clock / No Date / No Bottom Bar**: No stale timestamps or obsolete battery percentages are displayed.
  - **Full-Screen Good Night Aesthetic**: Displays clean, soothing text (*"Good night. Sleep well."*) accompanied by a minimalist geometric crescent moon and star vector art.
  - **Carousel & Tap Lock**: Screen cycling via tap or swipe is disabled during night mode.
  - **Zero CPU / Zero Network**: Completely static layout with zero intervals or background fetch requests. Automatically wakes and reloads the full daytime carousel at 07:00.

#### Component 3: E-Ink Anti-Ghosting Overhaul
- **Abolish 15-Minute Unconditional Flashes**: E-Ink does not suffer burn-in from static images; it only suffers from residual charge accumulation (ghosting) after high-contrast transitions. Remove the periodic 15-minute timer in `public/scaler.js`.
- **Ultra-Lean Inversion Flash on Carousel Switch**:
  - Reduce transition flash to a single, hyper-optimized 80–100ms black pulse directly on screen switch.
  - Skip flashing if the screen has not changed.

#### Component 4: Chromium & OS-Level Flag Tuning (`shortcut_browser.sh`)
- Enable 802.11 power saving mode on `wlan0` (`iwconfig wlan0 power on` or `wlarm_le` if supported).
- Launch `kindle_browser` with low-power flags:
  - `--disable-background-networking`
  - `--disable-sync`
  - `--disable-wake-on-wifi`
  - `--disable-extensions`
  - `--disable-component-update`
  - `--aggressive-cache-discard`
