const { renderAppShell } = require('./figma-layout');

function getLauncherTimeParts(date, timeZone = 'Asia/Kolkata') {
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = timeFormatter.formatToParts(date);
  const hours = parts.find(p => p.type === 'hour')?.value || '00';
  const minutes = parts.find(p => p.type === 'minute')?.value || '00';

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const dateStr = dateFormatter.format(date);

  return { timeStr: `${hours}:${minutes}`, dateStr };
}

function renderLauncher(reqQuery = {}) {
  const timeZone = reqQuery.tz || process.env.KINDLE_TIMEZONE || 'Asia/Kolkata';
  const serverNow = new Date();
  const serverEpoch = serverNow.getTime();
  const { timeStr, dateStr } = getLauncherTimeParts(serverNow, timeZone);

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
      <div id="meta-time" style="font-family: var(--font-main); font-size: 17px; font-weight: 500; color: var(--color-subtext);">
        ${timeStr} &bull; ${dateStr}
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
        var targetTimeZone = "${timeZone}";
        var serverInitEpoch = ${serverEpoch};
        var clientInitEpoch = Date.now();
        var clockOffset = serverInitEpoch - clientInitEpoch;

        var el = document.getElementById('meta-time');
        var timeFormatter = null;
        var dateFormatter = null;

        try {
          timeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: targetTimeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: targetTimeZone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
        } catch (e) {
          timeFormatter = null;
        }

        function updateMetaTime() {
          var nowEpoch = Date.now() + clockOffset;
          var d = new Date(nowEpoch);
          var h = '00';
          var m = '00';
          var dateStr = '';

          if (timeFormatter) {
            try {
              var parts = timeFormatter.formatToParts(d);
              for (var i = 0; i < parts.length; i++) {
                if (parts[i].type === 'hour') h = parts[i].value;
                if (parts[i].type === 'minute') m = parts[i].value;
              }
              dateStr = dateFormatter.format(d);
            } catch (err) {
              timeFormatter = null;
            }
          }

          if (!timeFormatter) {
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var ist = new Date(utc + (3600000 * 5.5));
            h = String(ist.getHours()).padStart ? String(ist.getHours()).padStart(2, '0') : (ist.getHours() < 10 ? '0' + ist.getHours() : '' + ist.getHours());
            m = String(ist.getMinutes()).padStart ? String(ist.getMinutes()).padStart(2, '0') : (ist.getMinutes() < 10 ? '0' + ist.getMinutes() : '' + ist.getMinutes());
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateStr = days[ist.getDay()] + ', ' + months[ist.getMonth()] + ' ' + ist.getDate();
          }

          if (el) {
            el.innerHTML = h + ':' + m + ' &bull; ' + dateStr;
          }
        }

        function scheduleNext() {
          var nowEpoch = Date.now() + clockOffset;
          var curSec = new Date(nowEpoch).getSeconds();
          var curMs = new Date(nowEpoch).getMilliseconds();
          var delay = (60 - curSec) * 1000 - curMs;
          if (delay <= 0) delay = 1000;

          setTimeout(function() {
            updateMetaTime();
            setInterval(updateMetaTime, 60000);
          }, delay);
        }

        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            updateMetaTime();
          }
        });

        updateMetaTime();
        scheduleNext();
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
