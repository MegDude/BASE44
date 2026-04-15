/**
 * Heatmap utility functions for real-time density analysis
 */

/**
 * Filter analytics signals by time window
 * @param {Array} signals - AnalyticsSignal records
 * @param {string} timeFilter - 'now' (1hr), 'today', 'week'
 * @returns {Array} Filtered signals
 */
export function filterSignalsByTime(signals, timeFilter = 'now') {
  if (!signals || !signals.length) return [];

  const now = new Date();
  let cutoffTime;

  switch (timeFilter) {
    case 'now':
      cutoffTime = new Date(now.getTime() - 60 * 60 * 1000); // Last 1 hour
      break;
    case 'today':
      cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
  }

  return signals.filter((signal) => {
    const signalTime = new Date(signal.timestamp);
    return signalTime >= cutoffTime;
  });
}

/**
 * Identify peak traffic times from signals
 * @param {Array} signals - AnalyticsSignal records
 * @returns {Array} Hourly peaks with counts
 */
export function analyzePeakTimes(signals) {
  if (!signals || !signals.length) return [];

  const hourly = {};

  signals.forEach((signal) => {
    const time = new Date(signal.timestamp);
    const hour = `${time.getHours()}:00`;

    if (!hourly[hour]) hourly[hour] = 0;
    hourly[hour] += signal.value || 1;
  });

  return Object.entries(hourly)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group signals by district/area
 * @param {Array} signals - AnalyticsSignal records
 * @returns {Object} Districts with activity counts
 */
export function groupByDistrict(signals) {
  if (!signals || !signals.length) return {};

  const districts = {};

  signals.forEach((signal) => {
    const district = signal.district_id || 'downtown';

    if (!districts[district]) {
      districts[district] = { count: 0, actions: {} };
    }

    districts[district].count += signal.value || 1;
    const action = signal.action_type || 'impression';
    districts[district].actions[action] = (districts[district].actions[action] || 0) + 1;
  });

  return districts;
}

/**
 * Calculate live heat intensity (0-1) for a location
 * @param {number} density - Raw activity count
 * @param {number} maxDensity - Maximum density in dataset
 * @returns {number} Normalized intensity 0-1
 */
export function calculateIntensity(density, maxDensity) {
  if (maxDensity === 0) return 0;
  return Math.min(density / maxDensity, 1);
}