const fs = require('fs');
const path = require('path');
const { renderLauncher } = require('../templates/launcher');
const { renderClock } = require('../templates/clock');
const { renderWeather } = require('../templates/weather');
const { renderFigmaWeather } = require('../templates/figma-weather');
const { renderTodo } = require('../templates/todo');
const { renderNews } = require('../templates/news');
const { getWeatherData } = require('../services/weather');
const { getFigmaWeatherData } = require('../services/weather-figma');
const { getNewsFeed } = require('../services/news');

// In-memory battery state cache
let latestBatteryState = {
  level: null,
  charging: false,
  updatedAt: null
};

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

  // Handle static assets
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

  // Handle static assets
  if (urlPath === '/style.css') {
    const cssPath = path.join(__dirname, '..', 'public', 'style.css');
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

  // Handle Dynamic Battery Telemetry Endpoint (/api/battery)
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
      req.on('data', chunk => {
        body += chunk;
      });
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

    // Default: GET
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.end(JSON.stringify(latestBatteryState));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    switch (urlPath) {
      case '/':
      case '/index.html':
        return res.end(renderLauncher(Object.fromEntries(urlObj.searchParams)));

      case '/clock':
        return res.end(renderClock(Object.fromEntries(urlObj.searchParams)));

      case '/weather': {
        const weatherData = await getFigmaWeatherData();
        return res.end(renderFigmaWeather(weatherData));
      }

      case '/todo':
        return res.end(renderTodo());

      case '/news': {
        const newsItems = await getNewsFeed();
        return res.end(renderNews(newsItems));
      }

      default:
        res.statusCode = 404;
        return res.end(renderLauncher());
    }
  } catch (error) {
    res.statusCode = 500;
    return res.end(`<html><body><h1>Server Error</h1><pre>${error.stack || error.message}</pre></body></html>`);
  }
}

module.exports = handler;
