function renderHtmlShell({ title, headExtras = '', bodyContent, showActionBar = true, appName = '', backUrl = '/' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title || 'KindleDash'}</title>
  <link rel="stylesheet" href="/style.css">
  <script src="/scaler.js"></script>
  ${headExtras}
</head>
<body>
  <div id="flash-overlay"></div>
  <div class="app-container">
    ${bodyContent}
    ${showActionBar ? `
    <footer class="action-bar">
      <a href="${backUrl}" class="action-bar-btn tactile" aria-label="Go Back">
        &#9664; BACK
      </a>
      <div style="display: flex; align-items: stretch;">
        <button onclick="window.triggerAntiGhosting()" class="action-bar-btn tactile" style="border-right: none; border-left: var(--border-thick); font-size: 0.9rem;" title="Reset E-Ink display">
          &#8635; CLEAR
        </button>
        <div class="action-bar-title" style="border-left: var(--border-thick);">
          APP // ${appName || 'SCREEN'}
        </div>
      </div>
    </footer>
    ` : ''}
  </div>
</body>
</html>`;
}

module.exports = { renderHtmlShell };
