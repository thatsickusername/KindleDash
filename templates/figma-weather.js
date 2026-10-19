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

      <!-- Row 2: Left Column (Next 3 Days Forecast) & Right Column (Precipitation / Humidity / Wind) -->
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
        <!-- Day +1 (e.g., Wednesday) -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastDay1Icon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastDay1Desc}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              ${data.forecastDay1Name}
            </span>
          </div>
        </div>

        <!-- Day +2 (e.g., Thursday) -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastDay2Icon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastDay2Desc}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              ${data.forecastDay2Name}
            </span>
          </div>
        </div>

        <!-- Day +3 (e.g., Friday) -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.forecastDay3Icon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.forecastDay3Desc}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              ${data.forecastDay3Name}
            </span>
          </div>
        </div>
      </section>

      <!-- Right Column: Environmental Metrics (285x335 at x=305, y=355) -->
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
        <!-- Metric 1: Precipitation -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.precipitationIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.precipitation}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Precipitation
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
              ${data.humidity}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Humidity
            </span>
          </div>
        </div>

        <!-- Metric 3: Wind -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${data.windIcon}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.6px; color: var(--color-ink);">
              ${data.wind}
            </span>
            <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 25.5px; color: var(--color-subtext);">
              Wind
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
