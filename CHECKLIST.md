# Agent Execution Checklist: KindleDash SSR Autonomous E-Ink Appliance

**Agent Instructions:** 
Execute the tasks below sequentially. Before marking a step complete (`[x]`), verify the specific Acceptance Criteria for that step. Debug and resolve any failures before moving forward.

---

## Phase 3.1: Complete Satori Template Suite (`services/satori-templates.js`)

- [x] **Step 3.1.1: Implement Formula 1 Satori Template (`generateF1Layout`)**
  - **Task:** Create `generateF1Layout(f1Data)` replicating `templates/screens/f1.js` (Top hero GP countdown & circuit card + Bottom WDC Top 5 standings table + bottom bar).
  - **Acceptance Criteria:** Successfully renders a 600x800 PNG via Resvg with status 200 and valid driver standings data.

- [x] **Step 3.1.2: Implement World News Satori Template (`generateNewsLayout`)**
  - **Task:** Create `generateNewsLayout(newsItems)` replicating `templates/news.js` (Header, editorial typography, 3-4 news items with timestamps, category tags + bottom bar).
  - **Acceptance Criteria:** Successfully renders a 600x800 PNG via Resvg with status 200 and live BBC news items.

- [x] **Step 3.1.3: Implement Night Sleep Satori Template (`generateSleepLayout`)**
  - **Task:** Create `generateSleepLayout()` replicating the night sleep aesthetic (Geometric crescent moon, starfield vector art, and "Good night. Sleep well." message).
  - **Acceptance Criteria:** Successfully renders a 600x800 PNG via Resvg with status 200 in high-contrast monochrome.

---

## Phase 3.2: In-Memory State & Backend Engine (`api/index.js`)

- [x] **Step 3.2.1: Expand Monolithic Global State**
  - **Task:** Add `carousel_enabled`, `night_mode_enabled`, `night_start`, `night_end`, `timezone`, and `carouselIndex` to `globalConfig`.
  - **Acceptance Criteria:** `GET /api/config` returns all new state properties with their default values.

- [x] **Step 3.2.2: Implement Carousel Rotation Engine**
  - **Task:** When `carousel_enabled === true`, automatically increment `carouselIndex` and cycle active views (`clock` -> `weather` -> `f1` -> `news`) upon image rendering.
  - **Acceptance Criteria:** Hitting `/api/render-image` repeatedly returns alternating screen layouts in sequence.

- [x] **Step 3.2.3: Implement Night Mode Evaluator & Long Sleep Calculation**
  - **Task:** Check current time against `[night_start, night_end]`. If active, render `generateSleepLayout()` and calculate seconds remaining until `night_end` for `/api/display`'s `refresh_rate`.
  - **Acceptance Criteria:** During configured night hours, `/api/display` returns the sleep image and calculated seconds until morning.

- [x] **Step 3.2.4: Implement Kindle Telemetry Endpoint (`POST /api/log`)**
  - **Task:** Handle `POST /api/log` and headers (`Battery-Percent`, `RSSI`, `ID`) sent by `calendar.sh`. Store latest battery % and last check-in timestamp in memory.
  - **Acceptance Criteria:** POSTing to `/api/log` updates `latestTelemetry` and returns 200 OK.

---

## Phase 3.3: Admin Dashboard Redesign (`templates/admin.js`)

- [x] **Step 3.3.1: Build Carousel Toggle & Conditional Pinned Radios**
  - **Task:** Add toggle switch for Auto-Cycle Carousel Mode. Wire JavaScript so turning carousel ON disables/dims the 4 view radios (Clock, Weather, F1, News); turning it OFF re-enables them.
  - **Acceptance Criteria:** Submitting the form with carousel enabled sets `carousel_enabled: true`; submitting with carousel disabled allows pinning any of the 4 views.

- [x] **Step 3.3.2: Build Discrete Refresh Interval Slider**
  - **Task:** Implement slider with 4 discrete stops: 15 min (900s), 30 min (1800s), 1 hour (3600s), 2 hours (7200s). Include dynamic label showing the selected time.
  - **Acceptance Criteria:** Moving the slider updates the value strictly to 900, 1800, 3600, or 7200, and is saved correctly to the backend.

- [x] **Step 3.3.3: Build Night Mode Schedule Controls**
  - **Task:** Add toggle switch for Night Mode plus time dropdowns for Start Time and End Time (e.g. 23:00 to 07:00).
  - **Acceptance Criteria:** Modifying night mode settings persists to `globalConfig` and takes immediate effect.

- [x] **Step 3.3.4: Add Multi-Screen Preview Tabs & Telemetry Widget**
  - **Task:** Add preview switcher tabs (Clock, Weather, F1, News, Sleep) and a live telemetry card showing Kindle Battery % and Signal RSSI from `/api/log`.
  - **Acceptance Criteria:** Clicking any preview tab renders that exact screen layout live in the preview mock.

---

## Phase 3.4: Kindle Script Hardening (`trmnl/bin/calendar.sh`)

- [x] **Step 3.4.1: Dynamically Scale Watchdog Timer (`WD_STALE`)**
  - **Task:** In `calendar.sh`, update `SERVED_INTERVAL` handler to dynamically scale `WD_STALE` so intervals of 1h or 2h do not trigger false-alarm watchdog reboots.
  - **Acceptance Criteria:** Verified `WD_STALE` calculation stays at least 2x the served interval plus safety grace.

- [x] **Step 3.4.2: Verify Production Deployment & Handshake**
  - **Task:** Commit and push all changes to GitHub/Vercel. Verify end-to-end functionality via automated suite.
  - **Acceptance Criteria:** All endpoints, preview modes, and configuration changes pass automated integration tests on the live deployment.
