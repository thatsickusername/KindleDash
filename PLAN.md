# KindleDash 2.0: Fullscreen Hardware Integration & Kindle Safe-Lifecycle Plan

## 1. Problem Statement & Objectives
- **Zero Distraction / True Fullscreen**: KindleDash must render edge-to-edge on Kindle 10th Gen with zero browser chrome, URL inputs, or top bars (`GO_FULLSCREEN=true`).
- **Safe, Graceful Exit (No Hard Reboots)**: Fix the fatal `exit 0` bug in `shortcut_browser.sh` that bypassed browser shutdown and Kindle GUI restoration, corrupting the profile cache (`/mnt/us/system/browser/`).
- **Sleep Prevention (`powerd` / `lipc`)**: Keep the dashboard awake 24/7 as a persistent desk display without dropping into the Kindle lockscreen or screensaver.
- **E-Ink Hardware Longevity**: Protect the E-Ink Carta panel against burn-in, ghosting, and pigment charge-trapping during prolonged static display via periodic inversion flashes.
- **Pre-Launch Self-Healing**: Automatically clear stale singleton lockfiles (`SingletonLock`, `SingletonCookie`, `SingletonSocket`) before launch so corrupted profiles can never prevent subsequent runs.

---

## 2. Technical Architecture & Lifecycle

### 2.1 Pre-Launch Sanitation
1. Remove stale locks: `rm -f /mnt/us/system/browser/Singleton* /tmp/kindledash_exit`
2. Configure environment: set `XDG_CONFIG_HOME`, `LD_LIBRARY_PATH`.
3. Stop Amazon GUI: `/etc/init.d/framework stop` or `stop lab126_gui`.
4. Inhibit sleep:
   - `lipc-set-prop com.lab126.powerd prevent_screen_saver 1`
   - `lipc-set-prop -i com.lab126.powerd defer_suspend 1`

### 2.2 Browser Execution
- Launch `/usr/bin/chromium/bin/kindle_browser` with:
  - URL: `https://kindledashboard.vercel.app/`
  - Arguments: `--content-shell-hide-toolbar`, `--content-shell-host-window-cord=0,215`, `--enable-grayscale-mode`, `--no-sandbox`, `--single-process`, etc.

### 2.3 Event Loop & Power Watcher
- Read `/dev/input/event1` for physical power button press.
- Periodically check for software exit trigger (e.g., `/tmp/kindledash_exit` or `/mnt/us/system/browser/exit_flag`).
- Periodic E-Ink waveform refresh via `eips` to prevent charge retention.
- **Dynamic Battery State Syncer**: Lightweight background loop polling Kindle hardware power daemon (`lipc-get-prop com.lab126.powerd battLevel` and `isCharging`) every 120s, sending a tiny HTTPS POST request to `/api/battery` to keep dashboard status fresh without local HTTP servers, CORS, or mixed-content hurdles.

### 2.4 Graceful Exit & Restoration Routine
- Trap signals (`EXIT`, `INT`, `TERM`, `HUP`).
- Restore sleep settings:
  - `lipc-set-prop com.lab126.powerd prevent_screen_saver 0`
- Terminate browser process:
  - Send `SIGTERM` to allow profile lock release.
  - Grace period, then `kill -9` if necessary.
- Clean up lockfiles: `rm -f /mnt/us/system/browser/Singleton*`
- Restart Amazon GUI: `/etc/init.d/framework start` or `start lab126_gui`.
- Screen refresh: `eips -c` and user feedback message.

---

## 3. Directory & File Organization
All Kindle-bound scripts and assets will reside cleanly inside `kindle_payload/` for direct copy-paste to `/mnt/us/documents/`:
- `kindle_payload/shortcut_browser.sh`
- `kindle_payload/shortcut_stop.sh`
- `kindle_payload/shortcut_example.sh`
- `kindle_payload/shortcutbrowser/` (binaries, overlay, assets)
- `kindle_payload/shortcut_browser.sh.sdr/`

---

## 4. Live Battery Telemetry Architecture & Implementation Plan

### 4.1 System Overview
- **Zero Heavy Runtimes on Device**: No Python or Node.js running on the Kindle.
- **Micro Push Daemon**: Background subshell running on Kindle alongside `kindle_browser`. Wakes once every 120s, reads `lipc` or kernel `sysfs`, and makes a tiny curl POST to `/api/battery`.
- **In-Memory Battery Cache on Server**: Server endpoint `/api/battery`:
  - `POST /api/battery`: Stores `{ level: number, charging: boolean, updatedAt: timestamp }`.
  - `GET /api/battery`: Returns latest battery JSON state.
- **Frontend Live Poller & Cache**:
  - `templates/figma-layout.js` sets a 60s periodic fetch to `/api/battery`.
  - Automatically updates the bottom-bar battery pill (`bar-battery-wrap`, `bar-battery-fill`, `bar-battery-text`).
  - Persists latest known battery status in `localStorage`/`sessionStorage` so navigating between Clock, Weather, News, and Launcher immediately displays the level without blanking.
- **Process Lifecycle Cleanup**: The background sync loop PID is tracked in `shortcut_browser.sh` and terminated during `cleanup()` upon browser exit.

---

## 5. Acceptance Criteria
1. **Dynamic Battery Endpoint**: `/api/battery` accepts `POST` updates and returns current `GET` data with CORS and `Content-Type: application/json`.
2. **Persistence Across Page Navigations**: Switching between Clock, Weather, News, and Launcher maintains the battery reading without resetting to `--%` or hiding the element.
3. **No Mixed Content Warnings / Errors**: Communication uses standard HTTPS (`/api/battery`), completely eliminating Chromium mixed-content blocks.
4. **Low Resource Footprint on Kindle**:
   - Background loop sleeps for 120s between wakeups.
   - CPU usage is < 0.1%, with zero memory accumulation over 24/7 runtimes.
5. **Clean Exit**: Terminating the browser script (`shortcut_stop.sh` or EXIT trap) kills the battery loop PID and leaves zero zombie processes.
