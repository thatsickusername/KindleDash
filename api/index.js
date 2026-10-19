const fs = require('fs');
const path = require('path');
const { renderLauncher } = require('../templates/launcher');
const { renderClock } = require('../templates/clock');
const { renderWeather } = require('../templates/weather');
const { renderTodo } = require('../templates/todo');
const { renderNews } = require('../templates/news');
const { getWeatherData } = require('../services/weather');
const { getNewsFeed } = require('../services/news');

async function handler(req, res) {
  const urlPath = req.url ? req.url.split('?')[0] : '/';

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
        const weatherData = await getWeatherData();
        return res.end(renderWeather(weatherData));
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
