/**
 * rankMapEntities - Central ranking function for map-first MVP
 * 
 * Reduces noise by capping results and ranking by decision-relevant signals.
 * This is the core filter that ensures the map never shows more than maxResults pins.
 */

type MapEntity = {
  id: string;
  name: string;
  type: string;
  isLive?: boolean;
  isOpenNow?: boolean;
  hasPerk?: boolean;
  perk?: { value?: string };
  perk_value?: string;
  eventTiming?: {
    isLive?: boolean;
    startsSoon?: boolean;
    startTime?: string;
  };
  metadata?: {
    walkMinutes?: number;
    popularity?: number;
    crowdLevel?: number;
    reason?: string;
  };
  reason?: string;
  distanceMinutes?: number;
  liveScore?: number;
  crowdScore?: number;
};

interface RankOptions {
  intent?: string;
  maxResults?: number;
  userLocation?: { latitude: number; longitude: number };
  savedEntityIds?: Set<string>;
}

/**
 * Scores an entity based on decision-relevant signals
 */
function scoreEntity(entity: MapEntity, options: RankOptions): number {
  let score = 0;
  const { intent, savedEntityIds } = options;

  // Live entities get highest priority
  if (entity.isLive || entity.eventTiming?.isLive) {
    score += 100;
  }

  // Open now is valuable for immediate decisions
  if (entity.isOpenNow) {
    score += 50;
  }

  // Events starting soon are time-sensitive
  if (entity.eventTiming?.startsSoon) {
    score += 40;
  }

  // Perks are actionable
  if (entity.hasPerk || entity.perk?.value || entity.perk_value) {
    score += 30;
  }

  // Saved items show user intent
  if (savedEntityIds?.has(entity.id)) {
    score += 25;
  }

  // Closer is better for quick decisions
  const walkMinutes = entity.metadata?.walkMinutes ?? entity.distanceMinutes ?? 999;
  if (walkMinutes <= 5) {
    score += 20;
  } else if (walkMinutes <= 10) {
    score += 10;
  }

  // Intent matching boosts relevance
  if (intent) {
    const searchLower = intent.toLowerCase();
    const haystack = `${entity.name} ${entity.type} ${entity.metadata?.reason || ''}`.toLowerCase();
    if (haystack.includes(searchLower)) {
      score += 35;
    }
  }

  // Popularity as tiebreaker
  score += (entity.metadata?.popularity ?? 0) * 0.1;
  score += (entity.liveScore ?? 0) * 0.05;

  return score;
}

/**
 * Ranks and caps map entities for the map-first MVP
 * 
 * @param entities - Raw entities from the feed
 * @param options - Ranking configuration
 * @returns Capped, ranked array of entities
 */
export function rankMapEntities<T extends MapEntity>(
  entities: T[],
  options: RankOptions = {}
): T[] {
  const { maxResults = 30, savedEntityIds = new Set() } = options;

  if (!Array.isArray(entities) || entities.length === 0) {
    return [];
  }

  // Score and sort
  const scored = entities.map((entity) => ({
    entity,
    score: scoreEntity(entity, { ...options, savedEntityIds }),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Cap results
  const capped = scored.slice(0, maxResults).map((item) => item.entity);

  // Annotate with reason if not already present
  return capped.map((entity) => ({
    ...entity,
    reason: entity.reason || entity.metadata?.reason || generateReason(entity),
  }));
}

/**
 * Generates a human-readable reason for why this entity is shown
 */
function generateReason(entity: MapEntity): string {
  if (entity.isLive || entity.eventTiming?.isLive) {
    return 'Happening live now';
  }
  if (entity.eventTiming?.startsSoon) {
    return 'Starting soon';
  }
  if (entity.isOpenNow) {
    return 'Open and nearby';
  }
  if (entity.hasPerk || entity.perk?.value || entity.perk_value) {
    return 'Has an active perk';
  }
  const walk = entity.metadata?.walkMinutes ?? entity.distanceMinutes;
  if (walk && walk <= 5) {
    return `${walk} min walk`;
  }
  return 'Recommended nearby';
}

export default rankMapEntities;
