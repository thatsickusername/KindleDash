const { renderAppShell } = require('./figma-layout');

function renderLauncher() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const bodyContent = `
    <!-- Top Meta Area (600x85px) -->
    <header style="
      position: absolute;
      top: 0;
      left: 0;
      width: 600px;
      height: 85px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 35px;
      box-sizing: border-box;
      border-bottom: 1px solid var(--color-bar-border);
    ">
      <div style="font-family: var(--font-main); font-size: 22px; font-weight: 700; color: var(--color-ink); letter-spacing: -0.5px;">
        KindleDash
      </div>
      <div id="meta-time" style="font-family: var(--font-main); font-size: 17px; font-weight: 500; color: var(--color-subtext); display: flex; align-items: center; gap: 14px;">
        <span>${timeStr} &bull; ${dateStr}</span>
        <button onclick="window.triggerKindleExit()" style="
          background: var(--color-bar-bg);
          border: 1px solid var(--color-bar-border);
          border-radius: 8px;
          padding: 6px 12px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-bar-text);
          cursor: pointer;
        " title="Exit to Kindle Home">&#10005; Exit</button>
      </div>
    </header>

    <!-- 2x2 Grid of Rounded Modern Cards (600x715px) -->
    <main style="
      position: absolute;
      top: 85px;
      left: 0;
      width: 600px;
      height: 715px;
      padding: 24px;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 18px;
    ">
      <!-- Tile 1: Clock -->
      <a href="/clock" class="dashboard-card" style="
        background: #ffffff;
        border: 1px solid var(--color-bar-border);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span style="font-family: var(--font-main); font-size: 22px; font-weight: 700; color: var(--color-ink); margin-top: 14px;">
          Clock
        </span>
      </a>

      <!-- Tile 2: Weather -->
      <a href="/weather" class="dashboard-card" style="
        background: #ffffff;
        border: 1px solid var(--color-bar-border);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <span style="font-family: var(--font-main); font-size: 22px; font-weight: 700; color: var(--color-ink); margin-top: 14px;">
          Weather
        </span>
      </a>

      <!-- Tile 3: Todos -->
      <a href="/todo" class="dashboard-card" style="
        background: #ffffff;
        border: 1px solid var(--color-bar-border);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <span style="font-family: var(--font-main); font-size: 22px; font-weight: 700; color: var(--color-ink); margin-top: 14px;">
          Todos
        </span>
      </a>

      <!-- Tile 4: News -->
      <a href="/news" class="dashboard-card" style="
        background: #ffffff;
        border: 1px solid var(--color-bar-border);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <line x1="10" y1="6" x2="18" y2="6"></line>
          <line x1="10" y1="10" x2="18" y2="10"></line>
          <line x1="10" y1="14" x2="14" y2="14"></line>
        </svg>
        <span style="font-family: var(--font-main); font-size: 22px; font-weight: 700; color: var(--color-ink); margin-top: 14px;">
          News
        </span>
      </a>
    </main>

    <script>
      (function() {
        setInterval(function() {
          var d = new Date();
          var h = String(d.getHours()).padStart(2, '0');
          var m = String(d.getMinutes()).padStart(2, '0');
          var date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          var el = document.getElementById('meta-time');
          if (el) el.textContent = h + ':' + m + ' • ' + date;
        }, 60000);
      })();
    </script>
  `;

  return renderAppShell({
    title: 'KindleDash // Launcher',
    bodyContent,
    showBottomBar: false
  });
}

module.exports = { renderLauncher };
