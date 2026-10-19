const { renderFigmaShell } = require('./figma-layout');

function renderFigmaWeather(data) {
  const headExtras = `<meta http-equiv="refresh" content="900">`;

  const bodyContent = `
    <!-- Top Content Area (600x700px in Figma Frame 1) -->
    <main style="
      width: 600px;
      height: 700px;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
    ">
      <!-- Row 1: Hero Weather Icon (left) and Temperature (right) -->
      <!-- Weather Icon Hero: (285x335 at x=10, y=10) -->
      <section style="
        position: absolute;
        top: 10px;
        left: 10px;
        width: 285px;
        height: 335px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
          ${data.heroIcon}
        </div>
      </section>

      <!-- Current Temperature: (285x335 at x=305, y=10) -->
      <section style="
        position: absolute;
        top: 10px;
        left: 305px;
        width: 285px;
        height: 335px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding-left: 20px;
      ">
        <!-- Number & Degree symbol group -->
        <div style="display: flex; align-items: flex-start; line-height: 0.85; position: relative;">
          <span style="
            font-family: var(--font-hero-num);
            font-size: 180px;
            font-weight: 300;
            color: var(--color-ink);
            letter-spacing: -2px;
          ">${data.tempNow}</span>
          <span style="
            font-family: var(--font-main);
            font-size: 96px;
            font-weight: 400;
            color: var(--color-ink);
            line-height: 1;
            margin-left: 4px;
            margin-top: 10px;
          ">&deg;</span>
        </div>

        <!-- Subtext: Temperature Now -->
        <div style="
          font-family: var(--font-main);
          font-size: 19px;
          font-weight: 500;
          color: var(--color-ink);
          margin-top: 18px;
          letter-spacing: 0px;
        ">
          Temperature Now
        </div>
      </section>

      <!-- Row 2: Left Column (Forecast) & Right Column (Metrics) -->
      <!-- Left Column: (285x335 at x=10, y=355) -->
      <section style="
        position: absolute;
        top: 355px;
        left: 10px;
        width: 285px;
        height: 335px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 38px;
        padding-left: 40px;
      ">
        <!-- Forecast Item 1: Today -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastToday1Icon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastToday1}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Today
            </span>
          </div>
        </div>

        <!-- Forecast Item 2: Today (Afternoon/Evening) -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastToday2Icon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastToday2}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Today
            </span>
          </div>
        </div>

        <!-- Forecast Item 3: Tomorrow -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastTomorrowIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastTomorrow}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Tomorrow
            </span>
          </div>
        </div>
      </section>

      <!-- Right Column: Metrics (285x335 at x=305, y=355) -->
      <section style="
        position: absolute;
        top: 355px;
        left: 305px;
        width: 285px;
        height: 335px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 38px;
        padding-left: 40px;
      ">
        <!-- Metric 1: Feels Like -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.thermometerIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.feelsLike}&deg;
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Feels Like
            </span>
          </div>
        </div>

        <!-- Metric 2: Humidity -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.humidityIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.humidity}%
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Humidity
            </span>
          </div>
        </div>

        <!-- Metric 3: Right Now -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.rightNowIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.rightNowDesc}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Right Now
            </span>
          </div>
        </div>
      </section>
    </main>
  `;

  return renderFigmaShell({
    title: `KindleDash // Weather ${data.location}`,
    headExtras,
    bodyContent,
    currentAppName: `Weather ${data.location || 'Delhi'}`,
    backUrl: '/'
  });
}

module.exports = { renderFigmaWeather };
