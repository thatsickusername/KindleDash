# KindleDash 3.0: Implementation Checklist

## Phase 1: Carousel & Screen Setup
- [x] Configure 4 core screens in carousel: Clock, Weather, Formula 1, World News.
- [x] Set Formula 1 screen to `always` visible so it remains in rotation 24/7.
- [x] Show upcoming race countdown, track, and timetable on dedicated F1 screen.
- [x] Show Top 5 World Drivers Championship standings on dedicated F1 screen.

## Phase 2: Dynamic Split Clock Screen
- [x] Add conditional rendering in [`templates/clock.js`](file:///C:/Users/manis/Development/kindleDash/templates/clock.js):
  - [x] **Standard Days**: Centered static clock with 170px hero numbers, divider, day, and date.
  - [x] **Qualifying & Race Days**: Automatically splits into a balanced 2-row grid (`grid-template-rows: 1fr 1fr`):
    - [x] Top Row: Clock & Date (`105px` numerals, day, full date).
    - [x] Bottom Row: Grand Prix name, city/country, session tag (`⏱️ QUALIFYING` or `🏁 RACE DAY`), and top 5 standings table.
  - [x] Minute-drift auto ticker preserved across both modes.

## Phase 3: Layout & Bottom Bar
- [x] Dedicated F1 and Weather screens use full-height 2-container layout filling entire 712px height above bottom bar.
- [x] Bottom bar displays active screen title on left (`Clock`, `Weather`, `Formula 1`, `World News`) and battery icon + percentage on right.

## Phase 4: Hyper-Optimization Battery Hardening

### 4.1 Client-Side Network Squelching (`templates/kiosk.js`)
- [x] **Remove 60-second in-browser battery poller**:
  - *Acceptance Criteria*: Eliminate `setInterval(syncServerBattery, 60000)` in `templates/kiosk.js`. Battery data is read on load via URL params (`?batt=...`) and localStorage. No recurrent client-side battery fetch requests exist.
- [x] **Set `/api/active-screens` schedule poller to 1 hour with quiet hours**:
  - *Acceptance Criteria*: Poller interval set to 1 hour (3,600,000ms). Between 23:00 and 07:00 local time, network requests are bypassed completely.

### 4.2 Active-Screen-Aware Clock Ticker & Dedicated Full-Screen Night Sleep Mode
- [x] **Gate Minute Ticker to Active Screen Only**:
  - *Acceptance Criteria*: In `templates/clock.js`, verify `updateTime()` checks if the parent card has `.active`. If the user is on Weather, F1, or News, DOM updates are skipped. When the user taps back to Clock, `updateTime()` fires immediately to ensure the exact minute displays instantly.
- [x] **Dedicated Full-Screen Sleep Mode (23:00 to 07:00)**:
  - *Acceptance Criteria*:
    - Renders as a dedicated full-screen 600x800 display (no time digits, no date string, no bottom bar, no battery percentage).
    - Features clean geometric crescent moon and stars artwork with soothing text (*"Good night. Sleep well."*).
    - Screen carousel cycling (tap/click/swipe) is completely locked/disabled during night mode.
    - Zero active timers running; static display with 0 CPU & 0 network consumption.
    - Automatically reloads and restores full interactive daytime carousel at 07:00.

### 4.3 Anti-Ghosting Hardware & Waveform Optimization (`public/scaler.js`, `templates/kiosk.js`)
- [x] **Eliminate 15-Minute Unconditional Flash Interval**:
  - *Acceptance Criteria*: Remove the recurring `scheduleNextFlash` / `setInterval(window.triggerAntiGhosting, 15 * 60 * 1000)` in `public/scaler.js`.
- [x] **Streamlined Tap-to-Switch Inversion**:
  - *Acceptance Criteria*: Replace multi-phase flash (350ms black + 150ms white) with a single, crisp 80ms black pulse in `triggerEinkFlash()`. Only fires when the user actually taps/swipes to cycle cards.

### 4.4 Kindle Shell Script & Power Management (`kindle_payload/shortcut_browser.sh`)
- [x] **Throttle Background Battery Sync Worker to 1 Hour**:
  - *Acceptance Criteria*: In `shortcut_browser.sh`, modify `battery_sync_worker` from `sleep 120` to:
    - 1 hour (3600s) during daytime (07:00 to 23:00).
    - Sleep continuously with 0 network calls during night hours (23:00 to 07:00).
- [x] **Chromium Low-Power Execution Flags**:
  - *Acceptance Criteria*: Update the `kindle_browser` launch line to include:
    - `--disable-background-networking`
    - `--disable-sync`
    - `--disable-wake-on-wifi`
    - `--disable-extensions`
    - `--disable-component-update`
    - `--aggressive-cache-discard`
- [x] **Wi-Fi Power Save Activation**:
  - *Acceptance Criteria*: Add `iwconfig wlan0 power on 2>/dev/null` or `lipc-set-prop com.lab126.wifid enablePowerSave 1` before launching the browser so the wireless chip uses 802.11 power-saving sleep between transmissions.
