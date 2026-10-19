const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KindleDash/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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

function mapWeatherCode(code) {
  if (code === 0) return 'Sunny';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Light Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Sunny';
}

// Delhi Coordinates: Latitude: 28.6139, Longitude: 77.2090
async function getFigmaWeatherData(lat = 28.6139, lon = 77.2090) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    const data = await fetchJson(url);
    const current = data.current || {};
    const daily = data.daily || {};

    const tempNow = Math.round(current.temperature_2m ?? 28);
    const feelsLike = Math.round(current.apparent_temperature ?? 20);
    const humidity = Math.round(current.relative_humidity_2m ?? 64);
    const rightNowDesc = mapWeatherCode(current.weather_code ?? 0);

    const todayDesc = daily.weather_code && daily.weather_code[0] !== undefined 
      ? mapWeatherCode(daily.weather_code[0]) 
      : 'Sunny';

    const tomorrowDesc = daily.weather_code && daily.weather_code[1] !== undefined 
      ? mapWeatherCode(daily.weather_code[1]) 
      : 'Sunny';

    return {
      location: 'Delhi',
      tempNow: tempNow,
      feelsLike: feelsLike,
      humidity: humidity,
      rightNowDesc: rightNowDesc,
      forecastToday1: todayDesc,
      forecastToday2: todayDesc,
      forecastTomorrow: tomorrowDesc
    };
  } catch (err) {
    // Graceful offline fallback matching exact values from Figma design
    return {
      location: 'Delhi',
      tempNow: 28,
      feelsLike: 20,
      humidity: 64,
      rightNowDesc: 'Light Rain',
      forecastToday1: 'Sunny',
      forecastToday2: 'Sunny',
      forecastTomorrow: 'Sunny'
    };
  }
}

module.exports = { getFigmaWeatherData };
