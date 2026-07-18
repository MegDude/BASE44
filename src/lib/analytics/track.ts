/**
 * Analytics Tracking — Unified event system
 * Rule: NO UI action without tracking
 * Fires from: clicks, searches, conversions
 */

import { fireWorkflow, getWorkflowProfileId, getWorkflowSessionId } from '@/lib/backendWorkflows';
import { platformEventTypes, publishPlatformEvent } from '@/lib/platformEvents';

export type EventType =
  | 'marker_click'
  | 'drawer_open'
  | 'drawer_close'
  | 'search_submit'
  | 'intent_mode_change'
  | 'chip_toggle'
  | 'save'
  | 'unsave'
  | 'directions'
  | 'redeem'
  | 'rsvp'
  | 'filter_apply'
  | 'building_anchor';

export interface TrackingEvent {
  type: EventType;
  entityId?: string;
  entityType?: 'venue' | 'event' | 'building' | 'perk' | string;
  campaign?: string;
  value?: any;
  pinId?: string;
  source?: string;
  tenantId?: string | null;
  workspaceId?: string | null;
  partnerId?: string | null;
  propertyId?: string | null;
  buildingId?: string | null;
  perkId?: string | null;
  eventId?: string | null;
  queryId?: string;
  searchQuery?: string;
  interpretedIntent?: string;
  resultRank?: number;
}

export function track(event: TrackingEvent) {
  const eventTypeMap: Partial<Record<EventType, string>> = {
    marker_click: platformEventTypes.ENTITY_OPENED,
    drawer_open: platformEventTypes.ENTITY_VIEWED,
    save: platformEventTypes.ENTITY_SAVED,
    directions: platformEventTypes.DIRECTIONS_REQUESTED,
    redeem: platformEventTypes.PERK_REDEEMED,
    rsvp: platformEventTypes.EVENT_RSVP,
    search_submit: platformEventTypes.SEARCH_COMPLETED,
  };
  const auditEventName: Partial<Record<EventType, string>> = {
    marker_click: 'pin_selected',
    drawer_open: 'drawer_opened',
    save: 'save_clicked',
    directions: 'directions_clicked',
    redeem: 'perk_redeemed',
    rsvp: 'event_rsvp',
  };

  void publishPlatformEvent({
    type: eventTypeMap[event.type] || event.type,
    entityId: event.entityId,
    entityType: event.entityType,
    campaignId: event.campaign,
    source: 'map_discovery',
    metadata: {
      legacyType: event.type,
      value: event.value,
    },
  });

  fireWorkflow('/api/track', {
    ...event,
    event_name: auditEventName[event.type] || event.type,
    pin_id: event.pinId || event.entityId,
    entity_id: event.entityId,
    entity_type: event.entityType,
    tenant_id: event.tenantId ?? null,
    workspace_id: event.workspaceId ?? null,
    partner_id: event.partnerId ?? null,
    property_id: event.propertyId ?? null,
    building_id: event.buildingId ?? null,
    campaign_id: event.campaign || null,
    perk_id: event.perkId ?? null,
    event_id: event.eventId ?? null,
    query_id: event.queryId,
    search_query: event.searchQuery,
    interpreted_intent: event.interpretedIntent,
    result_rank: event.resultRank,
    occurred_at: new Date().toISOString(),
    sessionId: getWorkflowSessionId(),
    profileId: getWorkflowProfileId(),
    source: event.source || 'direct-search',
    sourceType: 'map_discovery',
  });
}

export const trackingEvents = {
  markerClick: (entityId: string, entityType: string, context: Partial<TrackingEvent> = {}) =>
    track({ ...context, type: 'marker_click', entityId, entityType }),

  drawerOpen: (entityId: string, context: Partial<TrackingEvent> = {}) => track({ ...context, type: 'drawer_open', entityId }),

  drawerClose: (entityId: string) => track({ type: 'drawer_close', entityId }),

  searchSubmit: (query: string) => track({ type: 'search_submit', value: query }),

  intentModeChange: (mode: string) => track({ type: 'intent_mode_change', value: mode }),

  save: (entityId: string) => track({ type: 'save', entityId }),

  unsave: (entityId: string) => track({ type: 'unsave', entityId }),

  directions: (entityId: string) => track({ type: 'directions', entityId }),

  redeem: (entityId: string) => track({ type: 'redeem', entityId }),

  rsvp: (entityId: string) => track({ type: 'rsvp', entityId }),

  filterApply: (filter: string) => track({ type: 'filter_apply', value: filter }),

  buildingAnchor: (buildingId: string) => track({ type: 'building_anchor', entityId: buildingId }),
};
