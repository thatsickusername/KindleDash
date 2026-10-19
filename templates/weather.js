const { renderHtmlShell } = require('./layout');

function renderWeather(data) {
  const headExtras = `<meta http-equiv="refresh" content="900">`;

  const bodyContent = `
    <header class="meta-bar">
      <div>WEATHER // OPEN-METEO</div>
      <div>REFRESH: 15M &bull; ${data.updatedAt}</div>
    </header>

    <main class="content-zone" style="justify-content: space-around; padding: 1.5rem 1rem;">
      <!-- Main Temp and Condition -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <div style="padding: 0.5rem;">
          ${data.icon}
        </div>
        <div style="font-family: var(--font-mono); font-size: 5.5rem; font-weight: 900; line-height: 1;">
          ${data.temp}&deg;C
        </div>
        <div style="font-size: 1.6rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;">
          ${data.desc}
        </div>
        <div style="font-size: 1.1rem; font-weight: 700; letter-spacing: 0.05em; border: var(--border-thin); padding: 0.2rem 0.8rem; margin-top: 0.25rem;">
          HIGH: ${data.tempMax}&deg;C &nbsp;|&nbsp; LOW: ${data.tempMin}&deg;C
        </div>
      </div>

      <!-- Secondary Metrics Strip -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        width: 100%;
        max-width: 500px;
        border: var(--border-thick);
        text-align: center;
      ">
        <div style="padding: 0.75rem 0.5rem; border-right: var(--border-thick);">
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em;">HUMIDITY</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900; margin-top: 0.2rem;">${data.humidity}%</div>
        </div>
        <div style="padding: 0.75rem 0.5rem; border-right: var(--border-thick);">
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em;">WIND</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900; margin-top: 0.2rem;">${data.windSpeed} <span style="font-size: 0.85rem;">km/h</span></div>
        </div>
        <div style="padding: 0.75rem 0.5rem;">
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em;">PRECIP</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900; margin-top: 0.2rem;">${data.precipProb}%</div>
        </div>
      </div>
    </main>
  `;

  return renderHtmlShell({
    title: 'KindleDash // Weather',
    headExtras,
    bodyContent,
    showActionBar: true,
    appName: 'WEATHER'
  });
}

module.exports = { renderWeather };
