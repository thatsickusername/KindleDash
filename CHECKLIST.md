# Agent Execution Checklist: E-Ink SSR Dashboard (In-Memory MVP)

**Agent Instructions:** 
Execute the tasks below sequentially. Before marking a step complete (`[x]`), you MUST verify the "Acceptance Criteria" for that step. If a step fails the criteria, debug and fix it before moving to the next.

---

## Phase 1: Dummy Integration & Handshake

- [x] **Step 1.1: Serve a Dummy Image**
  - **Task:** Create or place a static PNG file named `test-dashboard.png` inside the `public` directory.
  - **Constraints:** Image should be black-and-white (or grayscale) and match standard Kindle aspect ratios (e.g., 600x800).
  - **Acceptance Criteria:** Visiting `http://localhost:<PORT>/test-dashboard.png` in a browser successfully displays the image.

- [x] **Step 1.2: Create the Kindle API Endpoint (`/api/display`)**
  - **Task:** Create a new API route `GET /api/display`.
  - **Task:** Make it return `{ "image_url": "https://<YOUR_VERCEL_DOMAIN>/test-dashboard.png", "refresh_rate": 900 }`.
  - **Acceptance Criteria:** Hitting the `/api/display` endpoint returns valid JSON with the exact keys required.

- [ ] **Phase 1 PAUSE:**
  - **Task:** Stop execution and notify the user to deploy to Vercel and test on the physical Kindle using the `Test Once` KUAL button.
  - **Condition:** Do NOT proceed to Phase 2 until the user explicitly confirms the dummy image rendered on their Kindle.

---

## Phase 2: Dynamic Image Pipeline & Admin Dashboard (In-Memory MVP)

- [ ] **Step 2.1: Establish In-Memory State**
  - **Task:** Create a global/shared variable (e.g., `globalConfig`) in the main server file to hold state: `{ active_view: 'clock', refresh_interval: 900 }`.
  - **Constraints:** Must be accessible and mutable by both the `/admin` API routes and the image rendering routes.
  - **Acceptance Criteria:** A quick `console.log(globalConfig)` inside any route correctly prints the default state.

- [ ] **Step 2.2: Build the Admin Dashboard (`/admin` and `POST /api/config`)**
  - **Task:** Create an HTML page served at `/admin` containing a `<form>`.
  - **Task:** Form must include radio buttons for `active_view` (Clock, Weather) and a number input for `refresh_interval`.
  - **Task:** Create `POST /api/config` to accept form data and update the `globalConfig` variable.
  - **Acceptance Criteria:** Submitting the form on `/admin` successfully changes the `globalConfig` values on the backend (verify via console logs or a test GET endpoint).

- [ ] **Step 2.3: Set Up the HTML-to-PNG Pipeline**
  - **Task:** Run `npm install satori @resvg/resvg-js`.
  - **Task:** Load a valid `.ttf` or `.otf` font file (e.g., Roboto or Bookerly) into a Buffer variable when the server starts.
  - **Constraints:** Satori requires the font buffer to render text.
  - **Acceptance Criteria:** The font buffer successfully loads into memory without throwing `ENOENT` (file not found) errors.

- [ ] **Step 2.4: Migrate Views to Satori Templates**
  - **Task:** Create JS functions that return layout objects for "Clock" and "Weather".
  - **Constraints:** 
    - You MUST use standard `display: flex` for all layouts. Satori does **not** support CSS Grid.
    - All dimensions must be hardcoded to match the physical Kindle screen (e.g., `width: 600`, `height: 800`).
    - Use strict `#000000` (black) and `#FFFFFF` (white) for colors.
  - **Acceptance Criteria:** The functions successfully return React-element-like objects or valid HTML strings parseable by Satori.

- [ ] **Step 2.5: Build the Dynamic Image Renderer (`GET /api/render-image`)**
  - **Task:** Create the endpoint `GET /api/render-image`.
  - **Task:** Logic pipeline: Read `globalConfig.active_view` -> Generate Layout -> Pass to Satori -> Pass to Resvg -> Output PNG buffer.
  - **Constraints:** Response must have header `Content-Type: image/png`.
  - **Acceptance Criteria:** Visiting `/api/render-image` in a desktop browser instantly downloads/displays a valid PNG image of the current `active_view`.

- [ ] **Step 2.6: Wire the Final Display API (`GET /api/display`)**
  - **Task:** Update the endpoint created in Step 1.2.
  - **Task:** Change `image_url` to point to the new dynamic route: `https://<YOUR_VERCEL_DOMAIN>/api/render-image`.
  - **Task:** Change `refresh_rate` to read dynamically from `globalConfig.refresh_interval`.
  - **Acceptance Criteria:** Hitting `/api/display` returns valid JSON reflecting the current in-memory state.

---

## Final System Verification

- [ ] **End-to-End Test 1:** Visit `/admin`, set the view to "Weather" and refresh interval to 1800.
- [ ] **End-to-End Test 2:** Hit `/api/display` and confirm it outputs `refresh_rate: 1800`.
- [ ] **End-to-End Test 3:** Hit `/api/render-image` and visually confirm a Weather PNG is generated instead of a Clock.
- [ ] **Handover:** Notify the user that the MVP is complete and ready for final deployment.
