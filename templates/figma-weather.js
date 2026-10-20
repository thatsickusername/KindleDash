const { renderFigmaShell } = require('./figma-layout');

function getFigmaWeatherBody(data) {
  return `
    <!-- Main Screen Content Flex Container (600px width x 705px height, leaving 85px for bottom bar) -->
    <main style="
      width: 600px;
      height: 705px;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 28px 12px 28px;
      box-sizing: border-box;
      overflow: hidden;
    ">
      <!-- Section 1: Hero Weather Visual & Temperature Now (Height ~290px) -->
      <section style="
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        height: 290px;
      ">
        <!-- Hero Weather Icon (left) -->
        <div style="
          width: 250px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
            ${data.heroIcon}
          </div>
        </div>

        <!-- Hero Temperature & Label (right) -->
        <div style="
          width: 250px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding-left: 10px;
        ">
          <!-- Number & Degree symbol group -->
          <div style="display: flex; align-items: flex-start; line-height: 0.85; position: relative;">
            <span style="
              font-family: var(--font-hero-num);
              font-size: 170px;
              font-weight: 300;
              color: var(--color-ink);
              letter-spacing: -3px;
            ">${data.tempNow}</span>
            <span style="
              font-family: var(--font-main);
              font-size: 88px;
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
            font-size: 20px;
            font-weight: 500;
            color: var(--color-ink);
            margin-top: 18px;
            letter-spacing: -0.2px;
          ">
            Temperature Now
          </div>
        </div>
      </section>

      <!-- Section 2: 2-Column Metrics Grid (Fills the remaining ~380px gracefully down to the bottom bar) -->
      <section style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        height: 360px;
        gap: 20px;
        align-items: stretch;
      ">
        <!-- Left Column: Next 3 Days Forecast -->
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding-left: 20px;
          height: 100%;
        ">
          <!-- Forecast Day +1 -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.forecastDay1Icon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.forecastDay1Desc}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                ${data.forecastDay1Name}
              </span>
            </div>
          </div>

          <!-- Forecast Day +2 -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.forecastDay2Icon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.forecastDay2Desc}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                ${data.forecastDay2Name}
              </span>
            </div>
          </div>

          <!-- Forecast Day +3 -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.forecastDay3Icon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.forecastDay3Desc}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                ${data.forecastDay3Name}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: Environmental Metrics (Precipitation, Humidity, Wind) -->
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding-left: 20px;
          height: 100%;
        ">
          <!-- Metric 1: Precipitation -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.precipitationIcon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.precipitation}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                Precipitation
              </span>
            </div>
          </div>

          <!-- Metric 2: Humidity -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.humidityIcon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.humidity}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                Humidity
              </span>
            </div>
          </div>

          <!-- Metric 3: Wind -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${data.windIcon}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-main); font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.5px; color: var(--color-ink);">
                ${data.wind}
              </span>
              <span style="font-family: var(--font-main); font-size: 17px; font-weight: 500; line-height: 24px; color: var(--color-subtext);">
                Wind
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  return bodyContent;
}

function renderFigmaWeather(data) {
  const headExtras = `<meta http-equiv="refresh" content="900">`;
  const bodyContent = getFigmaWeatherBody(data);

  return renderFigmaShell({
    title: 'KindleDash // Weather',
    headExtras,
    bodyContent,
    currentAppName: 'Weather',
    backUrl: '/'
  });
}

module.exports = { renderFigmaWeather, getFigmaWeatherBody };
