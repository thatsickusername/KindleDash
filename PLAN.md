# Project Implementation Plan: E-Ink Desktop Dashboard for Jailbroken Kindle 10th Gen

## 1. Executive Summary & Vision

### 1.1 Project Concept

A distraction-free, zero-cost, persistent desktop dashboard and tactile application launcher designed for a **jailbroken Amazon Kindle 10th Generation** running a dedicated Fullscreen Web Browser.

The application draws visual and interaction inspiration from **rekindle.ink** and **TRMNL (usetrml.com)**:

* Pure 1-bit high-contrast monochrome aesthetic (black and white).
* Tactile, retro-computing touch targets and editorial typography.
* Edge-to-edge hardware utilization with zero wasted bezel padding.
* Clean separation between a primary touch launcher and dedicated single-purpose full-screen applications.

---

## 2. Problem Statement & Root Cause Analysis

### 2.1 The Problem with Existing Solutions (e.g., `rekindle.ink`)

1. **Viewport & Scaling Failure:** `rekindle.ink` and similar e-ink dashboards were architected for large-format screens like the Kindle Scribe (10.2-inch, high DPI). On a 6-inch 10th Gen Kindle, this leaves massive unused margins around the application window, rendering fonts, icons, and buttons microscopically small and unusable from desk viewing distance.
2. **Browser Engine Constraints:** The Kindle WebKit browser has limited memory, weak CPU processing power, and slow e-ink refresh cycles. Heavy single-page client-side apps (SPAs) with continuous JavaScript polling, complex DOM trees, CSS animations, and alpha blending cause frame drops, memory exhaustion, browser crashes, and distracting ghosting artifacts.
3. **Overhead & Complexity:** Attempting to split the architecture into separate decoupled backend servers and frontend client bundles introduces CORS issues, sleeping free-tier containers (e.g., cold starts causing connection timeouts), and unneeded configuration.

---

## 3. The Solution Architecture

### 3.1 Core Principles

1. **Dumb Terminal, Smart Server:** The Kindle acts strictly as a dumb display and input surface. All complex state transformations, data fetching, and HTML structuring happen on the server.
2. **Single Monorepo, Single Free Host:** The entire system runs inside a single repository deployed on **Vercel** (Hobby Tier, 100% free forever). Routing and page generation use Node.js serverless functions and static HTML delivery, eliminating cross-origin issues and server sleeping delays.
3. **Zero-Margin Edge-to-Edge Fill:** The app takes advantage of the jailbroken browser's full viewport (`600x800` on Basic 10th Gen; `1072x1448` on Paperwhite 10th Gen) using absolute zero-padding resets and scalable CSS units (`rem` scaling locked to screen width).
4. **No Bento Overcrowding on Small Screens:** Rather than squeezing multiple tiny dashboard widgets into a crowded bento grid on a 6-inch screen, the core interface is a **High-Contrast Touch Launcher Grid** that navigates between dedicated, single-purpose **Full-Screen Apps**.
5. **E-Ink Refresh Hygiene:**
* Zero CSS transitions or keyframe animations globally.
* Pure black (`#000000`) and pure white (`#FFFFFF`) palette (avoiding intermediate grays that force panel dithering and ghosting).
* Dynamic screens update through server refreshes or minimal, once-per-minute DOM updates to eliminate constant flicker.



---

## 4. System & Route Topology

All routes are served from the same unified domain:

### Route Definitions

1. `GET /` — **The Launcher Grid**
* High-contrast 2x2 touch tile grid.
* Large vector icons with bold labels.
* Displays a minimal top meta-bar (Device title, current time).
* Tapping any tile performs a standard browser navigation to that app's route.


2. `GET /clock` — **Full-Screen Clock & Calendar**
* Massive desk-readable digital clock face.
* Day of week and full date strip.
* Persistent bottom action bar with `[ ◀ BACK ]` button linking to `/` and current screen indicator (`APP // CLOCK`).
* Updates time strictly once per minute via a micro-script to conserve battery and eliminate flicker.


3. `GET /weather` — **Full-Screen Weather & Environment**
* Large outdoor temperature reading, weather condition icon, and text description.
* Secondary metrics: Humidity, wind speed, and Air Quality Index (AQI).
* Data fetched server-side from a free, keyless weather service (e.g., Open-Meteo).
* Configured with periodic meta-refresh (every 15–30 minutes) to pull fresh data automatically.
* Persistent bottom action bar with `[ ◀ BACK ]` button.


4. `GET /todo` — **Full-Screen Daily Checklist**
* Focused high-contrast checklist (maximum 4–6 high-priority tasks for the day).
* Large square tap targets for checking/unchecking items.
* Clear completed-task strikethrough state.
* Persistent bottom action bar with `[ ◀ BACK ]` button.


5. `GET /news` — **Full-Screen Feed Reader**
* Clean, high-legibility serif typography for article headlines and summaries.
* Simple pagination controls (`[ ◀ ]` and `[ ▶ ]`) instead of vertical scrolling.
* Server-side parsing of standard RSS feeds.
* Persistent bottom action bar with `[ ◀ BACK ]` button.



---

## 5. UI/UX & Hardware Adaptation Rules for the Agent

When writing styles and markups, the coding agent must strictly adhere to these Kindle-specific requirements:

1. **Hardware Viewport Reset:**
* HTML documents must enforce `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`.
* Global stylesheet must set `margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden;`.
* Global disable rule: `*, *::before, *::after { transition: none !important; animation: none !important; }`.


2. **Responsive Root-Scale Engine:**
* Include a lightweight script on each page that calculates screen width and sets `document.documentElement.style.fontSize`.
* All spacing, fonts, icon sizes, and borders should be specified in `rem` so the UI scales uniformly whether rendered on the Basic 10th Gen (`600px` base) or the Paperwhite 10th Gen (`1072px` base).


3. **High-Contrast Elements:**
* Line borders: `2px` or `3px solid #000000`.
* Icons: Pure SVG inline tags, stroke `2.5px` or `3px`, `fill: none` or `fill: #000000`.
* Text contrast: `100%` pure black on pure white.
* Touch active feedback: Immediate background and text color inversion (`background: #000; color: #fff;`) without transition delays.


4. **Standard Full-Screen App Frame Layout:**
* **Content Zone (Top ~85%):** Centered, high-legibility display dedicated to the active tool.
* **Action Bar (Bottom ~15%):** Height `3.5rem` to `4rem`, separated by a `2px solid #000` or `3px solid #000` top border. Houses a tactile `[ ◀ BACK ]` button on the left and app status/title on the right.


5. **Anti-Ghosting Safeguard:**
* A global utility function or button that can trigger an inversion flash (screen turns black for ~400ms, then back to white) to reset Kindle e-ink pigment capsules and clear ghosted text.



---

## 6. Phased Implementation Roadmap

### Phase 1: Repository & Serverless Architecture Setup

* Initialize the Node.js project.
* Configure project structure for single-command local development and seamless zero-config Vercel deployment.
* Set up route handlers for the home launcher and individual app pages.

### Phase 2: Design Tokens & Base Shell Template

* Establish the base CSS reset and e-ink token system.
* Build the shared App Shell layout (Content area + Bottom Action Bar with Back navigation).
* Build and verify the root scaling mechanism for Kindle hardware resolutions.

### Phase 3: Launcher Grid Implementation (`/`)

* Build the 2x2 launcher grid with touch-friendly tiles.
* Integrate inline SVG icons for Clock, Weather, Todo, and News.
* Implement tactile `:active` tap states for immediate physical feedback on e-ink touchscreens.

### Phase 4: Core Applications Development

* **Clock Screen (`/clock`):** Implement the large-type display, date formatting, and once-per-minute ticker.
* **Weather Screen (`/weather`):** Implement server-side weather fetching (using Open-Meteo or equivalent keyless API), render the condition graphics, and set up auto-refresh meta tags.
* **Todo Screen (`/todo`):** Build the high-contrast checklist layout with large tap boxes and task completion states.
* **News Screen (`/news`):** Build the RSS feed parser on the backend and render paginated headline cards.

### Phase 5: Hardware Tuning & Edge-to-Edge Verification

* Test all views at exact Kindle 10th Gen resolutions (`600x800` and `1072x1448`).
* Verify zero overflow, zero accidental scrollbars, and readable font sizing from a 50cm viewing distance.
* Add the manual and timed e-ink de-ghosting refresh routine.

### Phase 6: Deployment & Kindle Setup

* Connect the repository to Vercel for continuous deployment.
* Verify production deployment URLs over public HTTPS.
* Load the live URL inside the Kindle 10th Gen Fullscreen Web Browser and confirm edge-to-edge rendering.

---

## 7. Future Extensibility (Post-MVP)

* **Web Dashboard Configurator:** A lightweight administrative interface or local configuration file (`config.json`) to toggle visible launcher apps, reorder tiles, or configure city locations and RSS feeds without code refactoring.
* **Smart Home Controls:** A dedicated full-screen app for toggling local smart lights or appliances via simple webhook/REST endpoints.