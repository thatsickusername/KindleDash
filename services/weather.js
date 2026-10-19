const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KindleDash/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function getWeatherIconAndDesc(code) {
  // WMO Weather interpretation codes
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 71, 73, 75: Snow fall
  // 77: Snow grains
  // 80, 81, 82: Rain showers
  // 85, 86: Snow showers
  // 95: Thunderstorm
  if (code === 0) {
    return {
      desc: 'CLEAR SKY',
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    };
  } else if (code >= 1 && code <= 3) {
    return {
      desc: code === 1 ? 'MAINLY CLEAR' : (code === 2 ? 'PARTLY CLOUDY' : 'OVERCAST'),
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`
    };
  } else if (code >= 51 && code <= 67 || (code >= 80 && code <= 82)) {
    return {
      desc: 'RAIN / SHOWERS',
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`
    };
  } else if (code >= 71 && code <= 77 || (code >= 85 && code <= 86)) {
    return {
      desc: 'SNOW',
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"></path></svg>`
    };
  } else if (code >= 95) {
    return {
      desc: 'THUNDERSTORM',
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>`
    };
  } else {
    return {
      desc: 'MIST / FOG',
      icon: `<svg width="4.5rem" height="4.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M3 8h18M7 16h10M4 20h16"></path></svg>`
    };
  }
}

async function getWeatherData(lat = 40.7128, lon = -74.0060) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const data = await fetchJson(url);
    const current = data.current || {};
    const daily = data.daily || {};
    const info = getWeatherIconAndDesc(current.weather_code || 0);

    return {
      temp: Math.round(current.temperature_2m ?? 20),
      humidity: current.relative_humidity_2m ?? '--',
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      desc: info.desc,
      icon: info.icon,
      tempMax: Math.round(daily.temperature_2m_max ? daily.temperature_2m_max[0] : 24),
      tempMin: Math.round(daily.temperature_2m_min ? daily.temperature_2m_min[0] : 14),
      precipProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0,
      updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  } catch (err) {
    return {
      temp: 21,
      humidity: 55,
      windSpeed: 12,
      desc: 'PARTLY CLOUDY',
      icon: getWeatherIconAndDesc(2).icon,
      tempMax: 24,
      tempMin: 16,
      precipProb: 10,
      updatedAt: 'OFFLINE'
    };
  }
}

module.exports = { getWeatherData };
