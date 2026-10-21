const fs = require('fs');
const path = require('path');
const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');

const { getF1Data } = require('../services/f1');
const { getFigmaWeatherData } = require('../services/weather-figma');
const { getNewsFeed } = require('../services/news');
const {
  generateClockLayout,
  generateWeatherLayout,
  generateF1Layout,
  generateNewsLayout,
  generateSleepLayout
} = require('../services/satori-templates');

// Monolithic In-Memory State for Full Product
let globalConfig = {
  carousel_enabled: false,           // boolean: cycle screens automatically on each wake
  active_view: 'clock',              // 'clock' | 'weather' | 'f1' | 'news'
  refresh_interval: 900,             // 900 (15m), 1800 (30m), 3600 (1h), 7200 (2h)
  night_mode_enabled: true,          // boolean
  night_start: '23:00',              // HH:MM string
  night_end: '07:00',                // HH:MM string
  timezone: 'Asia/Kolkata'
};

// Carousel rotation state
const CAROUSEL_ROTATION = ['clock', 'weather', 'f1', 'news'];
let carouselIndex = 0;

// Hardware Telemetry state (populated via POST /api/log from Kindle)
let latestTelemetry = {
  battery: null,
  rssi: null,
  lastSeen: null
};

// Font Buffers for Satori (Loaded once into memory)
const FONT_REGULAR_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Inter-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Inter-Bold.ttf');
const FONT_GROTESK_LIGHT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'SpaceGrotesk-Light.ttf');
const FONT_GROTESK_BOLD_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'SpaceGrotesk-Bold.ttf');

let fontRegularBuffer = null;
let fontBoldBuffer = null;
let fontGroteskLightBuffer = null;
let fontGroteskBoldBuffer = null;

try {
  if (fs.existsSync(FONT_REGULAR_PATH)) fontRegularBuffer = fs.readFileSync(FONT_REGULAR_PATH);
  if (fs.existsSync(FONT_BOLD_PATH)) fontBoldBuffer = fs.readFileSync(FONT_BOLD_PATH);
  if (fs.existsSync(FONT_GROTESK_LIGHT_PATH)) fontGroteskLightBuffer = fs.readFileSync(FONT_GROTESK_LIGHT_PATH);
  if (fs.existsSync(FONT_GROTESK_BOLD_PATH)) fontGroteskBoldBuffer = fs.readFileSync(FONT_GROTESK_BOLD_PATH);
} catch (err) {
  console.error('[KindleDash SSR] Warning: Failed to pre-load fonts:', err);
}

function getFontConfig() {
  const fonts = [];
  if (fontRegularBuffer) fonts.push({ name: 'Inter', data: fontRegularBuffer, weight: 400, style: 'normal' });
  if (fontBoldBuffer) fonts.push({ name: 'Inter', data: fontBoldBuffer, weight: 700, style: 'normal' });
  if (fontGroteskLightBuffer) fonts.push({ name: 'SpaceGrotesk', data: fontGroteskLightBuffer, weight: 300, style: 'normal' });
  if (fontGroteskBoldBuffer) fonts.push({ name: 'SpaceGrotesk', data: fontGroteskBoldBuffer, weight: 700, style: 'normal' });
  return fonts;
}

// Weather and News Caches
let cachedWeather = null;
let lastWeatherFetch = 0;
async function getOrFetchWeather() {
  const now = Date.now();
  if (cachedWeather && (now - lastWeatherFetch < 600000)) return cachedWeather;
  try {
    cachedWeather = await getFigmaWeatherData(28.6139, 77.2090);
    lastWeatherFetch = now;
    return cachedWeather;
  } catch (e) {
    return cachedWeather || {};
  }
}

let cachedNews = null;
let lastNewsFetch = 0;
async function getOrFetchNews() {
  const now = Date.now();
  if (cachedNews && (now - lastNewsFetch < 900000)) return cachedNews;
  try {
    cachedNews = await getNewsFeed();
    lastNewsFetch = now;
    return cachedNews;
  } catch (e) {
    return cachedNews || [];
  }
}

// Night Mode Schedule Evaluator
function checkNightModeStatus() {
  // DEV OVERRIDE: Temporarily disabled for testing live screens at night
  return { isNight: false, remainingSecondsToMorning: null };

  /*
  if (!globalConfig.night_mode_enabled) {
    return { isNight: false, remainingSecondsToMorning: null };
  }

  const tz = globalConfig.timezone || 'Asia/Kolkata';
  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const [curH, curM] = timeFormatter.format(now).split(':').map(Number);
  const curMins = curH * 60 + curM;

  const [startH, startM] = (globalConfig.night_start || '23:00').split(':').map(Number);
  const startMins = startH * 60 + startM;

  const [endH, endM] = (globalConfig.night_end || '07:00').split(':').map(Number);
  const endMins = endH * 60 + endM;

  let isNight = false;
  let remainingMins = 0;

  if (startMins < endMins) {
    // Normal day interval (e.g. 01:00 to 06:00)
    isNight = curMins >= startMins && curMins < endMins;
    if (isNight) remainingMins = endMins - curMins;
  } else {
    // Overnight interval crossing midnight (e.g. 23:00 to 07:00)
    isNight = curMins >= startMins || curMins < endMins;
    if (isNight) {
      if (curMins >= startMins) {
        remainingMins = (1440 - curMins) + endMins;
      } else {
        remainingMins = endMins - curMins;
      }
    }
  }

  const remainingSeconds = Math.max(900, Math.min(21600, remainingMins * 60)); // clamp to script bounds
  return { isNight, remainingSecondsToMorning: remainingSeconds };
  */
}

async function handler(req, res) {
  const fullUrl = req.url || '/';
  const urlObj = new URL(fullUrl, 'http://localhost');
  const pathParam = urlObj.searchParams.get('path');

  let urlPath = '/' + (pathParam || '').replace(/^\//, '');
  if (!pathParam) {
    urlPath = urlObj.pathname;
    if (urlPath === '/api/index.js' || urlPath === '/api') {
      urlPath = '/';
    }
  }

  // --- Static Asset Handlers ---
  if (urlPath === '/test-dashboard.png') {
    const imgPath = path.join(__dirname, '..', 'public', 'test-dashboard.png');
    try {
      const imgBuffer = fs.readFileSync(imgPath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.end(imgBuffer);
    } catch (err) {
      res.statusCode = 404;
      return res.end('Test image not found');
    }
  }

  // --- API Endpoints ---

  // 1. /api/log (Receives battery, RSSI and device status from calendar.sh)
  if (urlPath === '/api/log') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Battery-Percent, RSSI, ID, FW-Version');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    // Capture telemetry headers sent by calendar.sh
    const battHeader = req.headers['battery-percent'];
    const rssiHeader = req.headers['rssi'];
    if (battHeader) latestTelemetry.battery = parseInt(battHeader, 10);
    if (rssiHeader) latestTelemetry.rssi = rssiHeader;
    latestTelemetry.lastSeen = Date.now();

    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, telemetry: latestTelemetry }));
    });
  }

  // 2. /api/display (Kindle TRMNL/FBInk handshake endpoint)
  if (urlPath === '/api/display') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Capture headers on /api/display as well
    const battHeader = req.headers['battery-percent'];
    const rssiHeader = req.headers['rssi'];
    if (battHeader) latestTelemetry.battery = parseInt(battHeader, 10);
    if (rssiHeader) latestTelemetry.rssi = rssiHeader;
    latestTelemetry.lastSeen = Date.now();

    const hostHeader = req.headers.host || 'kindledashboard.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || (hostHeader.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = `${proto}://${hostHeader}`;

    const nightStatus = checkNightModeStatus();
    let effectiveRefreshRate = Number(globalConfig.refresh_interval) || 900;
    if (nightStatus.isNight && nightStatus.remainingSecondsToMorning) {
      effectiveRefreshRate = nightStatus.remainingSecondsToMorning;
    }

    const responsePayload = {
      image_url: `${baseUrl}/api/render-image`,
      refresh_rate: effectiveRefreshRate
    };

    res.statusCode = 200;
    return res.end(JSON.stringify(responsePayload, null, 2));
  }

  // 3. /api/render-image (Dynamic Satori -> Resvg PNG Generator)
  if (urlPath === '/api/render-image') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    try {
      const viewParam = urlObj.searchParams.get('view');
      const nightStatus = checkNightModeStatus();

      let targetView;
      if (viewParam) {
        // Direct override from preview tab (e.g. ?view=sleep or ?view=f1)
        targetView = viewParam;
      } else if (nightStatus.isNight) {
        targetView = 'sleep';
      } else if (globalConfig.carousel_enabled) {
        // Carousel rotation mode: serve current index, then increment for next wake
        targetView = CAROUSEL_ROTATION[carouselIndex % CAROUSEL_ROTATION.length];
        carouselIndex++;
      } else {
        // Pinned view mode
        targetView = globalConfig.active_view || 'clock';
      }

      let layoutElement;
      if (targetView === 'sleep') {
        layoutElement = generateSleepLayout();
      } else if (targetView === 'weather') {
        const weather = await getOrFetchWeather();
        layoutElement = generateWeatherLayout(weather);
      } else if (targetView === 'f1') {
        const f1Data = await getF1Data().catch(() => ({}));
        layoutElement = generateF1Layout(f1Data);
      } else if (targetView === 'news') {
        const newsItems = await getOrFetchNews();
        layoutElement = generateNewsLayout(newsItems);
      } else {
        const f1Data = await getF1Data().catch(() => null);
        layoutElement = generateClockLayout(globalConfig.timezone, f1Data);
      }

      const fonts = getFontConfig();
      const svg = await satori.default(layoutElement, {
        width: 600,
        height: 800,
        fonts
      });

      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 600 }
      });
      const pngBuffer = resvg.render().asPng();

      res.statusCode = 200;
      return res.end(pngBuffer);
    } catch (err) {
      console.error('[KindleDash SSR] Render Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('Rendering error: ' + err.message);
    }
  }

  // 4. /api/config (Read & Mutate Configuration)
  if (urlPath === '/api/config') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      return req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');

          if (typeof parsed.carousel_enabled === 'boolean') {
            globalConfig.carousel_enabled = parsed.carousel_enabled;
          }
          if (parsed.active_view && ['clock', 'weather', 'f1', 'news'].includes(parsed.active_view)) {
            globalConfig.active_view = parsed.active_view;
          }
          if (parsed.refresh_interval && [900, 1800, 3600, 7200].includes(Number(parsed.refresh_interval))) {
            globalConfig.refresh_interval = Number(parsed.refresh_interval);
          }
          if (typeof parsed.night_mode_enabled === 'boolean') {
            globalConfig.night_mode_enabled = parsed.night_mode_enabled;
          }
          if (parsed.night_start) globalConfig.night_start = parsed.night_start;
          if (parsed.night_end) globalConfig.night_end = parsed.night_end;

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, config: globalConfig }));
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ error: 'Invalid JSON request' }));
        }
      });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(globalConfig, null, 2));
  }

  // --- HTML Admin Pages ---
  if (urlPath === '/admin' || urlPath === '/' || urlPath === '/index.html') {
    const { renderAdminPortal } = require('../templates/admin');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.end(renderAdminPortal(globalConfig, latestTelemetry));
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.end('<h1>404 Not Found</h1><p><a href="/admin">Go to Admin</a></p>');
}

module.exports = handler;
