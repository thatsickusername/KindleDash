function renderAdminPortal(globalConfig) {
  const activeView = globalConfig.active_view || 'clock';
  const refreshInterval = globalConfig.refresh_interval || 900;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KindleDash Admin // E-Ink SSR</title>
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
    .container { max-width: 900px; margin: 0 auto; }
    header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
    h1 { font-size: 26px; font-weight: 800; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
    .card-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .radio-group { display: flex; flex-direction: column; gap: 10px; }
    .radio-card { display: flex; align-items: center; padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.15s; }
    .radio-card:hover { border-color: #cbd5e1; }
    .radio-card input { margin-right: 12px; width: 18px; height: 18px; accent-color: #111827; }
    .radio-title { font-weight: 700; font-size: 15px; }
    .radio-desc { font-size: 12px; color: var(--text-muted); }
    input[type="number"] { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 15px; }
    .btn { display: inline-block; width: 100%; background: var(--primary); color: #fff; border: none; padding: 12px 18px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.15s; text-align: center; }
    .btn:hover { background: var(--primary-hover); }
    .notice { font-size: 12px; color: var(--text-muted); margin-top: 10px; line-height: 1.4; }
    .preview-box { display: flex; flex-direction: column; align-items: center; }
    .kindle-screen-mock { width: 270px; height: 360px; border: 10px solid #111; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.12); position: relative; }
    .kindle-screen-mock img { width: 100%; height: 100%; object-fit: contain; }
    .preview-links { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .preview-link { display: inline-block; text-align: center; font-size: 13px; color: var(--accent); text-decoration: none; font-weight: 600; padding: 6px; border: 1px solid var(--border); border-radius: 6px; }
    .preview-link:hover { background: #f8fafc; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>KindleDash Admin</h1>
      <div class="subtitle">E-Ink Server-Side Rendering (SSR) // In-Memory MVP</div>
    </header>

    <div class="grid">
      <!-- Control Form -->
      <div class="card">
        <div class="card-title">Display Settings</div>
        <form id="admin-form" method="POST" action="/api/config">
          <div class="form-group">
            <label class="form-label">Active View on Kindle</label>
            <div class="radio-group">
              <label class="radio-card">
                <input type="radio" name="active_view" value="clock" ${activeView === 'clock' ? 'checked' : ''}>
                <div>
                  <div class="radio-title">Clock Face</div>
                  <div class="radio-desc">Clean, large 150px digital time, day and full date banner.</div>
                </div>
              </label>

              <label class="radio-card">
                <input type="radio" name="active_view" value="weather" ${activeView === 'weather' ? 'checked' : ''}>
                <div>
                  <div class="radio-title">Weather Face</div>
                  <div class="radio-desc">Live temperature, high/low, and 2x2 conditions (humidity, wind, UV).</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="refresh_interval">Refresh Interval (Seconds)</label>
            <input type="number" id="refresh_interval" name="refresh_interval" min="60" max="86400" step="30" value="${refreshInterval}" required>
            <div class="notice">Standard recommended interval: 900 seconds (15 minutes). The Kindle wakes, refreshes, and deep sleeps.</div>
          </div>

          <button type="submit" class="btn">Save Configuration</button>
        </form>
      </div>

      <!-- Live Stream Preview -->
      <div class="card preview-box">
        <div class="card-title" style="width: 100%;">
          <span>Live Preview</span>
          <span class="badge" style="float: right;">SSR PNG</span>
        </div>
        <div class="kindle-screen-mock">
          <img id="screen-img" src="/api/render-image?t=${Date.now()}" alt="Kindle Display Preview">
        </div>
        <div class="preview-links">
          <a class="preview-link" href="/api/render-image" target="_blank">Open Raw PNG ↗</a>
          <a class="preview-link" href="/api/display" target="_blank">View /api/display JSON ↗</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = {
        active_view: formData.get('active_view'),
        refresh_interval: parseInt(formData.get('refresh_interval'), 10) || 900
      };

      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          // Refresh preview image
          const img = document.getElementById('screen-img');
          img.src = '/api/render-image?t=' + Date.now();
          alert('Configuration updated successfully!');
        } else {
          alert('Failed to update configuration.');
        }
      } catch (err) {
        alert('Network error while saving.');
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  renderAdminPortal
};
