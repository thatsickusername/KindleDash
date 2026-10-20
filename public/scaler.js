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

  // Hyper-optimized E-Ink Inversion Waveform Routine (Single 80ms pure black pulse)
  // Forces microcapsules to flip and cancel residual electrostatic charge without multiple redraw passes
  window.triggerAntiGhosting = function (callback) {
    var overlay = document.getElementById('flash-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'flash-overlay';
      document.body.appendChild(overlay);
    }

    overlay.style.backgroundColor = '#000000';
    overlay.style.display = 'block';

    setTimeout(function () {
      overlay.style.display = 'none';
      if (typeof callback === 'function') callback();
    }, 80);
  };

  // NOTE: Periodic 15-minute background flash schedule has been deliberately removed
  // to avoid waking the CPU and rasterizer while displaying static E-Ink content.
  // Anti-ghosting inversion is triggered strictly on-demand (e.g. user tap/carousel switch).
})();
