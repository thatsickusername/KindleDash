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
| - Tap / Swipe anywhere on screen to cycle to the next screen                    |
| - Screen 1: Dynamic Clock Face:                                                 |
|     * Standard Days: Static centered clock (170px hero numbers, date, day)      |
|     * Qualifying Day: Split 2-row grid (Top: Clock + Date;                      |
|                               Bottom: Grand Prix Name + Qualifying Top 5 Times) |
|     * Race Day: Split 2-row grid (Top: Clock + Date;                            |
|                               Bottom: Grand Prix Name + Race Top 5 Results)     |
| - Screen 2: Fullscreen Weather Face (Hero icon + Temperature + 2x3 metrics)     |
| - Screen 3: Dedicated Formula 1 Face (Always in carousel: Countdown + WDC)     |
| - Screen 4: Fullscreen World News Face                                          |
| - Fixed Bottom Bar: [Screen Name] (Left)   |   [Battery % + Icon] (Right)       |
| - Hardware anti-ghosting inversion flash on every screen cycle                  |
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
