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

  // E-Ink Inversion Waveform Routine (350ms Pure Black -> 150ms Pure White -> Restore)
  // Forces all microcapsules to flip and cancel residual electrostatic charge
  window.triggerAntiGhosting = function (callback) {
    var overlay = document.getElementById('flash-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'flash-overlay';
      document.body.appendChild(overlay);
    }

    // Phase 1: Pure Black
    overlay.style.backgroundColor = '#000000';
    overlay.style.display = 'block';

    setTimeout(function () {
      // Phase 2: Pure White
      overlay.style.backgroundColor = '#ffffff';

      setTimeout(function () {
        // Complete cycle
        overlay.style.display = 'none';
        if (typeof callback === 'function') callback();
      }, 150);
    }, 350);
  };

  // Schedule anti-ghosting waveform every 15 minutes at :00, :15, :30, :45
  function scheduleNextFlash() {
    var now = new Date();
    var curM = now.getMinutes();
    var curS = now.getSeconds();
    var curMs = now.getMilliseconds();

    var nextQuarter = (Math.floor(curM / 15) + 1) * 15;
    var minutesToWait = nextQuarter - curM;
    var msToWait = (minutesToWait * 60 - curS) * 1000 - curMs;

    if (msToWait <= 0) msToWait = 15 * 60 * 1000;

    setTimeout(function () {
      window.triggerAntiGhosting();
      // Continue periodically every 15 minutes
      setInterval(function () {
        window.triggerAntiGhosting();
      }, 15 * 60 * 1000);
    }, msToWait);
  }

  scheduleNextFlash();
})();
