// Dynamic Screen Resolution Scaler & E-Ink Anti-Ghosting Utility
(function () {
  function applyScaling() {
    var width = window.innerWidth || document.documentElement.clientWidth || screen.width || 600;
    // Base resolution design reference: 600px width (Kindle 10th Gen Basic) -> 16px font-size
    // Paperwhite 10th Gen (1072px width) -> ~28.5px font-size
    var baseFontSize = (width / 600) * 16;
    if (baseFontSize < 14) baseFontSize = 14;
    document.documentElement.style.fontSize = baseFontSize + 'px';
  }

  // Run immediately and on resize/orientationchange
  applyScaling();
  window.addEventListener('resize', applyScaling);
  window.addEventListener('orientationchange', applyScaling);

  // Anti-Ghosting Inversion Routine (400ms pure black flash)
  window.triggerAntiGhosting = function (callback) {
    var overlay = document.getElementById('flash-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'flash-overlay';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
    setTimeout(function () {
      overlay.style.display = 'none';
      if (typeof callback === 'function') callback();
    }, 400);
  };

  // Auto de-ghosting every 30 minutes
  setInterval(function () {
    window.triggerAntiGhosting();
  }, 1800000);

  // Soft exit trigger function
  window.triggerKindleExit = function () {
    // 1. Standard Chromium window.close()
    try {
      window.close();
    } catch (e) {}

    // 2. Trigger file download to /tmp or browser directory
    try {
      var a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,exit';
      a.download = 'kindledash_exit';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {}

    // 3. Visual feedback
    var overlay = document.getElementById('flash-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      overlay.innerHTML = '<div style="color:white; font-family:sans-serif; font-size:24px; text-align:center; margin-top:40vh;">Exiting to Kindle Home...</div>';
    }
  };
})();
