const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

const DEFAULT_CONFIG = {
  general: {
    city: 'San Francisco',
    lat: 37.7749,
    lon: -122.4194,
    units: 'celsius',
    rssFeedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    refreshMinutes: 30,
    timezone: 'Asia/Kolkata'
  },
  screens: [
    {
      id: 'screen-clock',
      title: 'Clock',
      type: 'clock',
      enabled: true,
      schedule: {
        type: 'always'
      }
    },
    {
      id: 'screen-weather-full',
      title: 'Weather',
      type: 'fullscreen-weather',
      enabled: true,
      schedule: {
        type: 'always'
      }
    },
    {
      id: 'screen-f1-standings',
      title: 'Formula 1',
      type: 'fullscreen-f1',
      enabled: true,
      schedule: {
        type: 'always' // F1 screen is now ALWAYS visible in rotation
      }
    },
    {
      id: 'screen-news-full',
      title: 'World News',
      type: 'fullscreen-news',
      enabled: true,
      schedule: {
        type: 'always'
      }
    }
  ]
};

let inMemoryConfig = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Config] Could not create data directory:', err.message);
  }
}

function loadConfig() {
  if (inMemoryConfig) {
    return inMemoryConfig;
  }

  ensureDataDir();

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      inMemoryConfig = JSON.parse(raw);
      // Clean up legacy bento overview screens if present
      if (inMemoryConfig.screens) {
        inMemoryConfig.screens = inMemoryConfig.screens.filter(s => s.id !== 'screen-bento-overview' && s.type !== 'bento');
        // Ensure clock is present
        if (!inMemoryConfig.screens.some(s => s.type === 'clock' || s.id === 'screen-clock')) {
          inMemoryConfig.screens.unshift(DEFAULT_CONFIG.screens[0]);
        }
      }
      return inMemoryConfig;
    }
  } catch (err) {
    console.error('[Config] Failed to read config.json, falling back to defaults:', err.message);
  }

  inMemoryConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  saveConfig(inMemoryConfig);
  return inMemoryConfig;
}

function saveConfig(newConfig) {
  inMemoryConfig = newConfig;
  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    console.warn('[Config] Could not write config.json (falling back to memory):', err.message);
    return { success: true, persisted: false, warning: err.message };
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  DEFAULT_CONFIG
};
