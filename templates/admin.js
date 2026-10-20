function renderAdminPortal(config, batteryData, f1Data) {
  const screens = config.screens || [];
  const general = config.general || {};

  const screensRows = screens.map((s, idx) => `
    <tr class="screen-row" data-id="${s.id}">
      <td class="col-drag">
        <button type="button" class="btn-icon" onclick="moveScreen(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button type="button" class="btn-icon" onclick="moveScreen(${idx}, 1)" ${idx === screens.length - 1 ? 'disabled' : ''}>▼</button>
      </td>
      <td>
        <strong>${escapeHtml(s.title)}</strong>
        <div class="sub-id">${s.id} • ${s.type}</div>
      </td>
      <td>
        <span class="badge ${s.schedule?.type === 'always' ? 'badge-always' : 'badge-scheduled'}">
          ${s.schedule?.type === 'always' ? 'Always' : 'Scheduled'}
        </span>
        ${s.schedule?.f1QualiOrRaceOnly ? `<div class="sub-id">🏎️ Qualifying & Race Days Only</div>` : ''}
        ${s.schedule?.timeRange ? `<div class="sub-id">🕒 ${s.schedule.timeRange.start} - ${s.schedule.timeRange.end}</div>` : ''}
      </td>
      <td>
        <label class="switch">
          <input type="checkbox" onchange="toggleScreen('${s.id}', this.checked)" ${s.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </td>
      <td>
        <button type="button" class="btn btn-secondary btn-sm" onclick="editScreen('${s.id}')">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteScreen('${s.id}')" ${screens.length <= 1 ? 'disabled' : ''}>Delete</button>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KindleDash Admin</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #0f172a;
      --primary-hover: #1e293b;
      --accent: #2563eb;
      --danger: #ef4444;
      --radius: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px; }
    .admin-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 440px; gap: 24px; }
    
    header { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px solid var(--border); margin-bottom: 12px; }
    h1 { font-size: 24px; font-weight: 800; }
    .header-links a { color: var(--accent); text-decoration: none; font-weight: 600; margin-left: 16px; font-size: 14px; }

    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }
    .card-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 10px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 12px; text-transform: uppercase; }
    td { padding: 12px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .col-drag { width: 60px; }
    .sub-id { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    /* Buttons */
    .btn { background: var(--primary); color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn:hover { background: var(--primary-hover); }
    .btn-secondary { background: #f1f5f9; color: #334155; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { background: #fee2e2; color: var(--danger); }
    .btn-danger:hover { background: #fecaca; }
    .btn-sm { padding: 4px 8px; font-size: 12px; }
    .btn-icon { background: none; border: 1px solid var(--border); border-radius: 4px; padding: 2px 6px; cursor: pointer; }
    .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Badges */
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-always { background: #dcfce7; color: #166534; }
    .badge-scheduled { background: #e0f2fe; color: #0369a1; }

    /* Switch */
    .switch { position: relative; display: inline-block; width: 38px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .2s; border-radius: 20px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
    input:checked + .slider { background-color: #0f172a; }
    input:checked + .slider:before { transform: translateX(18px); }

    /* Forms */
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    input[type="text"], input[type="number"], select { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* Live Preview Simulator */
    .preview-column { position: sticky; top: 24px; }
    .kindle-frame { width: 360px; height: 480px; margin: 0 auto; border: 12px solid #111; border-radius: 20px; overflow: hidden; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
    .kindle-frame iframe { width: 600px; height: 800px; transform: scale(0.6); transform-origin: 0 0; border: none; }
    .preview-note { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 8px; }

    /* Telemetry status */
    .status-badge { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="admin-container">
    <header>
      <div>
        <h1>KindleDash Screen Carousel</h1>
        <p style="color: var(--text-muted); font-size: 14px;">Manage carousel screens, conditional schedules, and live Kindle feed</p>
      </div>
      <div class="header-links">
        <a href="/" target="_blank">Open Kindle View ↗</a>
      </div>
    </header>

    <!-- Main Configuration Column -->
    <div class="main-column">
      <!-- Screens Manager Card -->
      <div class="card">
        <div class="card-title">
          <span>Active Carousel Screens</span>
          <button type="button" class="btn btn-sm" onclick="openAddScreenModal()">+ Add Screen</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Screen</th>
              <th>Schedule</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${screensRows}
          </tbody>
        </table>
      </div>

      <!-- General Settings Card -->
      <div class="card">
        <div class="card-title">General Settings & Sources</div>
        <form id="general-form" onsubmit="saveGeneral(event)">
          <div class="form-row">
            <div class="form-group">
              <label>Timezone</label>
              <input type="text" id="cfg-tz" value="${escapeHtml(general.timezone || 'Asia/Kolkata')}">
            </div>
            <div class="form-group">
              <label>Weather Location City</label>
              <input type="text" id="cfg-city" value="${escapeHtml(general.city || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input type="number" step="0.0001" id="cfg-lat" value="${general.lat || ''}">
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input type="number" step="0.0001" id="cfg-lon" value="${general.lon || ''}">
            </div>
          </div>
          <div class="form-group">
            <label>RSS News Feed URL</label>
            <input type="text" id="cfg-rss" value="${escapeHtml(general.rssFeedUrl || '')}">
          </div>
          <button type="submit" class="btn">Save Preferences</button>
        </form>
      </div>
    </div>

    <!-- Live Preview & Hardware Telemetry Column -->
    <div class="preview-column">
      <!-- Device Telemetry Card -->
      <div class="card">
        <div class="card-title">Device Telemetry</div>
        <div class="status-badge">
          <span>Battery: <strong>${batteryData.level !== null ? batteryData.level + '%' : 'Offline'}</strong></span>
          ${batteryData.charging ? '<span>⚡ (Charging)</span>' : ''}
        </div>
        <div class="sub-id" style="margin-top: 6px;">Last ping: ${batteryData.updatedAt ? new Date(batteryData.updatedAt).toLocaleTimeString() : 'Never'}</div>
        <div class="sub-id" style="margin-top: 6px;">F1 Window: ${f1Data?.isQualiOrRaceDay ? '🟢 Active (' + (f1Data.currentPhase === 'race' ? 'Race Day' : 'Qualifying Day') + ')' : '⚪ Hidden (Next race in ' + (f1Data?.daysToRace || '--') + ' days)'}</div>
      </div>

      <!-- 600x800 Scaled Preview Frame -->
      <div class="card">
        <div class="card-title">Live Kindle Preview (600x800)</div>
        <div class="kindle-frame">
          <iframe id="preview-iframe" src="/"></iframe>
        </div>
        <p class="preview-note">Click anywhere inside the preview frame to cycle through screens!</p>
      </div>
    </div>
  </div>

  <script>
    let currentConfig = ${JSON.stringify(config)};

    async function saveConfigToServer(newConfig) {
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
        if (res.ok) {
          window.location.reload();
        } else {
          alert('Failed to save configuration');
        }
      } catch (err) {
        alert('Network error saving configuration');
      }
    }

    function toggleScreen(id, enabled) {
      const screen = currentConfig.screens.find(s => s.id === id);
      if (screen) {
        screen.enabled = enabled;
        saveConfigToServer(currentConfig);
      }
    }

    function moveScreen(fromIdx, dir) {
      const toIdx = fromIdx + dir;
      if (toIdx < 0 || toIdx >= currentConfig.screens.length) return;
      const temp = currentConfig.screens[fromIdx];
      currentConfig.screens[fromIdx] = currentConfig.screens[toIdx];
      currentConfig.screens[toIdx] = temp;
      saveConfigToServer(currentConfig);
    }

    function deleteScreen(id) {
      if (!confirm('Are you sure you want to remove this screen?')) return;
      currentConfig.screens = currentConfig.screens.filter(s => s.id !== id);
      saveConfigToServer(currentConfig);
    }

    function saveGeneral(e) {
      e.preventDefault();
      currentConfig.general = {
        ...currentConfig.general,
        timezone: document.getElementById('cfg-tz').value,
        city: document.getElementById('cfg-city').value,
        lat: parseFloat(document.getElementById('cfg-lat').value) || 0,
        lon: parseFloat(document.getElementById('cfg-lon').value) || 0,
        rssFeedUrl: document.getElementById('cfg-rss').value
      };
      saveConfigToServer(currentConfig);
    }

    function openAddScreenModal() {
      const type = prompt('Select Screen Type:\n1: Clock (type "clock")\n2: Weather (type "fullscreen-weather")\n3: Formula 1 (type "fullscreen-f1")\n4: News (type "fullscreen-news")', 'fullscreen-weather');
      if (!type) return;

      const title = prompt('Screen Title (displayed on bottom bar):', 'Weather');
      if (!title) return;

      const newScreen = {
        id: 'screen-' + Date.now(),
        title: title,
        type: type,
        enabled: true,
        schedule: {
          type: type === 'fullscreen-f1' ? 'scheduled' : 'always',
          f1QualiOrRaceOnly: type === 'fullscreen-f1'
        }
      };

      currentConfig.screens.push(newScreen);
      saveConfigToServer(currentConfig);
    }

    function editScreen(id) {
      const screen = currentConfig.screens.find(s => s.id === id);
      if (!screen) return;

      const newTitle = prompt('Edit Screen Title (shown on bottom bar):', screen.title);
      if (newTitle !== null) screen.title = newTitle;

      if (screen.type === 'fullscreen-f1') {
        const qualiOrRace = confirm('Show this screen ONLY during Qualifying and Race Days (1 day before & race day)?\\n(Click OK for Yes, Cancel for Always)');
        screen.schedule = {
          type: qualiOrRace ? 'scheduled' : 'always',
          f1QualiOrRaceOnly: qualiOrRace
        };
      } else {
        const isScheduled = confirm('Do you want this screen to follow a schedule? (Click OK for Scheduled, Cancel for Always Active)');
        if (isScheduled) {
          const timeRange = prompt('Enter 24h Time Range (e.g. 23:00-07:00 or leave blank):', screen.schedule?.timeRange ? screen.schedule.timeRange.start + '-' + screen.schedule.timeRange.end : '');
          let trObj = null;
          if (timeRange && timeRange.includes('-')) {
            const parts = timeRange.split('-');
            trObj = { start: parts[0].trim(), end: parts[1].trim() };
          }
          screen.schedule = {
            type: 'scheduled',
            timeRange: trObj,
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          };
        } else {
          screen.schedule = { type: 'always' };
        }
      }

      saveConfigToServer(currentConfig);
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  renderAdminPortal
};
