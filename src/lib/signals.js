const HOUR_WEIGHTS = {
  morning: 8,
  midday: 10,
  afternoon: 12,
  evening: 18,
  late: 14,
};

export function getDaypart(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late";
}

export function getSignalScore(item, context = {}) {
  const daypart = context.daypart || getDaypart();
  const meta = item.meta || {};

  let score = 0;

  score += Number(meta.impressions || 0) * 0.04;
  score += Number(meta.opens || 0) * 0.18;
  score += Number(meta.saves || 0) * 0.32;
  score += Number(meta.rsvps || 0) * 0.42;
  score += Number(meta.redemptions || 0) * 0.64;
  score += Number(meta.scanBurst || 0) * 0.72;

  if (meta.peakDaypart === daypart) score += HOUR_WEIGHTS[daypart] || 0;
  if (meta.eventDriven) score += 16;
  if (meta.highIntent) score += 12;

  return Math.round(score);
}

export function applyLiveSignals(items = [], context = {}) {
  return items.map((item) => ({
    ...item,
    signalScore: getSignalScore(item, context),
  }));
}

export function getHeatmapPoints(items = []) {
  return items
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
    .map((item) => ({
      lat: item.lat,
      lng: item.lng,
      intensity: Math.max(1, item.signalScore || 1),
      id: item.id,
      type: item.type,
    }));
}
