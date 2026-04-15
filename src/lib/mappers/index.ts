/**
 * Downtown Perks Data Mappers
 * Transform raw entity data into SharedMapItem format
 */

import type {
  SharedMapItem,
  Venue,
  Event,
  Perk,
  Building,
  Campaign,
  Brand,
} from '../contracts';

// ── VENUE MAPPER ─────────────────────────────────────────────────────
export function mapVenueToSharedItem(venue: Venue): SharedMapItem {
  return {
    id: `venue-${venue.id}`,
    entity_id: venue.id,
    entity_type: 'venue',
    title: venue.name,
    subtitle: venue.category,
    description: venue.description,
    district: venue.district,
    category: venue.category,
    latitude: venue.latitude,
    longitude: venue.longitude,
    status: venue.status,
    image: venue.image_url,
    icon: '🍽️', // Category-based icons should come from MarkerFactory
    metadata: {
      address: venue.address,
      perk_value: venue.perk_value,
      hours: venue.hours,
      website: venue.website,
      tags: venue.tags,
      is_featured: venue.is_featured,
    },
  };
}

// ── EVENT MAPPER ─────────────────────────────────────────────────────
export function mapEventToSharedItem(event: Event): SharedMapItem {
  return {
    id: `event-${event.id}`,
    entity_id: event.id,
    entity_type: 'event',
    title: event.title,
    subtitle: event.category,
    description: event.description,
    category: event.category,
    latitude: event.latitude || 0,
    longitude: event.longitude || 0,
    status: event.status,
    image: event.image_url,
    icon: '📅',
    metadata: {
      venue_name: event.venue_name,
      address: event.address,
      date: event.date,
      end_date: event.end_date,
      is_members_only: event.is_members_only,
      capacity: event.capacity,
      rsvp_count: event.rsvp_count,
      tags: event.tags,
      is_featured: event.is_featured,
    },
  };
}

// ── PERK MAPPER ──────────────────────────────────────────────────────
export function mapPerkToSharedItem(perk: Perk): SharedMapItem {
  return {
    id: `perk-${perk.id}`,
    entity_id: perk.id,
    entity_type: 'perk',
    title: perk.title,
    subtitle: perk.venue_name,
    description: perk.description,
    category: perk.category,
    latitude: 0, // Perks are tied to venues, map via venue_id
    longitude: 0,
    status: perk.status,
    image: undefined,
    icon: '🏷️',
    metadata: {
      venue_name: perk.venue_name,
      value: perk.value,
      category: perk.category,
      terms: perk.terms,
      valid_from: perk.valid_from,
      valid_until: perk.valid_until,
      is_featured: perk.is_featured,
      redemption_count: perk.redemption_count,
    },
  };
}

// ── BUILDING MAPPER ──────────────────────────────────────────────────
export function mapBuildingToSharedItem(building: Building): SharedMapItem {
  return {
    id: `building-${building.id}`,
    entity_id: building.id,
    entity_type: 'building',
    title: building.name,
    subtitle: building.developer || 'Residential',
    description: building.description,
    district: undefined, // Derive from coordinates or explicit field
    latitude: building.latitude,
    longitude: building.longitude,
    status: building.status,
    image: building.image_url,
    icon: '🏢',
    metadata: {
      address: building.address,
      unit_count: building.unit_count,
      developer: building.developer,
      amenities: building.amenities,
      is_partner: building.is_partner,
      real_estate_contact: building.real_estate_contact,
    },
  };
}

// ── CAMPAIGN MAPPER ──────────────────────────────────────────────────
export function mapCampaignToSharedItem(campaign: Campaign, locationOverride?: { latitude: number; longitude: number }): SharedMapItem {
  return {
    id: `campaign-${campaign.id}`,
    entity_id: campaign.id,
    entity_type: 'campaign',
    title: campaign.name,
    subtitle: campaign.type,
    description: campaign.objective,
    category: campaign.type,
    partner_type: 'brand',
    latitude: locationOverride?.latitude || 0,
    longitude: locationOverride?.longitude || 0,
    status: campaign.status,
    image: undefined,
    icon: '⭐',
    metadata: {
      brand_id: campaign.brand_id,
      type: campaign.type,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      districts: campaign.districts,
      participating_venues: campaign.participating_venues,
      participating_buildings: campaign.participating_buildings,
      associated_events: campaign.associated_events,
    },
  };
}

// ── BRAND MAPPER ─────────────────────────────────────────────────────
export function mapBrandToSharedItem(brand: Brand, locationOverride?: { latitude: number; longitude: number }): SharedMapItem {
  return {
    id: `brand-${brand.id}`,
    entity_id: brand.id,
    entity_type: 'campaign',
    title: brand.name,
    subtitle: brand.category,
    description: brand.description,
    category: brand.category,
    partner_type: 'brand',
    latitude: locationOverride?.latitude || 0,
    longitude: locationOverride?.longitude || 0,
    status: brand.status,
    image: brand.image_url,
    icon: '⭐',
    metadata: {
      category: brand.category,
      districts: brand.districts,
      campaign_ids: brand.campaign_ids,
      venue_ids: brand.venue_ids,
      building_ids: brand.building_ids,
    },
  };
}

// ── BATCH MAPPER ─────────────────────────────────────────────────────
export function mapMixedEntitiesToSharedItems(entities: any[]): SharedMapItem[] {
  return entities
    .map((entity) => {
      if (entity.entity_type === 'venue' || entity.category?.match(/(restaurant|bar|fitness|wellness|retail|entertainment|coworking|hotel)/i)) {
        return mapVenueToSharedItem(entity as Venue);
      }
      if (entity.entity_type === 'event' || entity.date) {
        return mapEventToSharedItem(entity as Event);
      }
      if (entity.entity_type === 'building' || entity.unit_count) {
        return mapBuildingToSharedItem(entity as Building);
      }
      if (entity.entity_type === 'campaign') {
        return mapCampaignToSharedItem(entity as Campaign);
      }
      if (entity.entity_type === 'perk') {
        return mapPerkToSharedItem(entity as Perk);
      }
      return null;
    })
    .filter((item) => item !== null) as SharedMapItem[];
}