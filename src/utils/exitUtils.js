/**
 * Calculate staggered exit time based on event end time and wait duration
 * @param {string} endTimeStr - Format "HH:mm"
 * @param {number} waitMins - Minutes to subtract
 * @returns {string} Formatted time string
 */
export const calculateStaggeredTime = (endTimeStr, waitMins) => {
  const [h, m] = endTimeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0);
  date.setMinutes(date.getMinutes() - waitMins);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
