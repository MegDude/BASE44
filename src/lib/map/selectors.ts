/**
 * Map Selectors — UNIFIED ENTITY PIPELINE
 * Single source of truth for "what entities show up on the map"
 * Applies: search, filters, mode, campaign context, ranking
 * CRITICAL: This is the brain of the entire system
 */

import { filterValidMapItems, normalizeCoordinates } from '@/lib/mapCoordinates';

export interface MapEntity {
  id: string;
  _type: 'venue' | 'building' | 'event' | 'perk' | 'campaign';
  name: string;
  lat: number;
  lng: number;
  district?: string;
  category?: string;
  campaign?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface MapState {
  entities: MapEntity[];
  search: string;
  filters: {
    category: string;
    types: string[];
    districts: string[];
  };
  mode: 'explore' | 'campaign-preview' | 'search';
  campaignContext?: {
    campaignId?: string;
    sourceContext?: string;
    placementTypes?: string[];
  };
}

/**
 * STEP 1: Apply search filter
 */
function applySearch(entities: MapEntity[], query: string): MapEntity[] {
  if (!query.trim()) return entities;

  const q = query.toLowerCase();
  return entities.filter(e =>
    `${e.name} ${e.category || ''} ${e.district || ''} ${(e as any).description || ''}`.toLowerCase().includes(q)
  );
}

/**
 * STEP 2: Apply category/type/district filters
 */
function applyFilters(entities: MapEntity[], filters: MapState['filters']): MapEntity[] {
  return entities.filter(e => {
    // Category filter
    if (filters.category !== 'all' && e.category !== filters.category) return false;

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(e._type)) return false;

    // District filter
    if (filters.districts.length > 0 && !filters.districts.includes(e.district)) return false;

    return true;
  });
}

/**
 * STEP 3: Apply campaign context (mode-specific visibility)
 * If campaign mode is active, show ONLY entities matching campaign placements
 */
function applyCampaignContext(
  entities: MapEntity[],
  campaignContext?: MapState['campaignContext']
): MapEntity[] {
  if (!campaignContext?.campaignId) return entities;

  // Filter to only show entities tagged with this campaign
  return entities.filter(e => e.campaign === campaignContext.campaignId);
}

/**
 * STEP 4: Apply ranking with resident intelligence
 * Active > Saved > Viewed > Recent > Default
 */
function applyRanking(entities: MapEntity[], residentHistory?: any): MapEntity[] {
  return [...entities].sort((a, b) => {
    // Saved items first
    if (residentHistory?.saved.includes(a.id) && !residentHistory?.saved.includes(b.id)) return -1;
    if (!residentHistory?.saved.includes(a.id) && residentHistory?.saved.includes(b.id)) return 1;

    // Active entities next
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;

    // Previously viewed
    if (residentHistory?.viewed.includes(a.id) && !residentHistory?.viewed.includes(b.id)) return -1;
    if (!residentHistory?.viewed.includes(a.id) && residentHistory?.viewed.includes(b.id)) return 1;

    // Then by type (venues first, then events, buildings)
    const typeOrder = { venue: 0, event: 1, building: 2, perk: 3, campaign: 4 };
    const typeA = typeOrder[a._type as keyof typeof typeOrder] ?? 999;
    const typeB = typeOrder[b._type as keyof typeof typeOrder] ?? 999;
    if (typeA !== typeB) return typeA - typeB;

    return 0;
  });
}

/**
 * MAIN SELECTOR: getVisibleEntities
 * Pipe all entities through the entire system
 * RULE: MapShell uses ONLY this output
 */
export function getVisibleEntities(state: MapState, residentHistory?: any): MapEntity[] {
  // CRITICAL: All items must pass coordinate validation
  let result = filterValidMapItems(state.entities).map(normalizeCoordinates) as MapEntity[];

  // Apply pipeline in order
  result = applySearch(result, state.search);
  result = applyFilters(result, state.filters);
  result = applyCampaignContext(result, state.campaignContext);
  result = applyRanking(result, residentHistory);

  return result;
}

/**
 * Helper: Get selected entity (for drawer)
 */
export function getSelectedEntity(state: MapState, entityId?: string): MapEntity | null {
  if (!entityId) return null;
  return state.entities.find(e => e.id === entityId) || null;
}

/**
 * Helper: Get attribution source (why did this show up?)
 */
export function getAttributionSource(entity: MapEntity, context: MapState['campaignContext']): string {
  if (context?.campaignId && entity.campaign === context.campaignId) {
    return `Featured in ${context.sourceContext} campaign`;
  }
  if ((entity as any).distance) {
    return 'Nearby';
  }
  return 'Recommended';
}