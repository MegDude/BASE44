import { supabaseServer } from '../src/lib/supabaseServer.js';
const ACTION_TYPE_MAP = { marker_click: 'open', drawer_open: 'open', drawer_close: 'open', search_submit: 'open', intent_mode_change: 'open', chip_toggle: 'open', save: 'save', unsave: 'save', directions: 'visit_intent', redeem: 'redemption', rsvp: 'rsvp', filter_apply: 'open', building_anchor: 'open', resident_qr_presented: 'redemption' };
function normalizeActionType(type) { return ACTION_TYPE_MAP[type] || 'open'; }
function normalizeSourceType(source) { return new Set(['building_qr', 'map_discovery', 'event_marker', 'sms', 'resident_card', 'direct_link']).has(source) ? source : 'map_discovery'; }
function isUuid(value) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '')); }
async function resolveAttribution(database, entityId, explicitListingId, explicitPerkId) {
  const attribution = { partner_id: null, partner_organization_id: null, listing_id: null, perk_id: isUuid(explicitPerkId) ? explicitPerkId : null };
  const lookup = database.from('partner_listings').select('id,organization_id,partner_organizations!inner(legacy_partner_id)').eq('status', 'active');
  const { data, error } = isUuid(explicitListingId)
    ? await lookup.eq('id', explicitListingId).maybeSingle()
    : entityId ? await lookup.eq('entity_id', entityId).limit(2) : { data: null, error: null };
  if (error) throw error;
  const row = Array.isArray(data) ? (data.length === 1 ? data[0] : null) : data;
  if (row) { attribution.listing_id = row.id; attribution.partner_organization_id = row.organization_id; attribution.partner_id = row.partner_organizations?.legacy_partner_id || null; }
  return attribution;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabaseServer) return res.status(200).json({ ok: true, mode: 'demo_session_only', storage: { stored: false, reason: 'supabase_not_configured' } });
  const { type, entityId, entityType, campaign, value, sessionId, profileId, sourceType, listingId, perkId } = req.body || {};
  if (!type) return res.status(400).json({ error: 'Missing required field: type' });
  const attribution = await resolveAttribution(supabaseServer, entityId, listingId, perkId);
  const payload = {
    source_type: normalizeSourceType(sourceType), action_type: normalizeActionType(type), value: Number.isFinite(Number(value)) ? Number(value) : 1,
    session_token: sessionId || null, user_email: profileId || null,
    district: typeof req.body?.district === 'string' ? req.body.district : null,
    entity_id: isUuid(entityId) ? entityId : null, entity_type: entityType || null,
    partner_id: attribution.partner_id, partner_organization_id: attribution.partner_organization_id,
    listing_id: attribution.listing_id, perk_id: attribution.perk_id,
    metadata: isUuid(entityId) || !entityId ? {} : { map_entity_id: String(entityId).slice(0, 180) },
  };
  if (campaign && /^[0-9a-f-]{36}$/i.test(String(campaign))) payload.campaign_id = campaign;
  if (entityType === 'venue' && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.venue_id = entityId;
  if (entityType === 'event' && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.event_id = entityId;
  if ((entityType === 'building' || entityType === 'property') && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.building_id = entityId;
  const { error } = await supabaseServer.from('analytics_signals').insert(payload);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
