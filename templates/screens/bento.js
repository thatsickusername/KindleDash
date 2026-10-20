const { mapWmoToIcons } = require('../../services/weather-icons');

function renderBentoScreen(screen, { weatherData, f1Data, newsItems, timeData }) {
  const widgets = screen.widgets || [];

  const getWidget = (pos) => widgets.find(w => w.position === pos) || { type: 'empty' };
  const tl = getWidget('top-left');
  const tr = getWidget('top-right');
  const bl = getWidget('bottom-left');
  const br = getWidget('bottom-right');

  function renderWidgetContent(widget) {
    switch (widget.type) {
      case 'clock':
        return `
          <div class="bento-tile bento-tile-clock">
            <div class="bento-header-label">CURRENT TIME</div>
            <div class="bento-clock-time" id="bento-time">${timeData?.timeStr || '--:--'}</div>
            <div class="bento-clock-date" id="bento-date">${timeData?.dateStr || ''}</div>
          </div>
        `;

      case 'weather-compact':
        const temp = weatherData?.current?.temperature ?? '--';
        const cond = weatherData?.current?.condition ?? 'Weather';
        const iconCode = weatherData?.current?.weatherCode || 0;
        const iconSvg = mapWmoToIcons(iconCode, true).small;
        return `
          <div class="bento-tile bento-tile-weather">
            <div class="bento-header-label">WEATHER</div>
            <div class="bento-weather-row">
              <div class="bento-weather-icon">${iconSvg}</div>
              <div class="bento-weather-temp">${temp}°</div>
            </div>
            <div class="bento-weather-cond">${cond}</div>
          </div>
        `;

      case 'f1-compact':
        const race = f1Data?.nextRace;
        const days = f1Data?.daysToRace ?? '--';
        const raceName = race ? race.raceName : 'Grand Prix';
        const topDriver = f1Data?.driverStandings?.[0];
        return `
          <div class="bento-tile bento-tile-f1">
            <div class="bento-header-label">FORMULA 1</div>
            <div class="bento-f1-race">${raceName}</div>
            <div class="bento-f1-badge">${days === 0 ? 'RACE TODAY' : `IN ${days} DAYS`}</div>
            <div class="bento-f1-leader">Leader: <strong>${topDriver?.code || 'VER'}</strong> (${topDriver?.points || '0'} pts)</div>
          </div>
        `;

      case 'news-compact':
        const topNews = newsItems?.[0] || { title: 'Headlines will refresh shortly' };
        return `
          <div class="bento-tile bento-tile-news">
            <div class="bento-header-label">TOP HEADLINE</div>
            <div class="bento-news-title">${topNews.title}</div>
            <div class="bento-news-source">${topNews.source || 'News'}</div>
          </div>
        `;

      default:
        return `<div class="bento-tile bento-tile-empty"><div class="bento-header-label">EMPTY</div></div>`;
    }
  }

  return `
    <div class="bento-grid">
      <div class="bento-cell">${renderWidgetContent(tl)}</div>
      <div class="bento-cell">${renderWidgetContent(tr)}</div>
      <div class="bento-cell">${renderWidgetContent(bl)}</div>
      <div class="bento-cell">${renderWidgetContent(br)}</div>
    </div>
  `;
}

module.exports = {
  renderBentoScreen
};
