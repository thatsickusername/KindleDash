# Implementation Plan: E-Ink Server-Side Rendering Architecture (TRMNL Clone) - No DB MVP

## 1. Architectural Overview & Context
This project is migrating from a client-side WebKit architecture (where the Kindle stays awake to render HTML/CSS via a browser) to a headless server-side rendering (SSR) architecture.

**The New Paradigm:**
1. The Kindle is now a "dumb" client running a shell script (`kindle-wall-display` / `trmnlcal`).
2. The Kindle wakes up from deep sleep, queries the backend for an image URL, downloads a PNG, paints it directly to the framebuffer using `FBInk`, and goes back to deep sleep.
3. The Vercel Node.js backend handles all data fetching, state management, and converts UI templates (HTML/CSS) into 1-bit or grayscale PNGs using `satori` and `resvg`.
4. **MVP State constraint:** No external databases are used. State is maintained in-memory within a monolithic API structure.

---

## Phase 1: Dummy Integration & End-to-End Handshake
**Goal:** Establish and verify the communication loop between the Vercel backend and the jailbroken Kindle before investing time in dynamic image generation.

### Step 1.1: Serve a Dummy Image
- Place a static test image (e.g., `test-dashboard.png`) in the `public` directory of the Vercel project. Ensure its dimensions match the target Kindle hardware (e.g., `600x800` or `1072x1448`).

### Step 1.2: Create the Kindle API Endpoint
- Create a new API route: `GET /api/display`.
- This route must return a strictly formatted JSON response that the Kindle shell script expects:
  ```json
  {
    "image_url": "https://<YOUR_VERCEL_DOMAIN>/test-dashboard.png",
    "refresh_rate": 900
  }
  ```
- *Agent Note:* Deploy this to Vercel immediately.

### Phase 1 Pause Checkpoint
At this point, development pauses. The user will manually install KUAL, transfer the `trmnlcal` script to their Kindle, point the `SERVER` variable to the Vercel URL, and trigger a "Test Once".
**Wait for the user to confirm that the static PNG successfully appeared on the Kindle screen before proceeding to Phase 2.**

---

## Phase 2: Dynamic Image Pipeline & Admin Dashboard (In-Memory MVP)

**Goal:** Convert the existing HTML/CSS screens (Clock, Weather, etc.) into server-side generated PNGs, controlled dynamically by a web-based admin dashboard using temporary in-memory state.

### Step 2.1: Establish In-Memory State (Monolithic API)
- *Agent Note:* Because we are not using a database, Vercel's serverless functions will lose state if routes are split into separate serverless instances. You MUST structure the backend as a single monolithic Express server (e.g., `api/index.js` handling all routes) or use a globally scoped variable in a shared module if using Next.js API routes.
- Define a global config object:
  ```javascript
  let globalConfig = {
    active_view: "clock", // Options: "clock", "weather"
    refresh_interval: 900
  };
  ```

### Step 2.2: Build the Admin Dashboard (`/admin`)
- Transform the existing `/admin` page into a functional HTML form.
- **UI Requirements:**
  - A form with Radio Buttons to select the `active_view` (e.g., Clock, Weather).
  - A dropdown or number input to set the `refresh_interval` in seconds.
  - A "Save Configuration" submit button.
- **Backend Wiring:** Create a `POST /api/config` route that accepts the form submission and updates the `globalConfig` variable in memory.

### Step 2.3: Set Up the HTML-to-PNG Generation Pipeline
- Install `satori` (HTML/CSS to SVG engine) and `@resvg/resvg-js` (SVG to PNG rasterizer) in the project.
- *Agent Note on Satori Constraints:* Satori relies on a strict subset of CSS. It requires `display: flex` for layout (Grid is not supported). Ensure local `.ttf` or `.otf` fonts are loaded as buffers into the Satori config. Use pure black (`#000000`) and pure white (`#FFFFFF`) for all elements to prevent dithering artifacts on the e-ink screen.

### Step 2.4: Migrate Existing Views to Satori Templates
- Refactor the existing standalone views (Clock, Weather) into JS functions that return Satori-compatible elements (JSX or React-element-like objects).
- Example signature: `generateWeatherLayout(weatherData) => SatoriElement`
- Ensure all layouts are hardcoded to the physical dimensions of the Kindle screen.

### Step 2.5: Build the Dynamic Image Renderer Route (`GET /api/render-image`)
- Create a new endpoint that serves the binary image data based on current state.
- **Logic:**
  1. Read `active_view` from the `globalConfig` variable.
  2. Fetch necessary API data (e.g., Open-Meteo for weather) if required by the active view.
  3. Pass the data to the corresponding layout function from Step 2.4.
  4. Pass the layout to `satori` to get an SVG string.
  5. Pass the SVG to `resvg` to convert it to a PNG buffer.
  6. Return the response with `Content-Type: image/png`.

### Step 2.6: Wire the Final Display API
- Update the `GET /api/display` route created in Phase 1.
- **Logic:**
  1. Read the current `refresh_interval` from `globalConfig`.
  2. Return the JSON payload pointing the Kindle to the dynamic renderer:
  ```json
  {
    "image_url": "https://<YOUR_VERCEL_DOMAIN>/api/render-image",
    "refresh_rate": <CURRENT_MEMORY_VALUE>
  }
  ```

---

## Final Acceptance Criteria for the Agent
1. **Admin Persistence (Temporary):** Changing a radio button on `/admin` successfully updates the in-memory variable (verifiable by immediately refreshing the Kindle or hitting the API).
2. **Dynamic Routing:** Hitting `/api/render-image` in a standard desktop browser generates and downloads a valid PNG matching the active view selected in the admin panel.
3. **Hardware Readiness:** Fonts are properly buffered and embedded in Satori, and CSS properties conform to Flexbox requirements to prevent Vercel rendering crashes.
