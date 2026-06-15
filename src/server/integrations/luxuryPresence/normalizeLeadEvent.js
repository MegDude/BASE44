import { getLuxuryPresenceActivityCategory } from "./activityMap.js";

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
}

function joinName(...values) {
  return values
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
    .map((value) => String(value).trim())
    .join(" ");
}

export function getLuxuryPresenceExternalEventId(payload) {
  const activityType = getLuxuryPresenceActivityType(payload);
  const leadId = firstValue(payload?.lead?.id, payload?.lead_id, payload?.leadId, payload?.contact?.id);
  const listingId = firstValue(payload?.listing?.id, payload?.listing_id, payload?.listingId, payload?.property?.id);
  const occurredAt = firstValue(payload?.occurred_at, payload?.occurredAt, payload?.created_at, payload?.timestamp);

  return String(
    firstValue(
      payload?.id,
      payload?.event_id,
      payload?.eventId,
      payload?.uuid,
      [activityType, leadId, listingId, occurredAt].filter(Boolean).join(":"),
    ),
  );
}

export function getLuxuryPresenceActivityType(payload) {
  return String(
    firstValue(
      payload?.activity_type,
      payload?.activityType,
      payload?.lead_activity_type,
      payload?.leadActivityType,
      payload?.type,
      payload?.event?.activity_type,
      payload?.event?.activityType,
      payload?.event?.type,
    ) || "UNKNOWN",
  ).toUpperCase();
}

export function normalizeLuxuryPresenceLeadEvent(payload = {}) {
  const lead = payload.lead || payload.contact || payload.user || {};
  const agent = payload.agent || payload.assigned_agent || payload.realtor || {};
  const listing = payload.listing || payload.property || payload.home || {};
  const activityType = getLuxuryPresenceActivityType(payload);
  const activityCategory = getLuxuryPresenceActivityCategory(activityType);
  const leadName = firstValue(
    lead.name,
    payload.lead_name,
    payload.leadName,
    joinName(lead.first_name, lead.last_name),
    joinName(payload.first_name, payload.last_name),
  );

  return {
    source: "luxury_presence",
    externalLeadId: firstValue(lead.id, payload.lead_id, payload.leadId, payload.contact_id),
    externalAgentId: firstValue(agent.id, payload.agent_id, payload.agentId, payload.external_agent_id),
    externalListingId: firstValue(listing.id, payload.listing_id, payload.listingId, payload.mls_id, payload.mlsNumber),
    activityType,
    activityCategory,
    leadEmail: firstValue(lead.email, payload.email, payload.lead_email, payload.leadEmail),
    leadName,
    listingTitle: firstValue(listing.title, listing.name, payload.listing_title, payload.property_name),
    listingAddress: firstValue(listing.address, payload.listing_address, payload.property_address, payload.address),
    listingUrl: firstValue(listing.url, listing.website, payload.listing_url, payload.property_url),
    metadata: {
      eventType: firstValue(payload.event_type, payload.eventType, "leads"),
      rawActivityType: firstValue(payload.activity_type, payload.activityType, payload.type),
      tags: payload.tags || lead.tags || listing.tags || [],
      sourceUrl: firstValue(payload.url, payload.page_url, payload.pageUrl, listing.url),
      leadPhonePresent: Boolean(firstValue(lead.phone, payload.phone, payload.lead_phone)),
      consentSignal: activityType.includes("OPT_") ? activityType : null,
    },
    occurredAt: firstValue(payload.occurred_at, payload.occurredAt, payload.created_at, payload.timestamp),
  };
}

export function toLeadActivityRow(normalized) {
  return {
    source: normalized.source,
    external_lead_id: normalized.externalLeadId || null,
    external_agent_id: normalized.externalAgentId || null,
    external_listing_id: normalized.externalListingId || null,
    activity_type: normalized.activityType,
    activity_category: normalized.activityCategory,
    lead_email: normalized.leadEmail || null,
    lead_name: normalized.leadName || null,
    listing_title: normalized.listingTitle || null,
    listing_address: normalized.listingAddress || null,
    listing_url: normalized.listingUrl || null,
    metadata: normalized.metadata || {},
    occurred_at: normalized.occurredAt || null,
  };
}
