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

async function handler(req, res) {
  // In Vercel serverless with rewrites, req.url may be rewritten to '/api/index.js'
  // Vercel passes the original path in headers like 'x-matched-path' or 'x-now-route-matches'
  let urlPath = req.headers['x-matched-path'] || req.url || '/';
  if (urlPath.includes('?')) {
    urlPath = urlPath.split('?')[0];
  }
  // If invoked directly as /api or /api/index.js without x-matched-path, check req.query or fallback
  if (urlPath === '/api/index.js' || urlPath === '/api') {
    urlPath = '/';
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

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    switch (urlPath) {
      case '/':
      case '/index.html':
        return res.end(renderLauncher());

      case '/clock':
        return res.end(renderClock());

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
