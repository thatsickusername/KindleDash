const { renderAppShell } = require('./figma-layout');

function renderClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const bodyContent = `
    <!-- Top Content Area (600x700px) -->
    <main style="
      width: 600px;
      height: 700px;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 40px;
    ">
      <!-- Time Face -->
      <div style="
        display: flex;
        align-items: baseline;
        justify-content: center;
        line-height: 0.85;
        margin-bottom: 24px;
      ">
        <span id="clock-hours" style="
          font-family: var(--font-hero-num);
          font-size: 170px;
          font-weight: 300;
          color: var(--color-ink);
          letter-spacing: -4px;
        ">${hours}</span>
        <span style="
          font-family: var(--font-hero-num);
          font-size: 140px;
          font-weight: 300;
          color: var(--color-ink);
          margin: 0 4px;
          position: relative;
          top: -12px;
        ">:</span>
        <span id="clock-minutes" style="
          font-family: var(--font-hero-num);
          font-size: 170px;
          font-weight: 300;
          color: var(--color-ink);
          letter-spacing: -4px;
        ">${minutes}</span>
      </div>

      <!-- Calendar Strip Divider -->
      <div style="
        width: 140px;
        height: 2px;
        background-color: var(--color-ink);
        margin-bottom: 28px;
      "></div>

      <!-- Day of the Week -->
      <div id="clock-day" style="
        font-family: var(--font-main);
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: var(--color-ink);
        margin-bottom: 8px;
        text-align: center;
      ">
        ${dayName}
      </div>

      <!-- Full Date -->
      <div id="clock-date" style="
        font-family: var(--font-main);
        font-size: 20px;
        font-weight: 500;
        color: var(--color-subtext);
        text-align: center;
        letter-spacing: 0px;
      ">
        ${fullDate}
      </div>
    </main>

    <script>
      (function() {
        function updateTime() {
          var d = new Date();
          var h = String(d.getHours()).padStart(2, '0');
          var m = String(d.getMinutes()).padStart(2, '0');
          var dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          var fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          var hEl = document.getElementById('clock-hours');
          var mEl = document.getElementById('clock-minutes');
          var dayEl = document.getElementById('clock-day');
          var dateEl = document.getElementById('clock-date');

          if (hEl && hEl.textContent !== h) hEl.textContent = h;
          if (mEl && mEl.textContent !== m) mEl.textContent = m;
          if (dayEl && dayEl.textContent !== dayName) dayEl.textContent = dayName;
          if (dateEl && dateEl.textContent !== fullDate) dateEl.textContent = fullDate;
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

  return renderAppShell({
    title: 'KindleDash // Clock',
    bodyContent,
    currentAppName: 'Clock',
    backUrl: '/'
  });
}

module.exports = { renderClock };
