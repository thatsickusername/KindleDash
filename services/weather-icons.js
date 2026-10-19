/**
 * High-Contrast Monochrome E-Ink Weather SVG Icon Library
 * Designed specifically for 600x800 Kindle 10th Gen displays.
 * Hero icons: 200x200px (Stroke ~12-14px)
 * Row/Forecast icons: 34x34px (Stroke ~2.5-3px)
 */

const COLOR_INK = '#111111';

// -------------------------------------------------------------
// Small Row / Forecast Icons (34x34px)
// -------------------------------------------------------------

function getSmallSun() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="17" cy="17" r="6.375" stroke="${COLOR_INK}" stroke-width="2.55"/>
    <path d="M17 3V6.5M17 27.5V31M3 17H6.5M27.5 17H31" stroke="${COLOR_INK}" stroke-width="2.55" stroke-linecap="round"/>
    <path d="M7.1 7.1L9.6 9.6M24.4 24.4L26.9 26.9M7.1 26.9L9.6 24.4M24.4 9.6L26.9 7.1" stroke="${COLOR_INK}" stroke-width="2.55" stroke-linecap="round"/>
  </svg>`;
}

function getSmallMoon() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.5 18.4A10.2 10.2 0 1 1 15.6 8.5 8.5 8.5 0 0 0 25.5 18.4Z" stroke="${COLOR_INK}" stroke-width="2.55" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getSmallPartlyCloudy() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 14A5 5 0 0 1 20 8.5M14 6V4M7.5 12H5.5M8.5 8.5L7 7" stroke="${COLOR_INK}" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M11 25H25A5 5 0 0 0 25 15A6.5 6.5 0 0 0 12.5 17A4.5 4.5 0 0 0 11 25Z" stroke="${COLOR_INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getSmallCloud() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 25H25A5 5 0 0 0 25 15A6.5 6.5 0 0 0 12.5 17A4.5 4.5 0 0 0 9 25Z" stroke="${COLOR_INK}" stroke-width="2.55" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getSmallRain() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 20H24A4.5 4.5 0 0 0 24 11A6 6 0 0 0 12.5 13A4 4 0 0 0 8 20Z" stroke="${COLOR_INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 24L9 28M16 24L15 28M22 24L21 28" stroke="${COLOR_INK}" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

function getSmallThunderstorm() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 19H24A4.5 4.5 0 0 0 24 10A6 6 0 0 0 12.5 12A4 4 0 0 0 8 19Z" stroke="${COLOR_INK}" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M16 19L13.5 24H18.5L16 29" stroke="${COLOR_INK}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getSmallSnow() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 19H24A4.5 4.5 0 0 0 24 10A6 6 0 0 0 12.5 12A4 4 0 0 0 8 19Z" stroke="${COLOR_INK}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M11 25V27M17 25V27M23 25V27" stroke="${COLOR_INK}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function getSmallFog() {
  return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 13H28M4 18H30M7 23H27" stroke="${COLOR_INK}" stroke-width="2.55" stroke-linecap="round"/>
  </svg>`;
}

// Fixed metrics icons from design
function getThermometerIcon() {
  return `<svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4 20.4V5.7C15.4 3.8 13.9 2.3 12 2.3C10.1 2.3 8.6 3.8 8.6 5.7V20.4C6.6 21.9 5.9 24.4 6.6 26.7C7.4 29 9.6 30.6 12 30.6C14.4 30.6 16.6 29 17.4 26.7C18.1 24.4 17.4 21.9 15.4 20.4Z" stroke="${COLOR_INK}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="12" cy="24.9" r="3.2" fill="${COLOR_INK}"/>
    <path d="M12 13.6V21.5" stroke="${COLOR_INK}" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`;
}

function getHumidityDropletIcon() {
  return `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 6C11 6 7 11 7 14.5C7 16.7 8.8 18.5 11 18.5C13.2 18.5 15 16.7 15 14.5C15 11 11 6 11 6Z" fill="${COLOR_INK}"/>
    <circle cx="19.5" cy="11.5" r="2.8" fill="${COLOR_INK}"/>
    <circle cx="19" cy="20.5" r="3.2" fill="${COLOR_INK}"/>
  </svg>`;
}

// -------------------------------------------------------------
// Large Hero Weather Icons (200x200px)
// -------------------------------------------------------------

function getHeroSun() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="42" stroke="${COLOR_INK}" stroke-width="14"/>
    <path d="M100 16V34M100 166V184M16 100H34M166 100H184" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M40.6 40.6L53.3 53.3M146.7 146.7L159.4 159.4M40.6 159.4L53.3 146.7M146.7 53.3L159.4 40.6" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round"/>
  </svg>`;
}

function getHeroMoon() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M148 112A60 60 0 1 1 88 52A50 50 0 0 0 148 112Z" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getHeroPartlyCloudy(isDay = true) {
  if (!isDay) {
    return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M115 50A36 36 0 0 0 76 96" stroke="${COLOR_INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M56 160H150A34 34 0 0 0 150 92A48 48 0 0 0 66 104A32 32 0 0 0 56 160Z" fill="#ffffff" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  // The iconic Figma hero visual
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M72 82A40 40 0 0 1 115 45M100 18V28M42 42L49 49M144 58L153 50" stroke="${COLOR_INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M52 160H150A34 34 0 0 0 150 92A48 48 0 0 0 66 104A32 32 0 0 0 52 160Z" fill="#ffffff" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getHeroCloud() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M54 156H152A36 36 0 0 0 152 84A50 50 0 0 0 66 96A34 34 0 0 0 54 156Z" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getHeroRain() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 135H152A32 32 0 0 0 152 71A46 46 0 0 0 72 81A30 30 0 0 0 48 135Z" stroke="${COLOR_INK}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M65 158L55 178M105 158L95 178M145 158L135 178" stroke="${COLOR_INK}" stroke-width="12" stroke-linecap="round"/>
  </svg>`;
}

function getHeroThunderstorm() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 130H152A32 32 0 0 0 152 66A46 46 0 0 0 72 76A30 30 0 0 0 48 130Z" stroke="${COLOR_INK}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M102 128L86 156H114L98 184" stroke="${COLOR_INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function getHeroSnow() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 132H152A32 32 0 0 0 152 68A46 46 0 0 0 72 78A30 30 0 0 0 48 132Z" stroke="${COLOR_INK}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="68" cy="165" r="7" fill="${COLOR_INK}"/>
    <circle cx="106" cy="165" r="7" fill="${COLOR_INK}"/>
    <circle cx="144" cy="165" r="7" fill="${COLOR_INK}"/>
  </svg>`;
}

function getHeroFog() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 75H165M25 105H175M40 135H160" stroke="${COLOR_INK}" stroke-width="14" stroke-linecap="round"/>
  </svg>`;
}

// -------------------------------------------------------------
// Mapping Function by WMO Weather Code
// -------------------------------------------------------------

function mapWmoToIcons(code, isDay = true) {
  // 0: Clear
  if (code === 0) {
    return {
      hero: isDay ? getHeroSun() : getHeroMoon(),
      small: isDay ? getSmallSun() : getSmallMoon()
    };
  }
  // 1, 2: Mainly Clear / Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      hero: getHeroPartlyCloudy(isDay),
      small: getSmallPartlyCloudy()
    };
  }
  // 3: Overcast
  if (code === 3) {
    return {
      hero: getHeroCloud(),
      small: getSmallCloud()
    };
  }
  // 45, 48: Fog
  if (code === 45 || code === 48) {
    return {
      hero: getHeroFog(),
      small: getSmallFog()
    };
  }
  // 51-67, 80-82: Drizzle & Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      hero: getHeroRain(),
      small: getSmallRain()
    };
  }
  // 71-77, 85-86: Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      hero: getHeroSnow(),
      small: getSmallSnow()
    };
  }
  // 95-99: Thunderstorm
  if (code >= 95) {
    return {
      hero: getHeroThunderstorm(),
      small: getSmallThunderstorm()
    };
  }

  // Fallback
  return {
    hero: getHeroPartlyCloudy(isDay),
    small: getSmallPartlyCloudy()
  };
}

module.exports = {
  mapWmoToIcons,
  getThermometerIcon,
  getHumidityDropletIcon
};
