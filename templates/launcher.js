const { renderHtmlShell } = require('./layout');

function renderLauncher() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const bodyContent = `
    <header class="meta-bar">
      <div>KINDLEDASH // 10TH GEN</div>
      <div id="meta-time">${timeStr} &bull; ${dateStr}</div>
    </header>

    <main class="launcher-grid" style="
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      width: 100%;
      height: calc(100vh - 3rem);
    ">
      <!-- Tile 1: Clock -->
      <a href="/clock" class="tactile-tile" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: var(--border-thick);
        border-bottom: var(--border-thick);
        padding: 1rem;
        cursor: pointer;
      ">
        <svg width="4rem" height="4rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span style="margin-top: 0.8rem; font-size: 1.25rem; font-weight: 900; letter-spacing: 0.05em;">CLOCK</span>
      </a>

      <!-- Tile 2: Weather -->
      <a href="/weather" class="tactile-tile" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-bottom: var(--border-thick);
        padding: 1rem;
        cursor: pointer;
      ">
        <svg width="4rem" height="4rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
        <span style="margin-top: 0.8rem; font-size: 1.25rem; font-weight: 900; letter-spacing: 0.05em;">WEATHER</span>
      </a>

      <!-- Tile 3: Todo -->
      <a href="/todo" class="tactile-tile" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: var(--border-thick);
        padding: 1rem;
        cursor: pointer;
      ">
        <svg width="4rem" height="4rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <span style="margin-top: 0.8rem; font-size: 1.25rem; font-weight: 900; letter-spacing: 0.05em;">TODOS</span>
      </a>

      <!-- Tile 4: News -->
      <a href="/news" class="tactile-tile" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        cursor: pointer;
      ">
        <svg width="4rem" height="4rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <line x1="10" y1="6" x2="18" y2="6"></line>
          <line x1="10" y1="10" x2="18" y2="10"></line>
          <line x1="10" y1="14" x2="14" y2="14"></line>
        </svg>
        <span style="margin-top: 0.8rem; font-size: 1.25rem; font-weight: 900; letter-spacing: 0.05em;">NEWS</span>
      </a>
    </main>
    <script>
      (function() {
        setInterval(function() {
          var d = new Date();
          var time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          var date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          var el = document.getElementById('meta-time');
          if (el) el.textContent = time + ' • ' + date;
        }, 60000);
      })();
    </script>
  `;

  return renderHtmlShell({
    title: 'KindleDash // Launcher',
    bodyContent,
    showActionBar: false
  });
}

module.exports = { renderLauncher };
