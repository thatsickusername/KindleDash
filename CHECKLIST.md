# KindleDash 2.0: Implementation Checklist

## Phase 1: Payload Organization & Directory Setup
- [x] Create standalone staging folder `kindle_payload/` for Kindle transfer.
- [x] Move all Kindle shortcut scripts, SDR folders, and binaries into `kindle_payload/`.
- [x] Add `kindle_payload/` to `.gitignore`.
- [x] Verify root directory remains clean and uncluttered.

## Phase 2: Script Lifecycle & Safe Exit Fixes
- [x] Implement self-healing pre-launch lock cleanup (`Singleton*` removal) in `shortcut_browser.sh`.
- [x] Fix the power button event loop bug (replace premature `exit 0` with loop break to cleanup block).
- [x] Implement robust `trap` handlers (`EXIT`, `INT`, `TERM`, `HUP`) to guarantee GUI restoration under all circumstances.
- [x] Implement phased browser termination (`SIGTERM` -> grace period -> `SIGKILL`).
- [x] Ensure `start_gui` and `refresh_screen` reliably execute upon exit.
- [x] Update `shortcut_stop.sh` with sleep restoration, lock cleanup, and graceful process termination.

## Phase 3: Sleep Prevention & Power Management
- [x] Add `lipc-set-prop com.lab126.powerd prevent_screen_saver 1` on browser startup.
- [x] Add `lipc-set-prop -i com.lab126.powerd defer_suspend 1` on browser startup.
- [x] Ensure sleep behavior is restored (`prevent_screen_saver 0`) immediately in the exit cleanup routine.

## Phase 4: E-Ink Panel Protection & Anti-Ghosting
- [x] Integrate background waveform refresh interval in the runner script loop.
- [x] Verify web anti-ghosting routine (`triggerAntiGhosting`) compatibility with prolonged display.

## Phase 5: Software Exit Option (Web-to-Shell)
- [x] Wire `/tmp/kindledash_exit` file trigger detection in `shortcut_browser.sh` loop.
- [ ] Add touch exit button on KindleDash UI (e.g., Home launcher / Action Bar).

## Phase 6: Dynamic Live Battery Telemetry
- [x] **Backend Battery Endpoint (`api/index.js`)**:
  - [x] Support `POST /api/battery` to record incoming `{ level, charging }` payload.
  - [x] Support `GET /api/battery` returning latest battery status JSON.
- [x] **Kindle Telemetry Pusher (`kindle_payload/shortcut_browser.sh`)**:
  - [x] Extract hardware battery stats via `lipc-get-prop com.lab126.powerd battLevel` and fallback to `/sys/class/power_supply/*/capacity`.
  - [x] Read charging state via `lipc-get-prop com.lab126.powerd isCharging`.
  - [x] Spawn 120s background curl loop posting status to `${FULLSCREEN_SITE}api/battery`.
  - [x] Track loop PID and terminate cleanly inside `cleanup()`.
- [x] **Client UI Poller & Persistence (`templates/figma-layout.js`)**:
  - [x] Fetch `/api/battery` on app shell load and at 60s intervals.
  - [x] Save latest battery state to `sessionStorage`/`localStorage` for immediate paint on page transitions.
  - [x] Ensure battery pill (`bar-battery-wrap`) correctly transitions from `display: none` to `display: flex` with accurate fill width and percentage/charging indicator.
- [x] **Verification & Validation**:
  - [x] Validate `/api/battery` locally with automated test requests.
  - [x] Confirm no mixed-content or CORS issues on HTTPS.
  - [x] Verify script syntax with bash check.

## Phase 7: Verification & USB Transfer Instructions
- [x] Cross-check shell scripts for POSIX/Bash syntax and execution permissions.
- [x] Prepare exact transfer guide for copying `kindle_payload/` to Kindle `/mnt/us/documents/`.
