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

function renderSmartwatchKiosk({ activeScreens, defaultFocusIndex, data }) {
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

      // Hardware E-Ink Inversion Flash Routine
      function triggerEinkFlash(callback) {
        if (!flashEl) {
          if (callback) callback();
          return;
        }
        flashEl.style.display = 'block';
        setTimeout(function() {
          flashEl.style.backgroundColor = '#ffffff';
          setTimeout(function() {
            flashEl.style.display = 'none';
            flashEl.style.backgroundColor = '#000000';
            if (callback) callback();
          }, 60);
        }, 60);
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

      // 3. Dynamic Live Telemetry Poller (/api/battery)
      function syncServerBattery() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/battery', true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            try {
              var data = JSON.parse(xhr.responseText);
              if (data && typeof data.level === 'number') {
                updateBatteryDisplay(data.level, !!data.charging);
                try {
                  localStorage.setItem('kindle_batt_level', data.level);
                  localStorage.setItem('kindle_batt_charging', data.charging ? 'true' : 'false');
                } catch (e) {}
              }
            } catch (err) {}
          }
        };
        xhr.send();
      }
      syncServerBattery();
      setInterval(syncServerBattery, 60000);

      // Background Schedule check (every 5 mins) to reload if active screens change
      setInterval(async function() {
        try {
          var res = await fetch('/api/active-screens');
          if (res.ok) {
            var fresh = await res.json();
            if (fresh.activeScreens && fresh.activeScreens.length !== total) {
              window.location.reload();
            }
          }
        } catch (e) {}
      }, 300000);
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
