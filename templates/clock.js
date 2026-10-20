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

function renderClockContent(options = {}) {
  const timeZone = options.tz || process.env.KINDLE_TIMEZONE || 'Asia/Kolkata';
  const f1Data = options.f1Data;
  const isQualiOrRaceDay = f1Data?.isQualiOrRaceDay === true;

  const serverNow = new Date();
  const serverEpoch = serverNow.getTime();
  const { hours, minutes, dayName, fullDate } = getTimeParts(serverNow, timeZone);

  // -------------------------------------------------------------
  // Mode A: Race Weekend Live (Qualifying or Race Day 2-Part Grid)
  // -------------------------------------------------------------
  if (isQualiOrRaceDay) {
    const race = f1Data?.nextRace;
    const isRaceDay = f1Data?.currentPhase === 'race';
    const sessionResults = f1Data?.sessionResults || [];
    const sessionTitle = f1Data?.sessionTitle || (isRaceDay ? 'RACE CLASSIFICATION (TOP 5)' : 'QUALIFYING (TOP 5)');

    const resultsHtml = sessionResults.map((d) => `
      <div style="
        display: grid;
        grid-template-columns: 28px 52px 1fr 125px 75px;
        align-items: center;
        font-family: var(--font-main);
        font-size: 15px;
        border-bottom: 1px solid var(--color-bar-border, #a8a8a8);
        padding: 4px 0;
      ">
        <div style="font-weight: 800; font-size: 15px; color: var(--color-ink, #111111);">${d.position}</div>
        <div style="font-weight: 800; background: var(--color-bar-bg, #d9d9d9); padding: 2px 5px; border-radius: 4px; text-align: center; font-size: 12px; color: var(--color-ink, #111111);">${d.code}</div>
        <div style="font-weight: 700; padding-left: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-ink, #111111);">${d.name}</div>
        <div style="font-size: 13px; font-weight: 500; color: var(--color-subtext, #464c52); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.constructor}</div>
        <div style="font-weight: 800; font-size: 15px; text-align: right; color: var(--color-ink, #111111);">${d.stat}</div>
      </div>
    `).join('');

    return `
      <!-- 2-Row Split Grid for Qualifying / Race Day -->
      <main style="
        width: 600px;
        height: 712px;
        position: absolute;
        top: 0;
        left: 0;
        padding: 24px 28px 12px 28px;
        box-sizing: border-box;
        display: grid;
        grid-template-rows: 1fr 1fr;
        row-gap: 16px;
        overflow: hidden;
      ">
        <!-- Top Container: Digital Clock & Date (Border-free, larger numerals) -->
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
        ">
          <!-- Digital Time -->
          <div style="
            display: flex;
            align-items: baseline;
            justify-content: center;
            line-height: 0.85;
            margin-bottom: 12px;
          ">
            <span id="clock-hours" style="
              font-family: var(--font-hero-num);
              font-size: 135px;
              font-weight: 300;
              color: var(--color-ink);
              letter-spacing: -4px;
            ">${hours}</span>
            <span style="
              font-family: var(--font-hero-num);
              font-size: 110px;
              font-weight: 300;
              color: var(--color-ink);
              margin: 0 4px;
              position: relative;
              top: -10px;
            ">:</span>
            <span id="clock-minutes" style="
              font-family: var(--font-hero-num);
              font-size: 135px;
              font-weight: 300;
              color: var(--color-ink);
              letter-spacing: -4px;
            ">${minutes}</span>
          </div>

          <!-- Divider -->
          <div style="
            width: 110px;
            height: 2px;
            background-color: var(--color-ink);
            margin-bottom: 12px;
          "></div>

          <!-- Day & Date (Original sizes preserved) -->
          <div id="clock-day" style="
            font-family: var(--font-main);
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: var(--color-ink);
            margin-bottom: 4px;
            text-align: center;
          ">
            ${dayName}
          </div>
          <div id="clock-date" style="
            font-family: var(--font-main);
            font-size: 16px;
            font-weight: 500;
            color: var(--color-subtext);
            text-align: center;
          ">
            ${fullDate}
          </div>
        </div>

        <!-- Bottom Container: Qualifying / Race Day Top 5 Positions -->
        <div style="
          width: 100%;
          height: 100%;
          border: 2.5px solid var(--color-ink, #111111);
          border-radius: 14px;
          padding: 16px 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
        ">
          <!-- Race Name & Session Badge -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-ink, #111111); padding-bottom: 6px;">
            <div>
              <div style="font-family: var(--font-main); font-size: 18px; font-weight: 800; color: var(--color-ink, #111111);">
                ${race ? race.raceName : 'Formula 1 Grand Prix'}
              </div>
              <div style="font-family: var(--font-main); font-size: 12px; font-weight: 600; color: var(--color-subtext, #464c52);">
                ${race ? `${race.locality}, ${race.country}` : 'Championship'} • ${sessionTitle}
              </div>
            </div>
            <span style="background: var(--color-ink, #111111); color: #ffffff; font-family: var(--font-main); font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px;">
              ${isRaceDay ? '🏁 RACE DAY' : '⏱️ QUALIFYING'}
            </span>
          </div>

          <!-- Top 5 Session Position Table -->
          <div style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; padding-top: 4px;">
            ${resultsHtml || '<div>Session results currently unavailable</div>'}
          </div>
        </div>
      </main>

      ${renderClockTickerScript(timeZone, serverEpoch)}
    `;
  }

  // -------------------------------------------------------------
  // Mode B: Standard Centered Static Clock (All Other Times)
  // -------------------------------------------------------------
  return `
    <!-- Centered Static Clock Face (600x700px) -->
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

    ${renderClockTickerScript(timeZone, serverEpoch)}
  `;
}

function renderClockTickerScript(timeZone, serverEpoch) {
  return `
    <script>
      (function() {
        var targetTimeZone = "${timeZone}";
        var serverInitEpoch = ${serverEpoch};
        var clientInitEpoch = Date.now();
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
          timeFormatter = null;
        }

        function updateTime() {
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
              timeFormatter = null;
            }
          }

          if (!timeFormatter) {
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

        function scheduleNext() {
          var nowEpoch = Date.now() + clockOffset;
          var curSec = new Date(nowEpoch).getSeconds();
          var curMs = new Date(nowEpoch).getMilliseconds();
          var delay = (60 - curSec) * 1000 - curMs;
          if (delay <= 0) delay = 1000;

          setTimeout(function() {
            updateTime();
            setInterval(updateTime, 60000);
          }, delay);
        }

        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            updateTime();
          }
        });

        updateTime();
        scheduleNext();
      })();
    </script>
  `;
}

function renderClock(reqQuery = {}) {
  return renderAppShell({
    title: 'KindleDash // Clock',
    bodyContent: renderClockContent(reqQuery),
    currentAppName: 'Clock',
    backUrl: '/'
  });
}

module.exports = { renderClock, renderClockContent };
