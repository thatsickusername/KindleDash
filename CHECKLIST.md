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

## Phase 6: Verification & USB Transfer Instructions
- [x] Cross-check shell scripts for POSIX/Bash syntax and execution permissions.
- [x] Prepare exact transfer guide for copying `kindle_payload/` to Kindle `/mnt/us/documents/`.
