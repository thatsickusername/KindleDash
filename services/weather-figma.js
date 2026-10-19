const https = require('https');
const { mapWmoToIcons, getPrecipitationIcon, getHumidityDropletIcon, getWindIcon } = require('./weather-icons');

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

function getNextDayName(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

// Delhi Coordinates: Latitude: 28.6139, Longitude: 77.2090
async function getFigmaWeatherData(lat = 28.6139, lon = 77.2090) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,is_day&daily=weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    const data = await fetchJson(url);
    const current = data.current || {};
    const daily = data.daily || {};

    const currentCode = current.weather_code ?? 0;
    const isDay = current.is_day === 1;

    // Next 3 days forecast: Index 1 (tomorrow), Index 2 (day after tomorrow), Index 3 (in 3 days)
    const day1Code = (daily.weather_code && daily.weather_code[1] !== undefined) ? daily.weather_code[1] : 0;
    const day2Code = (daily.weather_code && daily.weather_code[2] !== undefined) ? daily.weather_code[2] : 0;
    const day3Code = (daily.weather_code && daily.weather_code[3] !== undefined) ? daily.weather_code[3] : 0;

    const currentIconSet = mapWmoToIcons(currentCode, isDay);
    const day1IconSet = mapWmoToIcons(day1Code, true);
    const day2IconSet = mapWmoToIcons(day2Code, true);
    const day3IconSet = mapWmoToIcons(day3Code, true);

    // Precipitation percentage (from daily forecast or current precipitation)
    const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined)
      ? daily.precipitation_probability_max[0]
      : (current.precipitation ? Math.round(current.precipitation * 10) : 0);

    const windSpeed = Math.round(current.wind_speed_10m ?? 6);
    const humidity = Math.round(current.relative_humidity_2m ?? 80);

    return {
      location: 'Delhi',
      tempNow: Math.round(current.temperature_2m ?? 28),
      heroIcon: currentIconSet.hero,

      // Left Column: 3 Days Forward Forecast
      forecastDay1Name: getNextDayName(1),
      forecastDay1Desc: mapWmoToText(day1Code),
      forecastDay1Icon: day1IconSet.small,

      forecastDay2Name: getNextDayName(2),
      forecastDay2Desc: mapWmoToText(day2Code),
      forecastDay2Icon: day2IconSet.small,

      forecastDay3Name: getNextDayName(3),
      forecastDay3Desc: mapWmoToText(day3Code),
      forecastDay3Icon: day3IconSet.small,

      // Right Column: Precipitation, Humidity, Wind
      precipitation: `${precipProb}%`,
      precipitationIcon: getPrecipitationIcon(),

      humidity: `${humidity}%`,
      humidityIcon: getHumidityDropletIcon(),

      wind: `${windSpeed} km/h`,
      windIcon: getWindIcon()
    };
  } catch (err) {
    // Graceful offline fallback
    const sunIcons = mapWmoToIcons(0, true);
    const cloudyIcons = mapWmoToIcons(1, true);

    return {
      location: 'Delhi',
      tempNow: 28,
      heroIcon: cloudyIcons.hero,

      forecastDay1Name: getNextDayName(1),
      forecastDay1Desc: 'Sunny',
      forecastDay1Icon: sunIcons.small,

      forecastDay2Name: getNextDayName(2),
      forecastDay2Desc: 'Partly Cloudy',
      forecastDay2Icon: cloudyIcons.small,

      forecastDay3Name: getNextDayName(3),
      forecastDay3Desc: 'Sunny',
      forecastDay3Icon: sunIcons.small,

      precipitation: '0%',
      precipitationIcon: getPrecipitationIcon(),

      humidity: '80%',
      humidityIcon: getHumidityDropletIcon(),

      wind: '6 km/h',
      windIcon: getWindIcon()
    };
  }
}

module.exports = { getFigmaWeatherData };
