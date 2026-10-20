const { renderAppShell } = require('./figma-layout');

function getTimeParts(date, timeZone = 'Asia/Kolkata') {
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = timeFormatter.formatToParts(date);
  const hours = parts.find(p => p.type === 'hour')?.value || '00';
  const minutes = parts.find(p => p.type === 'minute')?.value || '00';

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long'
  });
  const dayName = dayFormatter.format(date);

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const fullDate = dateFormatter.format(date);

  return { hours, minutes, dayName, fullDate };
}

function renderClock(reqQuery = {}) {
  const timeZone = reqQuery.tz || process.env.KINDLE_TIMEZONE || 'Asia/Kolkata';
  const serverNow = new Date();
  const serverEpoch = serverNow.getTime();
  const { hours, minutes, dayName, fullDate } = getTimeParts(serverNow, timeZone);

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
        var targetTimeZone = "${timeZone}";
        // Authoritative server timestamp when this HTML was generated
        var serverInitEpoch = ${serverEpoch};
        var clientInitEpoch = Date.now();
        // Offset between server time and local device clock
        var clockOffset = serverInitEpoch - clientInitEpoch;

        var hEl = document.getElementById('clock-hours');
        var mEl = document.getElementById('clock-minutes');
        var dayEl = document.getElementById('clock-day');
        var dateEl = document.getElementById('clock-date');

        var timeFormatter = null;
        var dayFormatter = null;
        var dateFormatter = null;

        try {
          timeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: targetTimeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          dayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: targetTimeZone,
            weekday: 'long'
          });
          dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: targetTimeZone,
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
        } catch (e) {
          // Fallback if older engine doesn't support targetTimeZone in Intl
          timeFormatter = null;
        }

        function updateTime() {
          // Current corrected timestamp
          var nowEpoch = Date.now() + clockOffset;
          var d = new Date(nowEpoch);

          var h = '00';
          var m = '00';
          var dayName = '';
          var fullDate = '';

          if (timeFormatter) {
            try {
              var parts = timeFormatter.formatToParts(d);
              for (var i = 0; i < parts.length; i++) {
                if (parts[i].type === 'hour') h = parts[i].value;
                if (parts[i].type === 'minute') m = parts[i].value;
              }
              dayName = dayFormatter.format(d);
              fullDate = dateFormatter.format(d);
            } catch (err) {
              timeFormatter = null; // trigger fallback below
            }
          }

          if (!timeFormatter) {
            // Standard fallback using UTC offset for IST (+5:30 = 330 mins)
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var ist = new Date(utc + (3600000 * 5.5));
            h = String(ist.getHours()).padStart ? String(ist.getHours()).padStart(2, '0') : (ist.getHours() < 10 ? '0' + ist.getHours() : '' + ist.getHours());
            m = String(ist.getMinutes()).padStart ? String(ist.getMinutes()).padStart(2, '0') : (ist.getMinutes() < 10 ? '0' + ist.getMinutes() : '' + ist.getMinutes());
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            dayName = days[ist.getDay()];
            fullDate = months[ist.getMonth()] + ' ' + ist.getDate() + ', ' + ist.getFullYear();
          }

          if (hEl && hEl.textContent !== h) hEl.textContent = h;
          if (mEl && mEl.textContent !== m) mEl.textContent = m;
          if (dayEl && dayEl.textContent !== dayName) dayEl.textContent = dayName;
          if (dateEl && dateEl.textContent !== fullDate) dateEl.textContent = fullDate;
        }

        // Ticker synced to the start of each minute
        function scheduleNext() {
          var nowEpoch = Date.now() + clockOffset;
          var curSec = new Date(nowEpoch).getSeconds();
          var curMs = new Date(nowEpoch).getMilliseconds();
          var delay = (60 - curSec) * 1000 - curMs;
          if (delay <= 0) delay = 1000;

          setTimeout(function() {
            updateTime();
            // Regularly update every minute
            setInterval(updateTime, 60000);
          }, delay);
        }

        // Also refresh immediately on page visibility change / wake
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            updateTime();
          }
        });

        // Run once on load to ensure sync
        updateTime();
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
