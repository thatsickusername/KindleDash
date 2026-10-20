const fs = require('fs');
const path = require('path');
const { loadConfig, saveConfig } = require('../services/config');
const { evaluateActiveScreens } = require('../services/scheduler');
const { getF1Data } = require('../services/f1');
const { getFigmaWeatherData } = require('../services/weather-figma');
const { getNewsFeed } = require('../services/news');
const { renderSmartwatchKiosk } = require('../templates/kiosk');
const { renderAdminPortal } = require('../templates/admin');

// Battery state cache with persistent local file fallback
const BATTERY_FILE = path.join(__dirname, '..', 'data', 'battery.json');

function loadBatteryState() {
  try {
    if (fs.existsSync(BATTERY_FILE)) {
      const raw = fs.readFileSync(BATTERY_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {
    level: 80,
    charging: false,
    updatedAt: Date.now()
  };
}

function saveBatteryState(state) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(BATTERY_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {}
}

let latestBatteryState = loadBatteryState();

async function handler(req, res) {
  // Parse URL & Query params
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
  if (urlPath === '/kiosk.css') {
    const cssPath = path.join(__dirname, '..', 'public', 'kiosk.css');
    try {
      const css = fs.readFileSync(cssPath, 'utf8');
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(css);
    } catch (err) {
      res.statusCode = 404;
      return res.end('/* CSS not found */');
    }
  }

  if (urlPath === '/figma-tokens.css') {
    const cssPath = path.join(__dirname, '..', 'public', 'figma-tokens.css');
    try {
      const css = fs.readFileSync(cssPath, 'utf8');
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(css);
    } catch (err) {
      res.statusCode = 404;
      return res.end('/* CSS not found */');
    }
  }

  if (urlPath === '/scaler.js') {
    const jsPath = path.join(__dirname, '..', 'public', 'scaler.js');
    try {
      const js = fs.readFileSync(jsPath, 'utf8');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(js);
    } catch (err) {
      res.statusCode = 404;
      return res.end('/* Scaler not found */');
    }
  }

  if (urlPath.startsWith('/figma-assets/')) {
    const assetPath = path.join(__dirname, '..', 'public', urlPath);
    try {
      const ext = path.extname(assetPath).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.jpg': 'image/jpeg',
        '.css': 'text/css'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(assetPath);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(fileBuffer);
    } catch (err) {
      res.statusCode = 404;
      return res.end('Asset not found');
    }
  }

  // --- API Endpoints ---

  // 1. /api/battery
  if (urlPath === '/api/battery') {
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
          if (typeof parsed.level === 'number' || !isNaN(parseInt(parsed.level, 10))) {
            const rawLevel = parseInt(parsed.level, 10);
            latestBatteryState = {
              level: Math.max(0, Math.min(100, rawLevel)),
              charging: parsed.charging === true || parsed.charging === 1 || parsed.charging === '1' || parsed.charging === 'Charging',
              updatedAt: Date.now()
            };
            saveBatteryState(latestBatteryState);
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, battery: latestBatteryState }));
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.end(JSON.stringify(latestBatteryState));
  }

  // 2. /api/config
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
          const newConfig = JSON.parse(body || '{}');
          if (!newConfig.screens || !Array.isArray(newConfig.screens)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'screens array is required' }));
          }
          saveConfig(newConfig);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ success: true, config: newConfig }));
        } catch (e) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(loadConfig()));
  }

  // 3. /api/active-screens
  if (urlPath === '/api/active-screens') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const config = loadConfig();
      const f1Data = await getF1Data();
      const evaluation = evaluateActiveScreens(config.screens, {
        now: new Date(),
        isF1QualiOrRaceDay: f1Data?.isQualiOrRaceDay,
        isF1Weekend: f1Data?.isQualiOrRaceDay
      });
      return res.end(JSON.stringify(evaluation));
    } catch (e) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // 4. /api/f1
  if (urlPath === '/api/f1') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const f1Data = await getF1Data();
      return res.end(JSON.stringify(f1Data));
    } catch (e) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // --- HTML Pages ---
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    // Admin Dashboard Route (/admin)
    if (urlPath === '/admin') {
      const config = loadConfig();
      const f1Data = await getF1Data().catch(() => null);
      return res.end(renderAdminPortal(config, latestBatteryState, f1Data));
    }

    // Direct app routes for backward compatibility
    if (urlPath === '/clock') {
      const { renderClock } = require('../templates/clock');
      return res.end(renderClock(Object.fromEntries(urlObj.searchParams)));
    }
    if (urlPath === '/weather') {
      const { renderFigmaWeather } = require('../templates/figma-weather');
      const weatherData = await getFigmaWeatherData().catch(() => null);
      return res.end(renderFigmaWeather(weatherData));
    }
    if (urlPath === '/news') {
      const { renderNews } = require('../templates/news');
      const newsItems = await getNewsFeed().catch(() => []);
      return res.end(renderNews(newsItems));
    }

    // Default Kindle Kiosk View (/)
    if (urlPath === '/' || urlPath === '/index.html') {
      const config = loadConfig();
      const [f1Data, weatherData, newsItems] = await Promise.all([
        getF1Data().catch(() => null),
        getFigmaWeatherData().catch(() => null),
        getNewsFeed().catch(() => [])
      ]);

      const now = new Date();
      const timeData = {
        timeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        dateStr: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
      };

      const { activeScreens, defaultFocusIndex } = evaluateActiveScreens(config.screens, {
        now,
        isF1QualiOrRaceDay: f1Data?.isQualiOrRaceDay,
        isF1Weekend: f1Data?.isQualiOrRaceDay
      });

      return res.end(renderSmartwatchKiosk({
        activeScreens,
        defaultFocusIndex,
        data: {
          weatherData,
          f1Data,
          newsItems,
          timeData,
          timeZone: config.general?.timezone || process.env.KINDLE_TIMEZONE || 'Asia/Kolkata'
        }
      }));
    }

    res.statusCode = 404;
    return res.end('<html><body><h1>404 Not Found</h1><p><a href="/">Go to Kiosk</a> | <a href="/admin">Go to Admin</a></p></body></html>');
  } catch (error) {
    res.statusCode = 500;
    return res.end(`<html><body><h1>Server Error</h1><pre>${error.stack || error.message}</pre></body></html>`);
  }
}

module.exports = handler;
