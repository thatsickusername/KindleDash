function renderFigmaShell({ title, headExtras = '', bodyContent, currentAppName = 'Weather Delhi', backUrl = '/' }) {
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

    <!-- Reusable Common Bottom Bar across all apps -->
    <div class="common-bottom-bar-wrapper">
      <nav class="common-bottom-bar">
        <a href="${backUrl}" class="bar-btn-back" aria-label="Go Back">Back</a>
        <span class="bar-title">${currentAppName}</span>
      </nav>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { renderFigmaShell };
