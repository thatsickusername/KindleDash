const { renderClockContent } = require('./clock');
const { renderF1Screen } = require('./screens/f1');
const { getFigmaWeatherBody } = require('./figma-weather');
const { getNewsBody } = require('./news');

function renderFace(screen, data) {
  switch (screen.type) {
    case 'clock':
    case 'fullscreen-clock':
      return renderClockContent({ tz: data.timeZone, f1Data: data.f1Data });
    case 'fullscreen-weather':
      return getFigmaWeatherBody(data.weatherData);
    case 'fullscreen-f1':
      return renderF1Screen(data.f1Data);
    case 'fullscreen-news':
      return getNewsBody(data.newsItems);
    default:
      return `<div class="face-empty">Unknown face: ${screen.type}</div>`;
  }
}

function renderNightSleepScreen() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=600, height=800, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>KindleDash // Rest</title>
  <link rel="stylesheet" href="/figma-tokens.css">
  <link rel="stylesheet" href="/kiosk.css">
  <script src="/scaler.js" defer></script>
</head>
<body class="kiosk-body" style="background-color: #000000; color: #ffffff; overflow: hidden;">
  <div class="device-screen" id="device-screen" style="
    width: 600px;
    height: 800px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    box-sizing: border-box;
    background-color: #000000;
  ">
    <!-- Clean Minimalist Crescent Moon & Starfield Vector (Inverted High-Contrast White) -->
    <div style="margin-bottom: 40px; display: flex; justify-content: center; align-items: center;">
      <svg width="170" height="170" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Bolder Crescent Moon -->
        <path d="M48 14C29 21 19 42 25 61C31 79 51 90 71 84C57 91 37 86 26 74C13 61 13 39 26 26C33 19 40 15 48 14Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Star 1 (Bolder Top Right) -->
        <path d="M73 17L76 25L84 27.5L76 30L73 38L70 30L62 27.5L70 25L73 17Z" fill="#ffffff"/>
        <!-- Star 2 (Bolder Middle Right) -->
        <path d="M85 45L87 50L92 52L87 54L85 59L83 54L78 52L83 50L85 45Z" fill="#ffffff"/>
        <!-- Star 3 (Lower Center Glow Dot) -->
        <circle cx="58" cy="48" r="3.5" fill="#ffffff"/>
        <!-- Star 4 (Bolder Bottom Right) -->
        <path d="M70 65L72 70L77 71.5L72 73L70 78L68 73L63 71.5L68 70L70 65Z" fill="#ffffff"/>
        <!-- Star 5 (Accent Top Left) -->
        <circle cx="20" cy="18" r="2.5" fill="#ffffff"/>
      </svg>
    </div>

    <!-- Bold & Italicized High-Contrast Typography -->
    <div style="
      font-family: var(--font-main);
      font-size: 38px;
      font-weight: 800;
      font-style: italic;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin-bottom: 16px;
      text-align: center;
      line-height: 1.15;
    ">
      Good night. Sleep well.
    </div>

    <div style="
      font-family: var(--font-main);
      font-size: 18px;
      font-weight: 700;
      color: #d0d0d0;
      text-align: center;
      letter-spacing: 0.3px;
    ">
      Passive display resting until morning
    </div>
  </div>

  <script>
    (function() {
      // Carousel interaction completely locked during night mode
      document.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, true);

      document.addEventListener('touchstart', function(e) {
        e.preventDefault();
      }, { passive: false });

      // Check once an hour if morning has arrived (07:00) to reload full daytime kiosk
      setInterval(function() {
        var hr = new Date().getHours();
        if (hr >= 7 && hr < 23) {
          window.location.reload();
        }
      }, 1800000);
    })();
  </script>
</body>
</html>`;
}

function renderSmartwatchKiosk({ activeScreens, defaultFocusIndex, data }) {
  // Check if night mode is currently active (23:00 to 07:00)
  const currentHour = new Date().getHours();
  if (currentHour >= 23 || currentHour < 7) {
    return renderNightSleepScreen();
  }
  const screensJson = JSON.stringify(activeScreens.map(s => ({
    id: s.id,
    title: s.title,
    type: s.type
  })));

  const renderedCards = activeScreens.map((screen, idx) => `
    <div class="watch-face-card ${idx === defaultFocusIndex ? 'active' : ''}" 
         data-index="${idx}" 
         data-id="${screen.id}" 
         data-title="${escapeHtml(screen.title)}">
      ${renderFace(screen, data)}
    </div>
  `).join('');

  const initialTitle = activeScreens[defaultFocusIndex]?.title || 'Clock';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=600, height=800, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>KindleDash</title>
  <link rel="stylesheet" href="/figma-tokens.css">
  <link rel="stylesheet" href="/kiosk.css">
  <script src="/scaler.js" defer></script>
</head>
<body class="kiosk-body">
  <div id="flash-overlay"></div>
  <div class="device-screen" id="device-screen">
    <!-- Screen Carousel Area (Click anywhere to cycle) -->
    <main class="faces-viewport" id="faces-viewport">
      ${renderedCards}
    </main>

    <!-- Exact Figma Common Bottom Bar (No back button, no center dots) -->
    <div class="common-bottom-bar-wrapper">
      <nav class="common-bottom-bar">
        <!-- Left: Current Screen Title -->
        <span class="bar-title" id="bar-title">${escapeHtml(initialTitle)}</span>

        <!-- Right: Original High-Contrast Battery Indicator (Fill + Text) -->
        <div id="bar-battery-wrap" class="bar-battery" style="display: none;">
          <div class="bar-battery-pill" style="margin-right: 12px;">
            <div id="bar-battery-fill" class="bar-battery-fill"></div>
          </div>
          <span id="bar-battery-text" class="bar-battery-text">--%</span>
        </div>
      </nav>
    </div>
  </div>

  <script>
    (function() {
      const screens = ${screensJson};
      let currentIndex = ${defaultFocusIndex};
      const total = screens.length;

      const cards = document.querySelectorAll('.watch-face-card');
      const titleEl = document.getElementById('bar-title');
      const flashEl = document.getElementById('flash-overlay');

      // Hyper-optimized E-Ink Inversion Flash Routine (Single 80ms pure black pulse)
      function triggerEinkFlash(callback) {
        if (!flashEl) {
          if (callback) callback();
          return;
        }
        flashEl.style.backgroundColor = '#000000';
        flashEl.style.display = 'block';
        setTimeout(function() {
          flashEl.style.display = 'none';
          if (callback) callback();
        }, 80);
      }

      function updateActiveScreen(newIndex) {
        if (total === 0) return;
        currentIndex = (newIndex + total) % total;

        cards.forEach((card, idx) => {
          if (idx === currentIndex) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });

        // Update Screen Title on Left
        const activeScreen = screens[currentIndex];
        if (activeScreen && titleEl) {
          titleEl.textContent = activeScreen.title;
        }
      }

      // Tap / Click anywhere on screen to cycle to next screen
      document.addEventListener('click', function(e) {
        if (e.target.closest('button, a, input, select')) return;

        triggerEinkFlash(function() {
          updateActiveScreen(currentIndex + 1);
        });
      });

      // Horizontal swipe detection for touch
      var touchStartX = 0;
      var touchStartY = 0;
      document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      document.addEventListener('touchend', function(e) {
        var diffX = e.changedTouches[0].screenX - touchStartX;
        var diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
          triggerEinkFlash(function() {
            if (diffX < 0) {
              updateActiveScreen(currentIndex + 1);
            } else {
              updateActiveScreen(currentIndex - 1);
            }
          });
        }
      }, { passive: true });

      // Original High-Contrast Battery Indicator Logic
      function updateBatteryDisplay(level, isCharging) {
        var wrap = document.getElementById('bar-battery-wrap');
        var fill = document.getElementById('bar-battery-fill');
        var text = document.getElementById('bar-battery-text');
        if (!wrap || !fill || !text) return;

        var pct = Math.max(0, Math.min(100, Math.round(level)));
        text.textContent = pct + '%' + (isCharging ? '⚡' : '');
        fill.style.width = pct + '%';
        wrap.style.display = 'flex';
      }

      // 1. Immediately restore cached battery state from storage
      try {
        var cachedLevel = localStorage.getItem('kindle_batt_level');
        var cachedCharging = localStorage.getItem('kindle_batt_charging') === 'true';
        if (cachedLevel !== null && cachedLevel !== '') {
          var parsedLevel = parseInt(cachedLevel, 10);
          if (!isNaN(parsedLevel)) {
            updateBatteryDisplay(parsedLevel, cachedCharging);
          }
        }
      } catch (e) {}

      // 2. Check URL query params (?batt=85&charging=1)
      var params = new URLSearchParams(window.location.search);
      if (params.has('batt')) {
        var b = parseInt(params.get('batt'), 10);
        var chg = params.get('charging') === '1' || params.get('charging') === 'true' || params.get('charging') === 'Charging';
        if (!isNaN(b)) {
          updateBatteryDisplay(b, chg);
          try {
            localStorage.setItem('kindle_batt_level', b);
            localStorage.setItem('kindle_batt_charging', chg ? 'true' : 'false');
          } catch (e) {}
        }
      }

      // Background Schedule check: 1-hour interval (3,600,000ms), bypassed during night hours (23:00 to 07:00)
      function isNightTime() {
        var hr = new Date().getHours();
        return hr >= 23 || hr < 7;
      }

      setInterval(async function() {
        if (isNightTime()) return; // Sleep quietly during night hours to conserve power
        try {
          var res = await fetch('/api/active-screens');
          if (res.ok) {
            var fresh = await res.json();
            if (fresh.activeScreens && fresh.activeScreens.length !== total) {
              window.location.reload();
            }
          }
        } catch (e) {}
      }, 3600000);
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  renderSmartwatchKiosk
};
