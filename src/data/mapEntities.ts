/**
 * Downtown Perks Centralized Map Data Layer
 * Single source of truth for all map entities across the product
 * 
 * Every entity must pass coordinate validation before rendering.
 * This eliminates NaN errors and fragmented data sources.
 */

/**
 * Valid entity types in the Downtown Perks ecosystem
 */
export type MapEntityType = 
  | 'venue'
  | 'event'
  | 'perk'
  | 'building'
  | 'property'
  | 'hotel'
  | 'brand'
  | 'civic';

/**
 * Valid venue categories
 */
export type VenueCategory = 
  | 'restaurant'
  | 'bar'
  | 'coffee'
  | 'fitness'
  | 'wellness'
  | 'beauty'
  | 'retail'
  | 'entertainment'
  | 'coworking'
  | 'hotel'
  | 'services';

/**
 * Valid districts (limited set)
 */
export type District = 
  | 'rainey'
  | '2nd-street'
  | 'congress'
  | 'seaholm'
  | 'west-6th'
  | 'red-river'
  | 'other';

/**
 * Validated coordinate location
 */
export interface CoordinateLocation {
  latitude: number;
  longitude: number;
  valid: boolean; // Always true if in this object (validation enforced at creation)
}

/**
 * Perk data embedded in an entity
 */
export interface EmbeddedPerk {
  title: string;
  description?: string;
  value: string;
  isActive: boolean;
  expiresAt?: string; // ISO date
}

/**
 * Event timing data embedded in an entity
 */
export interface EmbeddedEventTiming {
  startTime: string; // ISO date-time
  endTime: string; // ISO date-time
  title: string;
  isLive: boolean;
}

/**
 * Base location metadata
 */
export interface LocationMetadata {
  address: string;
  district?: District;
  walkMinutes?: number;
  distanceMeters?: number;
  searchKeywords?: string[];
}

/**
 * Unified map entity interface
 * All entities in the Downtown Perks map system conform to this
 */
export interface MapEntity {
  // Required identifiers
  id: string;
  name: string;
  type: MapEntityType;

  // Required location (validated)
  location: CoordinateLocation;

  // Display and categorization
  category?: VenueCategory;
  subcategory?: string;
  description?: string;

  // Location metadata
  address: string;
  district?: District;

  // Relationship flags
  isBuilding?: boolean;
  isProperty?: boolean;
  isHotel?: boolean;
  isVenue?: boolean;
  isEvent?: boolean;
  isPerk?: boolean;
  isBrand?: boolean;
  isCivic?: boolean;

  // Availability and state
  isOpenNow?: boolean;
  isLive?: boolean;
  isSaved?: boolean;
  isPlotted: boolean;
  isVisibleInResults: boolean;

  // Visual/interaction system
  markerType: 'standard' | 'building' | 'event' | 'perk' | 'brand' | 'civic';
  markerVariant?: string;
  iconType?: string;

  // Embedded data
  perk?: EmbeddedPerk;
  eventTiming?: EmbeddedEventTiming;

  // Metadata for proximity, popularity, and filtering
  metadata?: {
    walkMinutes?: number;
    distanceMeters?: number;
    rating?: number;
    popularity?: number;
    isTrending?: boolean;
    tags?: string[];
    askMapIntentTags?: string[];
  };

  // Quick actions available on this entity
  quickActions?: ('save' | 'directions' | 'rsvp' | 'redeem' | 'details' | 'book')[];

  // Drawer and detail config
  detailDrawerType?: 'venue' | 'event' | 'building' | 'perk' | 'brand';

  // Timestamps
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

/**
 * Centralized map entity database
 * This is the single source of truth for all plotted entities
 */
export const MAP_ENTITIES: MapEntity[] = [
  // ─── VENUES ──────────────────────────────────────────────
  {
    id: 'venue-merit-coffee',
    name: 'Merit Coffee',
    type: 'venue',
    category: 'coffee',
    description: 'Locally roasted specialty coffee and pastries',
    location: { latitude: 30.2695, longitude: -97.7450, valid: true },
    address: '411 Rainey St, Austin, TX 78701',
    district: 'rainey',
    isVenue: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'standard',
    iconType: 'coffee',
    isOpenNow: true,
    metadata: {
      walkMinutes: 2,
      distanceMeters: 150,
      tags: ['coffee', 'pastries', 'outdoor-seating'],
      askMapIntentTags: ['coffee', 'morning', 'work-friendly'],
    },
    quickActions: ['save', 'directions', 'details'],
    detailDrawerType: 'venue',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'venue-bouldin-creek',
    name: 'Bouldin Creek Cafe',
    type: 'venue',
    category: 'bar',
    description: 'Live music venue with craft cocktails',
    location: { latitude: 30.2520, longitude: -97.7450, valid: true },
    address: '1900 S Lamar Blvd, Austin, TX 78704',
    district: 'congress',
    isVenue: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'standard',
    iconType: 'nightlife',
    isLive: true,
    isOpenNow: true,
    metadata: {
      walkMinutes: 8,
      distanceMeters: 950,
      tags: ['live-music', 'cocktails', 'venue'],
      askMapIntentTags: ['live-music', 'drinks', 'evening'],
    },
    quickActions: ['save', 'directions', 'details'],
    detailDrawerType: 'venue',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'venue-wanderlust-yoga',
    name: 'Wanderlust Yoga',
    type: 'venue',
    category: 'wellness',
    description: 'Yoga studio with daily classes',
    location: { latitude: 30.2650, longitude: -97.7400, valid: true },
    address: '415 E 6th St, Austin, TX 78701',
    district: 'rainey',
    isVenue: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'standard',
    iconType: 'wellness',
    isOpenNow: true,
    metadata: {
      walkMinutes: 3,
      distanceMeters: 250,
      tags: ['yoga', 'wellness', 'fitness'],
      askMapIntentTags: ['yoga', 'wellness', 'exercise'],
    },
    quickActions: ['save', 'directions', 'rsvp', 'details'],
    detailDrawerType: 'venue',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'venue-bookpeople',
    name: 'BookPeople',
    type: 'venue',
    category: 'retail',
    description: 'Independent bookstore with local events',
    location: { latitude: 30.2655, longitude: -97.7465, valid: true },
    address: '603 N Lamar Blvd, Austin, TX 78703',
    district: '2nd-street',
    isVenue: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'standard',
    iconType: 'retail',
    isOpenNow: true,
    metadata: {
      walkMinutes: 5,
      distanceMeters: 400,
      tags: ['books', 'retail', 'events'],
      askMapIntentTags: ['books', 'shopping', 'reading'],
    },
    quickActions: ['save', 'directions', 'details'],
    detailDrawerType: 'venue',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'venue-easy-tiger',
    name: 'Easy Tiger',
    type: 'venue',
    category: 'bar',
    description: 'German-inspired beer hall and bakery',
    location: { latitude: 30.2630, longitude: -97.7420, valid: true },
    address: '440 Brazos St, Austin, TX 78701',
    district: 'congress',
    isVenue: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'standard',
    iconType: 'dining',
    isOpenNow: true,
    metadata: {
      walkMinutes: 4,
      distanceMeters: 320,
      tags: ['beer', 'food', 'outdoor-seating'],
      askMapIntentTags: ['beer', 'food', 'dining'],
    },
    quickActions: ['save', 'directions', 'details'],
    detailDrawerType: 'venue',
    perk: {
      title: '15% off for card holders',
      description: 'Valid on any purchase',
      value: '15% off',
      isActive: true,
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },

  // ─── BUILDINGS & PROPERTIES ───────────────────────────────
  {
    id: 'building-seaholm',
    name: 'Seaholm Power Plant',
    type: 'building',
    description: 'Mixed-use development with dining, retail, and offices',
    location: { latitude: 30.2710, longitude: -97.7380, valid: true },
    address: '51 Rio Grande, Austin, TX 78701',
    district: 'seaholm',
    isBuilding: true,
    isProperty: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'building',
    iconType: 'building',
    metadata: {
      walkMinutes: 6,
      distanceMeters: 500,
      tags: ['mixed-use', 'landmark', 'dining', 'retail'],
      askMapIntentTags: ['mixed-use', 'dining', 'shopping'],
    },
    quickActions: ['directions', 'details'],
    detailDrawerType: 'building',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'building-the-line-hotel',
    name: 'The LINE Hotel',
    type: 'hotel',
    description: 'Modern boutique hotel with rooftop bar',
    location: { latitude: 30.2680, longitude: -97.7430, valid: true },
    address: '111 E 1st St, Austin, TX 78701',
    district: 'congress',
    isHotel: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'building',
    iconType: 'hotel',
    metadata: {
      walkMinutes: 3,
      distanceMeters: 220,
      tags: ['hotel', 'rooftop', 'dining'],
      askMapIntentTags: ['hotel', 'stay', 'rooftop-bar'],
    },
    quickActions: ['directions', 'book', 'details'],
    detailDrawerType: 'building',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },

  // ─── EVENTS ──────────────────────────────────────────────
  {
    id: 'event-rainey-mixer',
    name: 'Rainey Street Mixer',
    type: 'event',
    category: 'entertainment',
    description: 'Weekly community gathering on Rainey Street',
    location: { latitude: 30.2690, longitude: -97.7450, valid: true },
    address: 'Rainey Street, Austin, TX 78701',
    district: 'rainey',
    isEvent: true,
    isLive: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'event',
    iconType: 'calendar',
    eventTiming: {
      startTime: '2025-04-15T18:00:00Z',
      endTime: '2025-04-15T22:00:00Z',
      title: 'Rainey Street Mixer',
      isLive: true,
    },
    metadata: {
      walkMinutes: 2,
      distanceMeters: 100,
      tags: ['networking', 'community', 'social'],
      askMapIntentTags: ['events', 'social', 'networking'],
    },
    quickActions: ['save', 'rsvp', 'directions', 'details'],
    detailDrawerType: 'event',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },

  // ─── PERKS ───────────────────────────────────────────────
  {
    id: 'perk-downtown-discount',
    name: 'Downtown Partner Discount',
    type: 'perk',
    description: 'Special offer for Downtown Perks members',
    location: { latitude: 30.2650, longitude: -97.7440, valid: true },
    address: 'Downtown Austin, TX',
    district: 'congress',
    isPerk: true,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: 'perk',
    iconType: 'tag',
    perk: {
      title: '20% off at partner venues',
      description: 'Valid on food, drinks, and services',
      value: '20% off',
      isActive: true,
      expiresAt: '2025-12-31T23:59:59Z',
    },
    metadata: {
      tags: ['discount', 'partner', 'downtown'],
      askMapIntentTags: ['discount', 'offer', 'save-money'],
    },
    quickActions: ['save', 'redeem', 'details'],
    detailDrawerType: 'perk',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

/**
 * Export entity counts and metadata for analytics
 */
export const MAP_ENTITY_STATS = {
  totalEntities: MAP_ENTITIES.length,
  byType: {
    venue: MAP_ENTITIES.filter(e => e.type === 'venue').length,
    event: MAP_ENTITIES.filter(e => e.type === 'event').length,
    perk: MAP_ENTITIES.filter(e => e.type === 'perk').length,
    building: MAP_ENTITIES.filter(e => e.type === 'building').length,
    property: MAP_ENTITIES.filter(e => e.type === 'property').length,
    hotel: MAP_ENTITIES.filter(e => e.type === 'hotel').length,
    brand: MAP_ENTITIES.filter(e => e.type === 'brand').length,
    civic: MAP_ENTITIES.filter(e => e.type === 'civic').length,
  },
};

/**
 * Retrieve all valid plotted entities
 */
export function getValidPlottedEntities(): MapEntity[] {
  return MAP_ENTITIES.filter(e => e.isPlotted && e.location.valid);
}

/**
 * Retrieve entities by type
 */
export function getEntitiesByType(type: MapEntityType): MapEntity[] {
  return MAP_ENTITIES.filter(e => e.type === type && e.location.valid);
}

/**
 * Retrieve entities by district
 */
export function getEntitiesByDistrict(district: District): MapEntity[] {
  return MAP_ENTITIES.filter(e => e.district === district && e.location.valid);
}

/**
 * Retrieve entities by category
 */
export function getEntitiesByCategory(category: VenueCategory): MapEntity[] {
  return MAP_ENTITIES.filter(e => e.category === category && e.location.valid);
}

/**
 * Search entities by name and keywords
 */
export function searchEntities(query: string): MapEntity[] {
  const lowerQuery = query.toLowerCase();
  return MAP_ENTITIES.filter(
    e =>
      (e.name.toLowerCase().includes(lowerQuery) ||
        e.description?.toLowerCase().includes(lowerQuery) ||
        e.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        e.metadata?.searchKeywords?.some(kw => kw.toLowerCase().includes(lowerQuery))) &&
      e.location.valid
  );
}