# E-Ink Dashboard Implementation Checklist & Verification Gates

**Device Target:** Jailbroken Kindle 10th Gen (Basic: 600×800 / Paperwhite: 1072×1448)  
**Deployment Target:** Vercel (Hobby Tier, Monorepo, 100% Free)  
**Instructions for Agent:** Complete steps sequentially. Do not mark an item as checked until all associated **Verification Criteria** pass inspection.

---

## Phase 1: Environment & Server Architecture Setup

- [x] **1.1 Project Structure Initialization**
  - [x] Initialize Node.js project (`package.json`) with standard production dependencies.
  - [x] Set up directory structure separating server routing logic and client-facing assets/templates.
  - [x] Create `vercel.json` configuration for zero-friction serverless routing.
  - *Verification Criteria:*
    - Running local start command boots local development server without errors.
    - Project compiles without requiring external database or paid third-party infrastructure.

- [x] **1.2 Unified Route Registration**
  - [x] Register base launcher route: `GET /`
  - [x] Register full-screen application routes: `GET /clock`, `GET /weather`, `GET /todo`, `GET /news`
  - *Verification Criteria:*
    - Navigating directly to each route via browser returns an HTTP `200` response with basic HTML structure.

---

## Phase 2: Design System Core & Viewport Locking

- [x] **2.1 Strict Zero-Margin CSS Reset**
  - [x] Implement global resets removing `margin`, `padding`, and forcing `box-sizing: border-box`.
  - [x] Force global viewport lock: `width: 100vw; height: 100vh; overflow: hidden;`.
  - [x] Globally kill transitions and animations: `*, *::before, *::after { transition: none !important; animation: none !important; }`.
  - *Verification Criteria:*
    - In Chrome DevTools device mode (set to 600×800 and 1072×1448), no vertical or horizontal scrollbars appear under any condition.
    - Zero CSS transition lag or keyframe animations occur on touch/hover.

- [x] **2.2 E-Ink High-Contrast Design Tokens**
  - [x] Set up CSS variables for strict monochrome: `#000000` (ink) and `#FFFFFF` (canvas).
  - [x] Define standardized border tokens (`2px` and `3px` solid black).
  - [x] Implement instant color inversion on `:active` states (`background: #000; color: #fff;`).
  - *Verification Criteria:*
    - No RGB/HSL colors, soft grays, box-shadow blurs, or gradients are present.
    - Tapping interactive elements produces immediate inverted high-contrast feedback.

- [x] **2.3 Dynamic Resolution Scaler Script**
  - [x] Implement lightweight vanilla JS scaler adjusting `document.documentElement.style.fontSize` relative to hardware screen width.
  - [x] Anchor dimensions, padding, and icons to `rem` units.
  - *Verification Criteria:*
    - Page text and icon sizes scale up proportionally on Paperwhite (1072px width) compared to Basic (600px width), remaining readable from 50cm viewing distance.

---

## Phase 3: Launcher Grid (`GET /`)

- [x] **3.1 Header Meta-Bar**
  - [x] Implement top bar displaying system title and static/initial time display.
  - [x] Apply bottom border separation (`2px solid #000`).
  - *Verification Criteria:*
    - Height does not exceed `3rem`; remains pinned to screen top.

- [x] **3.2 2×2 Touch Tile Grid**
  - [x] Create grid layout dividing remaining screen real estate into 4 equal quadrants.
  - [x] Populate quadrants with tiles: Clock (`/clock`), Weather (`/weather`), Todos (`/todo`), News (`/news`).
  - [x] Add heavy inline SVGs (`stroke-width="2.5"` or `3px`) and bold text labels inside each tile.
  - *Verification Criteria:*
    - Every tile has an active touch hit area exceeding `100px × 100px`.
    - Clicking/tapping any quadrant immediately navigates to the respective route.

---

## Phase 4: Shared Full-Screen App Frame

- [x] **4.1 Standardized Bottom Action Bar**
  - [x] Build sticky bottom footer container (`height: ~3.5rem - 4rem`) with a `2px solid #000` or `3px solid #000` top border.
  - [x] Place tactile `[ ◀ BACK ]` button on the left edge linking to `/`.
  - [x] Place current app title indicator on the right edge (e.g., `APP // [NAME]`).
  - *Verification Criteria:*
    - Back button hit area is minimum `48px × 48px`.
    - Tapping Back returns directly to the launcher root (`/`) without page freeze.

---

## Phase 5: Individual Full-Screen Applications

- [x] **5.1 Clock & Calendar Screen (`GET /clock`)**
  - [x] Render large digital clock face using monospaced font sizing (`>3.5rem`).
  - [x] Render full date format (Day of week, Month, Day, Year).
  - [x] Implement once-per-minute (`60000ms`) micro-ticker updating only text content.
  - *Verification Criteria:*
    - Clock display renders on page load without waiting for initial timeout.
    - Time update performs surgical text replacement without full-page redraw or DOM reflow.

- [x] **5.2 Weather & Environment Screen (`GET /weather`)**
  - [x] Implement server-side data fetch using free Open-Meteo API (zero API key dependency).
  - [x] Render current temperature, weather condition icon (inline SVG), and high/low ranges.
  - [x] Add secondary metrics: humidity, wind speed, precipitation probability.
  - [x] Configure auto-refresh meta tag (`<meta http-equiv="refresh" content="900">`).
  - *Verification Criteria:*
    - Weather page renders server-populated data instantly without client-side network fetch delays.
    - View automatically refreshes every 15 minutes.

- [x] **5.3 Todo / Daily Checklist Screen (`GET /todo`)**
  - [x] Render high-contrast daily priority list (4–6 items max).
  - [x] Implement large square checkbox targets (`1.5rem × 1.5rem`).
  - [x] Toggle completed state with visual strike-through and solid black box fill.
  - *Verification Criteria:*
    - Tapping a task toggles completion state instantaneously without screen scrolling.

- [x] **5.4 News / RSS Reader Screen (`GET /news`)**
  - [x] Parse RSS feed server-side and format 3–4 concise news cards.
  - [x] Use readable editorial serif typography for headline cards.
  - [x] Implement client-side or server-side simple pagination buttons (`[ ◀ PREV ]` / `[ NEXT ▶ ]`) instead of scrolling.
  - *Verification Criteria:*
    - News items fit completely inside screen bounds without creating vertical page overflow.

---

## Phase 6: Hardware Maintenance & E-Ink Hygiene

- [x] **6.1 Anti-Ghosting Inversion Routine**
  - [x] Create de-ghosting utility function triggering a high-contrast inverted flash (`400ms` duration).
  - [x] Attach manual refresh button or trigger automatically on periodic intervals (e.g., every 30 minutes).
  - *Verification Criteria:*
    - Screen flashes fully black for 400ms and returns to white cleanly, resetting E-Ink microcapsules.

---

## Phase 7: Deployment & Real-Device Validation

- [ ] **7.1 Production Deployment**
  - [x] Commit repository to GitHub.
  - [ ] Deploy to Vercel free tier with automatic HTTPS certificate generation.
  - *Verification Criteria:*
    - Live URL loads over public HTTPS without CORS or security warnings.

- [ ] **7.2 Kindle Device Validation**
  - [ ] Open deployment URL inside Kindle Fullscreen Web Browser.
  - [ ] Verify zero outer margin gaps around the screen edges.
  - [ ] Verify legible text at 50cm desk viewing distance.
  - [ ] Verify all tactile tap interactions work reliably on the Kindle touchscreen.