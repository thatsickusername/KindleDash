const https = require('https');
const { mapWmoToIcons, getThermometerIcon, getHumidityDropletIcon } = require('./weather-icons');

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

function mapWmoToText(code) {
  if (code === 0) return 'Sunny';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Light Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

// Delhi Coordinates: Latitude: 28.6139, Longitude: 77.2090
async function getFigmaWeatherData(lat = 28.6139, lon = 77.2090) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    const data = await fetchJson(url);
    const current = data.current || {};
    const daily = data.daily || {};

    const currentCode = current.weather_code ?? 0;
    const isDay = current.is_day === 1;
    const todayCode = (daily.weather_code && daily.weather_code[0] !== undefined) ? daily.weather_code[0] : currentCode;
    const tomorrowCode = (daily.weather_code && daily.weather_code[1] !== undefined) ? daily.weather_code[1] : 0;

    const currentIconSet = mapWmoToIcons(currentCode, isDay);
    const todayIconSet = mapWmoToIcons(todayCode, true);
    const tomorrowIconSet = mapWmoToIcons(tomorrowCode, true);

    return {
      location: 'Delhi',
      tempNow: Math.round(current.temperature_2m ?? 28),
      feelsLike: Math.round(current.apparent_temperature ?? 20),
      humidity: Math.round(current.relative_humidity_2m ?? 64),
      rightNowDesc: mapWmoToText(currentCode),
      rightNowIcon: currentIconSet.small,
      heroIcon: currentIconSet.hero,
      forecastToday1: mapWmoToText(todayCode),
      forecastToday1Icon: todayIconSet.small,
      forecastToday2: mapWmoToText(todayCode),
      forecastToday2Icon: todayIconSet.small,
      forecastTomorrow: mapWmoToText(tomorrowCode),
      forecastTomorrowIcon: tomorrowIconSet.small,
      thermometerIcon: getThermometerIcon(),
      humidityIcon: getHumidityDropletIcon()
    };
  } catch (err) {
    // Robust fallback matching Figma default states
    const defaultIconSet = mapWmoToIcons(1, true);
    const rainIconSet = mapWmoToIcons(61, true);

    return {
      location: 'Delhi',
      tempNow: 28,
      feelsLike: 20,
      humidity: 64,
      rightNowDesc: 'Light Rain',
      rightNowIcon: rainIconSet.small,
      heroIcon: defaultIconSet.hero,
      forecastToday1: 'Sunny',
      forecastToday1Icon: defaultIconSet.small,
      forecastToday2: 'Sunny',
      forecastToday2Icon: defaultIconSet.small,
      forecastTomorrow: 'Sunny',
      forecastTomorrowIcon: defaultIconSet.small,
      thermometerIcon: getThermometerIcon(),
      humidityIcon: getHumidityDropletIcon()
    };
  }
}

module.exports = { getFigmaWeatherData };
