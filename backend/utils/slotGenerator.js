/**
 * Generates time slots between startTime and endTime at a given interval.
 *
 * @param {string} startTime  - "09:00" or "09:00 AM" format
 * @param {string} endTime    - "17:00" or "05:00 PM" format
 * @param {number} interval   - interval in minutes (default 30)
 * @returns {string[]}        - array of slot strings like ["09:00 AM", "09:30 AM", ...]
 */
export const generateSlots = (startTime, endTime, interval = 30) => {
  const slots = [];

  // Use a fixed date — we only care about the time part
  const baseDate = '2000-01-01';
  const start = new Date(`${baseDate} ${startTime}`);
  const end = new Date(`${baseDate} ${endTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  if (start >= end) {
    return [];
  }

  let current = new Date(start);
  while (current < end) {
    slots.push(
      current.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
};

/**
 * Maps a JavaScript getDay() number (0=Sun, 1=Mon ...) to the day name
 * stored in the Doctor schedule schema.
 */
export const getDayName = (dateObj) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObj.getDay()];
};
