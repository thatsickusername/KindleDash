function renderAdminPortal(globalConfig, telemetry = {}) {
  const carouselEnabled = globalConfig.carousel_enabled === true;
  const activeView = globalConfig.active_view || 'clock';
  const refreshInterval = globalConfig.refresh_interval || 300;
  const nightModeEnabled = globalConfig.night_mode_enabled !== false;
  const nightStart = globalConfig.night_start || '23:00';
  const nightEnd = globalConfig.night_end || '07:00';

  // Map interval to slider index: 300 -> 0, 900 -> 1, 1800 -> 2, 3600 -> 3, 7200 -> 4
  const intervalMap = [300, 900, 1800, 3600, 7200];
  let sliderIndex = intervalMap.indexOf(refreshInterval);
  if (sliderIndex === -1) sliderIndex = 0;

  // Time options for night mode (00:00 to 23:00)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => {
    const val = String(i).padStart(2, '0') + ':00';
    return `<option value="${val}">${val}</option>`;
  });

  const batteryPercent = telemetry.battery !== undefined && telemetry.battery !== null ? `${telemetry.battery}%` : 'Waiting for check-in';
  const rssiValue = telemetry.rssi ? `${telemetry.rssi} dBm` : 'N/A';
  const lastSeenStr = telemetry.lastSeen ? new Date(telemetry.lastSeen).toLocaleTimeString() : 'Never';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KindleDash Admin // E-Ink SSR Appliance</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --card: #ffffff;
      --text: #111827;
      --text-muted: #6b7280;
      --border: #e5e7eb;
      --primary: #111827;
      --primary-hover: #1f2937;
      --accent: #2563eb;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 32px 16px; }
    .container { max-width: 1040px; margin: 0 auto; }
    header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; }
    h1 { font-size: 26px; font-weight: 800; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); margin-bottom: 20px; }
    .card-title { font-size: 17px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 8px; }

    /* Switch & Toggle */
    .switch-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; }
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .2s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }

    /* Radios */
    .radio-group { display: flex; flex-direction: column; gap: 10px; transition: opacity 0.2s; }
    .radio-group.disabled { opacity: 0.45; pointer-events: none; }
    .radio-card { display: flex; align-items: center; padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.15s; }
    .radio-card:hover { border-color: #cbd5e1; }
    .radio-card input { margin-right: 12px; width: 18px; height: 18px; accent-color: #111827; }
    .radio-title { font-weight: 700; font-size: 14px; }
    .radio-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    /* Discrete Slider */
    .slider-container { padding: 8px 4px 16px 4px; }
    .step-slider { width: 100%; height: 8px; accent-color: var(--primary); cursor: pointer; }
    .slider-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .slider-labels span.active { color: var(--text); font-weight: 800; }
    .current-interval-badge { display: inline-block; font-size: 13px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; margin-left: 8px; }

    /* Selects */
    .time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; }
    select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-weight: 600; background: #fff; }

    .btn { display: inline-block; width: 100%; background: var(--primary); color: #fff; border: none; padding: 12px 18px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.15s; text-align: center; }
    .btn:hover { background: var(--primary-hover); }
    .notice { font-size: 12px; color: var(--text-muted); margin-top: 8px; line-height: 1.4; }

    /* Live Preview Tabs */
    .preview-box { display: flex; flex-direction: column; align-items: center; }
    .tab-bar { display: flex; width: 100%; gap: 4px; margin-bottom: 12px; background: #e2e8f0; padding: 4px; border-radius: 8px; }
    .tab-btn { flex: 1; padding: 6px 0; font-size: 11px; font-weight: 700; border: none; border-radius: 6px; background: transparent; cursor: pointer; text-align: center; color: var(--text-muted); }
    .tab-btn.active { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .kindle-screen-mock { width: 270px; height: 360px; border: 10px solid #111; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.12); position: relative; }
    .kindle-screen-mock img { width: 100%; height: 100%; object-fit: contain; }

    /* Telemetry Widget */
    .telemetry-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
    .tele-stat { background: #f8fafc; border: 1px solid var(--border); padding: 10px 12px; border-radius: 8px; }
    .tele-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .tele-val { font-size: 15px; font-weight: 800; margin-top: 2px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-live { background: #dcfce7; color: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>KindleDash Admin</h1>
        <div class="subtitle">Autonomous E-Ink Server-Side Rendering (SSR) Appliance</div>
      </div>
      <div>
        <span class="badge badge-live">● System Active</span>
      </div>
    </header>

    <div class="grid">
      <!-- Left Configuration Controls -->
      <div>
        <form id="admin-form">
          <!-- Card 1: Screen Mode Selection -->
          <div class="card">
            <div class="card-title">Screen Display Mode</div>

            <!-- Carousel Mode Switch -->
            <div class="switch-row">
              <div>
                <div style="font-weight: 700; font-size: 14px;">Auto-Cycle Carousel Mode</div>
                <div style="font-size: 12px; color: var(--text-muted);">Sequentially advances through Clock, Weather, F1, and News on each wake</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="carousel_toggle" name="carousel_enabled" ${carouselEnabled ? 'checked' : ''} onchange="toggleCarousel(this.checked)">
                <span class="slider"></span>
              </label>
            </div>

            <!-- Pinned Screen Options -->
            <div class="form-group">
              <label class="form-label" id="pinned-label">Pinned Screen <span style="font-size: 12px; font-weight: 400; color: var(--text-muted);">(Used when Carousel is OFF)</span></label>
              <div class="radio-group ${carouselEnabled ? 'disabled' : ''}" id="radio-group-container">
                <label class="radio-card">
                  <input type="radio" name="active_view" value="clock" ${activeView === 'clock' ? 'checked' : ''} ${carouselEnabled ? 'disabled' : ''}>
                  <div>
                    <div class="radio-title">Clock Face</div>
                    <div class="radio-desc">Space Grotesk 170px numerals with automatic F1 race-weekend split</div>
                  </div>
                </label>

                <label class="radio-card">
                  <input type="radio" name="active_view" value="weather" ${activeView === 'weather' ? 'checked' : ''} ${carouselEnabled ? 'disabled' : ''}>
                  <div>
                    <div class="radio-title">Weather Face</div>
                    <div class="radio-desc">Hero condition icon, 170px temperature, 3-day forecast, and environmental metrics</div>
                  </div>
                </label>

                <label class="radio-card">
                  <input type="radio" name="active_view" value="f1" ${activeView === 'f1' ? 'checked' : ''} ${carouselEnabled ? 'disabled' : ''}>
                  <div>
                    <div class="radio-title">Formula 1 Face</div>
                    <div class="radio-desc">Grand Prix countdown banner, circuit schedule, and Top 5 WDC championship table</div>
                  </div>
                </label>

                <label class="radio-card">
                  <input type="radio" name="active_view" value="news" ${activeView === 'news' ? 'checked' : ''} ${carouselEnabled ? 'disabled' : ''}>
                  <div>
                    <div class="radio-title">World News Face</div>
                    <div class="radio-desc">Curated headlines and editorial dispatches from BBC World RSS feed</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Card 2: Refresh Interval Slider -->
          <div class="card">
            <div class="card-title">
              <span>Refresh Wake Interval</span>
              <span class="current-interval-badge" id="interval-label">5 Minutes</span>
            </div>
            <div class="slider-container">
              <input type="range" class="step-slider" id="interval-slider" min="0" max="4" step="1" value="${sliderIndex}" oninput="updateIntervalUI(this.value)">
              <div class="slider-labels">
                <span id="lbl-0" class="${sliderIndex === 0 ? 'active' : ''}">5 min</span>
                <span id="lbl-1" class="${sliderIndex === 1 ? 'active' : ''}">15 min</span>
                <span id="lbl-2" class="${sliderIndex === 2 ? 'active' : ''}">30 min</span>
                <span id="lbl-3" class="${sliderIndex === 3 ? 'active' : ''}">1 hour</span>
                <span id="lbl-4" class="${sliderIndex === 4 ? 'active' : ''}">2 hours</span>
              </div>
            </div>
            <div class="notice">The Kindle stays in deep sleep (0 CPU / 0 Wi-Fi) between intervals, waking only to fetch and paint.</div>
          </div>

          <!-- Card 3: Night Mode Quiet Hours -->
          <div class="card">
            <div class="card-title">Night Sleep Mode (Quiet Hours)</div>
            <div class="switch-row">
              <div>
                <div style="font-weight: 700; font-size: 14px;">Enable Night Sleep Mode</div>
                <div style="font-size: 12px; color: var(--text-muted);">Displays soothing Sleep Screen and stays suspended all night until morning</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="night_toggle" name="night_mode_enabled" ${nightModeEnabled ? 'checked' : ''} onchange="toggleNight(this.checked)">
                <span class="slider"></span>
              </label>
            </div>

            <div id="night-settings" style="display: ${nightModeEnabled ? 'block' : 'none'};">
              <div class="time-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 13px;">Sleep Begins At</label>
                  <select id="night_start" name="night_start">
                    ${hoursOptions.map(opt => opt.replace(`value="${nightStart}"`, `value="${nightStart}" selected`)).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 13px;">Morning Wake At</label>
                  <select id="night_end" name="night_end">
                    ${hoursOptions.map(opt => opt.replace(`value="${nightEnd}"`, `value="${nightEnd}" selected`)).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn">Save Configuration</button>
        </form>
      </div>

      <!-- Right Column: Live Simulator & Telemetry -->
      <div>
        <!-- Live Preview Simulator -->
        <div class="card preview-box">
          <div class="card-title" style="width: 100%;">Live Simulator (600x800)</div>
          
          <!-- Screen Selector Tabs for Simulator -->
          <div class="tab-bar">
            <button type="button" class="tab-btn active" onclick="switchPreview('clock', this)">Clock</button>
            <button type="button" class="tab-btn" onclick="switchPreview('weather', this)">Weather</button>
            <button type="button" class="tab-btn" onclick="switchPreview('f1', this)">F1</button>
            <button type="button" class="tab-btn" onclick="switchPreview('news', this)">News</button>
            <button type="button" class="tab-btn" onclick="switchPreview('sleep', this)">Sleep</button>
          </div>

          <div class="kindle-screen-mock">
            <img id="screen-img" src="/api/render-image?view=${activeView}&t=${Date.now()}" alt="Kindle Screen">
          </div>
          <div class="notice" style="text-align: center; margin-top: 10px;">Exact 1-bit high-contrast preview as rendered on Kindle</div>
        </div>

        <!-- Hardware Telemetry Widget -->
        <div class="card">
          <div class="card-title">Kindle Telemetry</div>
          <div class="telemetry-row">
            <div class="tele-stat">
              <div class="tele-label">Battery Level</div>
              <div class="tele-val">${batteryPercent}</div>
            </div>
            <div class="tele-stat">
              <div class="tele-label">Wi-Fi Signal</div>
              <div class="tele-val">${rssiValue}</div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">Last seen: ${lastSeenStr}</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const INTERVAL_SECONDS = [300, 900, 1800, 3600, 7200];
    const INTERVAL_NAMES = ['5 Minutes', '15 Minutes', '30 Minutes', '1 Hour', '2 Hours'];

    function updateIntervalUI(val) {
      const idx = parseInt(val, 10);
      document.getElementById('interval-label').innerText = INTERVAL_NAMES[idx];
      for (let i = 0; i <= 4; i++) {
        const el = document.getElementById('lbl-' + i);
        if (i === idx) el.classList.add('active');
        else el.classList.remove('active');
      }
    }
    updateIntervalUI(${sliderIndex});

    function toggleCarousel(checked) {
      const group = document.getElementById('radio-group-container');
      const inputs = group.querySelectorAll('input[type="radio"]');
      if (checked) {
        group.classList.add('disabled');
        inputs.forEach(i => i.disabled = true);
      } else {
        group.classList.remove('disabled');
        inputs.forEach(i => i.disabled = false);
      }
    }

    function toggleNight(checked) {
      document.getElementById('night-settings').style.display = checked ? 'block' : 'none';
    }

    let currentPreviewView = '${activeView}';
    function switchPreview(view, btn) {
      currentPreviewView = view;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const img = document.getElementById('screen-img');
      img.src = '/api/render-image?view=' + view + '&t=' + Date.now();
    }

    document.getElementById('admin-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);

      const sliderVal = parseInt(document.getElementById('interval-slider').value, 10);
      const data = {
        carousel_enabled: document.getElementById('carousel_toggle').checked,
        active_view: formData.get('active_view') || '${activeView}',
        refresh_interval: INTERVAL_SECONDS[sliderVal],
        night_mode_enabled: document.getElementById('night_toggle').checked,
        night_start: document.getElementById('night_start').value,
        night_end: document.getElementById('night_end').value
      };

      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          alert('Configuration saved successfully!');
          const img = document.getElementById('screen-img');
          img.src = '/api/render-image?view=' + currentPreviewView + '&t=' + Date.now();
        } else {
          alert('Failed to save configuration.');
        }
      } catch (err) {
        alert('Network error saving configuration.');
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  renderAdminPortal
};
