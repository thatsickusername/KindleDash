const { renderFigmaShell } = require('./figma-layout');

function renderFigmaWeather(data) {
  // SVG Icons exactly as extracted from Figma:
  // Sun icon (34x34)
  const sunIcon = `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.625 17C10.625 20.5185 13.4815 23.375 17 23.375C20.5185 23.375 23.375 20.5185 23.375 17C23.375 13.4815 20.5185 10.625 17 10.625C13.4815 10.625 10.625 13.4815 10.625 17V17" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M17 3.1875V6.375" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M17 27.625V30.8125" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M3.1875 17H6.375" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M27.625 17H30.8125" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M7.22501 7.22498L9.56251 9.56248" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M24.4375 24.4375L26.775 26.775" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M7.22501 26.775L9.56251 24.4375" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
    <path d="M24.4375 9.56248L26.775 7.22498" stroke-width="2.55" stroke-linecap="round" stroke="#111111"/>
  </svg>`;

  // Thermometer icon (24x34)
  const thermometerIcon = `<svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4 20.4001V5.66672C15.4 3.79021 13.8765 2.26672 12 2.26672C10.1235 2.26672 8.59998 3.79021 8.59998 5.66672V20.4001C6.64869 21.8635 5.85279 24.4114 6.62411 26.7253C7.39542 29.0393 9.56087 30.6001 12 30.6001C14.4391 30.6001 16.6045 29.0393 17.3759 26.7253C18.1472 24.4114 17.3513 21.8635 15.4 20.4001V20.4001" stroke-width="2.83333" stroke-linecap="round" stroke="#111111"/>
    <path d="M8.82666 24.9333C8.82666 26.6848 10.2486 28.1067 12 28.1067C13.7514 28.1067 15.1733 26.6848 15.1733 24.9333C15.1733 23.1819 13.7514 21.76 12 21.76C10.2486 21.76 8.82666 23.1819 8.82666 24.9333V24.9333" fill="#111111" stroke-width="2.83333" stroke-linecap="round" stroke="#111111"/>
    <path d="M12 13.6V21.5333" stroke-width="2.83333" stroke-linecap="round" stroke="#111111"/>
  </svg>`;

  // Humidity icon (28x28)
  const humidityIcon = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 6C11 6 7 11 7 14.5C7 16.7077 8.79234 18.5 11 18.5C13.2077 18.5 15 16.7077 15 14.5C15 11 11 6 11 6V6" fill="#111111"/>
    <path d="M16.7 11.5C16.7 13.0453 17.9547 14.3 19.5 14.3C21.0454 14.3 22.3 13.0453 22.3 11.5C22.3 9.95459 21.0454 8.69995 19.5 8.69995C17.9547 8.69995 16.7 9.95459 16.7 11.5V11.5" fill="#111111"/>
    <path d="M15.8 20.5C15.8 22.2662 17.2339 23.7 19 23.7C20.7661 23.7 22.2 22.2662 22.2 20.5C22.2 18.7339 20.7661 17.3 19 17.3C17.2339 17.3 15.8 18.7339 15.8 20.5V20.5" fill="#111111"/>
  </svg>`;

  // Rain cloud icon (34x28)
  const rainIcon = `<svg width="34" height="28" viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.99997 19C7.1632 18.376 5.85312 16.7459 5.6389 14.8179C5.42468 12.8899 6.34497 11.012 7.99997 9.99999C7.44806 5.86062 10.3606 2.0519 14.5 1.49999C18.6393 0.948072 22.4481 3.86062 23 7.99999C25.2811 8.17405 27.2647 9.63015 28.1143 11.7543C28.964 13.8784 28.5318 16.3008 27 18" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke="#111111"/>
    <path d="M11 23L10 26" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke="#111111"/>
    <path d="M16 22L15 26" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke="#111111"/>
    <path d="M21 23L20 26" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke="#111111"/>
  </svg>`;

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
        <img 
          src="/figma-assets/hero-weather-icon.png" 
          alt="Weather Condition" 
          width="200" 
          height="200"
          style="display: block;"
        >
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
        <!-- Forecast Item 1: Sunny / Today -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${sunIcon}
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

        <!-- Forecast Item 2: Sunny / Today -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${sunIcon}
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

        <!-- Forecast Item 3: Sunny / Tomorrow -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${sunIcon}
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
            ${thermometerIcon}
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
            ${humidityIcon}
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

        <!-- Metric 3: Right Now (Light Rain) -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 40px; display: flex; align-items: center; justify-content: center;">
            ${rainIcon}
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
    title: 'KindleDash // Weather Delhi',
    bodyContent,
    currentAppName: `Weather ${data.location || 'Delhi'}`,
    backUrl: '/'
  });
}

module.exports = { renderFigmaWeather };
