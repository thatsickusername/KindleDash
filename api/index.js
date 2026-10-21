const fs = require('fs');
const path = require('path');
const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');

const { getWeatherData } = require('../services/weather');
const { generateClockLayout, generateWeatherLayout } = require('../services/satori-templates');

// Monolithic In-Memory State for MVP
let globalConfig = {
  active_view: 'clock', // 'clock' | 'weather'
  refresh_interval: 900
};

// Font Buffers for Satori (Loaded once into memory)
const FONT_REGULAR_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Inter-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Inter-Bold.ttf');

let fontRegularBuffer = null;
let fontBoldBuffer = null;

try {
  if (fs.existsSync(FONT_REGULAR_PATH)) {
    fontRegularBuffer = fs.readFileSync(FONT_REGULAR_PATH);
  }
  if (fs.existsSync(FONT_BOLD_PATH)) {
    fontBoldBuffer = fs.readFileSync(FONT_BOLD_PATH);
  }
  console.log('[KindleDash SSR] Fonts initialized successfully into memory.');
} catch (err) {
  console.error('[KindleDash SSR] Warning: Failed to pre-load fonts:', err);
}

function getFontConfig() {
  const fonts = [];
  if (fontRegularBuffer) {
    fonts.push({
      name: 'Inter',
      data: fontRegularBuffer,
      weight: 400,
      style: 'normal'
    });
  }
  if (fontBoldBuffer) {
    fonts.push({
      name: 'Inter',
      data: fontBoldBuffer,
      weight: 700,
      style: 'normal'
    });
  }
  return fonts;
}

// Cached weather in memory to prevent rate-limits on every render
let cachedWeather = null;
let lastWeatherFetch = 0;

async function getOrFetchWeather() {
  const now = Date.now();
  if (cachedWeather && (now - lastWeatherFetch < 600000)) { // 10 min cache
    return cachedWeather;
  }
  try {
    const raw = await getWeatherData(28.6139, 77.2090); // Delhi coordinates
    cachedWeather = {
      cityName: 'New Delhi',
      temperature: raw.temp,
      conditionText: raw.desc,
      highTemp: raw.tempMax,
      lowTemp: raw.tempMin,
      humidity: raw.humidity,
      windSpeed: raw.windSpeed,
      uvIndex: 4
    };
    lastWeatherFetch = now;
    return cachedWeather;
  } catch (e) {
    return cachedWeather || {
      cityName: 'New Delhi',
      temperature: 26,
      conditionText: 'Clear Sky',
      highTemp: 29,
      lowTemp: 18,
      humidity: 60,
      windSpeed: 10,
      uvIndex: 4
    };
  }
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

  // 1. /api/display (Kindle TRMNL/FBInk endpoint)
  if (urlPath === '/api/display') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const hostHeader = req.headers.host || 'kindledashboard.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || (hostHeader.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = `${proto}://${hostHeader}`;

    const responsePayload = {
      image_url: `${baseUrl}/api/render-image`,
      refresh_rate: Number(globalConfig.refresh_interval) || 900
    };

    res.statusCode = 200;
    return res.end(JSON.stringify(responsePayload, null, 2));
  }

  // 2. /api/render-image (Dynamic E-Ink Satori -> Resvg PNG Generator)
  if (urlPath === '/api/render-image') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    try {
      let layoutElement;
      if (globalConfig.active_view === 'weather') {
        const weather = await getOrFetchWeather();
        layoutElement = generateWeatherLayout(weather);
      } else {
        layoutElement = generateClockLayout('Asia/Kolkata');
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

  // 3. /api/config (Read & Mutate In-Memory State)
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
          // Can accept JSON or form URL-encoded
          let parsed;
          if (req.headers['content-type']?.includes('application/json')) {
            parsed = JSON.parse(body || '{}');
          } else {
            const params = new URLSearchParams(body);
            parsed = Object.fromEntries(params);
          }

          if (parsed.active_view && ['clock', 'weather'].includes(parsed.active_view)) {
            globalConfig.active_view = parsed.active_view;
          }
          if (parsed.refresh_interval) {
            const interval = parseInt(parsed.refresh_interval, 10);
            if (!isNaN(interval) && interval >= 60) {
              globalConfig.refresh_interval = interval;
            }
          }

          console.log('[KindleDash State Update]', globalConfig);

          // If standard browser form post, redirect back to /admin
          if (!req.headers['content-type']?.includes('application/json')) {
            res.statusCode = 302;
            res.setHeader('Location', '/admin');
            return res.end();
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, config: globalConfig }));
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(globalConfig, null, 2));
  }

  // --- HTML / Admin Pages ---
  if (urlPath === '/admin') {
    const { renderAdminPortal } = require('../templates/admin');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.end(renderAdminPortal(globalConfig));
  }

  // Default redirect / to /admin or render admin directly
  if (urlPath === '/' || urlPath === '/index.html') {
    const { renderAdminPortal } = require('../templates/admin');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(renderAdminPortal(globalConfig));
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.end('<h1>404 Not Found</h1><p><a href="/admin">Go to Admin</a></p>');
}

module.exports = handler;
