function renderAppShell({ 
  title, 
  headExtras = '', 
  bodyContent, 
  showBottomBar = true, 
  currentAppName = 'App', 
  backUrl = '/',
  rightSlotHtml = '' 
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title || 'KindleDash'}</title>
  <link rel="stylesheet" href="/figma-tokens.css">
  <script src="/scaler.js"></script>
  ${headExtras}
</head>
<body>
  <div id="flash-overlay"></div>
  <div class="device-screen">
    ${bodyContent}

    ${showBottomBar ? `
    <!-- Reusable Slim Common Bottom Bar across all apps -->
    <div class="common-bottom-bar-wrapper">
      <nav class="common-bottom-bar">
        <!-- Left: Back Button -->
        <a href="${backUrl}" class="bar-btn-back" aria-label="Go Back">Back</a>
        
        <!-- Center: Minimal Battery Indicator Container -->
        <div id="bar-battery-wrap" class="bar-battery" style="display: none;">
          <div class="bar-battery-pill">
            <div id="bar-battery-fill" class="bar-battery-fill"></div>
          </div>
          <span id="bar-battery-text" class="bar-battery-text">--%</span>
        </div>

        <!-- Right: Application Name -->
        <div style="display: flex; align-items: center; gap: 10px;">
          ${rightSlotHtml}
          <span class="bar-title">${currentAppName}</span>
        </div>
      </nav>
    </div>
    ` : ''}
  </div>

  <script>
    // Universal Kindle Battery Indicator Updater
    (function() {
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

      // Check URL query param first (?batt=85&charging=1)
      var params = new URLSearchParams(window.location.search);
      if (params.has('batt')) {
        var b = parseInt(params.get('batt'), 10);
        var chg = params.get('charging') === '1' || params.get('charging') === 'true';
        if (!isNaN(b)) {
          updateBatteryDisplay(b, chg);
          return;
        }
      }

      // Check HTML5 standard Battery API if supported by Kindle Chromium
      if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
          updateBatteryDisplay(battery.level * 100, battery.charging);
          battery.addEventListener('levelchange', function() {
            updateBatteryDisplay(battery.level * 100, battery.charging);
          });
          battery.addEventListener('chargingchange', function() {
            updateBatteryDisplay(battery.level * 100, battery.charging);
          });
        }).catch(function() {});
      }
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderAppShell, renderFigmaShell: renderAppShell };
