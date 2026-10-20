/**
 * Dynamic Schedule Evaluator
 * Filters screens based on schedules and F1 Qualifying/Race day conditions.
 */

function isTimeInRange(currentTimeStr, startStr, endStr) {
  if (!startStr || !endStr) return true;

  const [cHour, cMin] = currentTimeStr.split(':').map(Number);
  const [sHour, sMin] = startStr.split(':').map(Number);
  const [eHour, eMin] = endStr.split(':').map(Number);

  const currentMinutes = cHour * 60 + cMin;
  const startMinutes = sHour * 60 + sMin;
  const endMinutes = eHour * 60 + eMin;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

/**
 * Evaluates configured screens and returns the active ones.
 * 
 * @param {Array} screens - Array of screen configs
 * @param {Object} options - { now: Date, isF1QualiOrRaceDay: boolean }
 * @returns { activeScreens: Array, defaultFocusIndex: number }
 */
function evaluateActiveScreens(screens = [], { now = new Date(), isF1QualiOrRaceDay = false } = {}) {
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMin = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHour}:${currentMin}`;

  const activeScreens = [];
  let defaultFocusIndex = 0;
  let focusPriorityFound = false;

  screens.forEach((screen) => {
    if (!screen.enabled) return;

    const sched = screen.schedule || { type: 'always' };

    if (sched.type === 'always') {
      activeScreens.push(screen);
      return;
    }

    if (sched.type === 'scheduled') {
      let isEligible = true;

      // 1. F1 Qualifying or Race Day rule
      if (sched.f1QualiOrRaceOnly || sched.f1WeekendOnly) {
        if (!isF1QualiOrRaceDay) {
          isEligible = false;
        }
      }

      // 2. Day of week filter
      if (isEligible && Array.isArray(sched.daysOfWeek) && sched.daysOfWeek.length > 0) {
        if (!sched.daysOfWeek.includes(currentDay)) {
          isEligible = false;
        }
      }

      // 3. Time range filter
      if (isEligible && sched.timeRange && sched.timeRange.start && sched.timeRange.end) {
        if (!isTimeInRange(currentTimeStr, sched.timeRange.start, sched.timeRange.end)) {
          isEligible = false;
        }
      }

      if (isEligible) {
        activeScreens.push(screen);

        if (sched.autoFocus && !focusPriorityFound) {
          defaultFocusIndex = activeScreens.length - 1;
          focusPriorityFound = true;
        }
      }
    }
  });

  // Guarantee at least Clock is visible if everything else was filtered
  if (activeScreens.length === 0) {
    const clock = screens.find(s => s.type === 'clock') || screens[0];
    if (clock) activeScreens.push(clock);
  }

  return {
    activeScreens,
    defaultFocusIndex
  };
}

module.exports = {
  isTimeInRange,
  evaluateActiveScreens
};
