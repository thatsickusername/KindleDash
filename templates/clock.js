const { renderHtmlShell } = require('./layout');

function renderClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const bodyContent = `
    <header class="meta-bar">
      <div>CLOCK // DESK DISPLAY</div>
      <div>STANDBY</div>
    </header>

    <main class="content-zone" style="text-align: center; justify-content: center; gap: 1.5rem;">
      <div id="clock-display" style="
        font-family: var(--font-mono);
        font-size: 6.8rem;
        font-weight: 900;
        letter-spacing: -0.04em;
        line-height: 1;
        padding: 0.5rem 1.5rem;
        border: var(--border-thick);
        display: inline-block;
      ">${hours}:${minutes}</div>

      <div style="display: flex; flex-direction: column; gap: 0.35rem;">
        <div id="clock-day" style="font-size: 2.2rem; font-weight: 900; letter-spacing: 0.08em;">
          ${dayName}
        </div>
        <div id="clock-date" style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.05em;">
          ${fullDate}
        </div>
      </div>
    </main>

    <script>
      (function() {
        function updateTime() {
          var d = new Date();
          var h = String(d.getHours()).padStart(2, '0');
          var m = String(d.getMinutes()).padStart(2, '0');
          var dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
          var fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

          var timeEl = document.getElementById('clock-display');
          var dayEl = document.getElementById('clock-day');
          var dateEl = document.getElementById('clock-date');

          if (timeEl && timeEl.textContent !== (h + ':' + m)) {
            timeEl.textContent = h + ':' + m;
          }
          if (dayEl && dayEl.textContent !== dayName) {
            dayEl.textContent = dayName;
          }
          if (dateEl && dateEl.textContent !== fullDate) {
            dateEl.textContent = fullDate;
          }
        }

        // Ticker syncing cleanly to the next minute mark
        function scheduleNext() {
          var now = new Date();
          var delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
          if (delay <= 0) delay = 1000;
          setTimeout(function() {
            updateTime();
            setInterval(updateTime, 60000);
          }, delay);
        }

        scheduleNext();
      })();
    </script>
  `;

  return renderHtmlShell({
    title: 'KindleDash // Clock',
    bodyContent,
    showActionBar: true,
    appName: 'CLOCK'
  });
}

module.exports = { renderClock };
