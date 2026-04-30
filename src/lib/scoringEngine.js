function toFiniteNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function calculateSignalScore(partner = {}) {
  const distance = Math.max(toFiniteNumber(partner.distance, 1), 1);
  const interactions =
    toFiniteNumber(partner.interactions) +
    toFiniteNumber(partner.metadata?.popularity) +
    toFiniteNumber(partner.metadata?.activityScore);
  const lastActiveValue = partner.last_active || partner.lastActive || partner.updated_at || partner.updatedAt;
  const lastActiveTime = lastActiveValue ? new Date(lastActiveValue).getTime() : Date.now();
  const ageHours = Math.max((Date.now() - lastActiveTime) / (1000 * 60 * 60), 1);

  return (1 / distance) * 0.4 + interactions * 0.4 + (1 / ageHours) * 0.2;
}

export function rankPartners(partners = []) {
  return [...partners]
    .map((partner) => ({
      ...partner,
      score: calculateSignalScore(partner),
    }))
    .sort((a, b) => b.score - a.score);
}
