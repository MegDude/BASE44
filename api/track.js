import { supabaseServer } from '../src/lib/supabaseServer.js';

const ACTION_TYPE_MAP = {
  marker_click: 'open',
  drawer_open: 'open',
  drawer_close: 'open',
  search_submit: 'open',
  intent_mode_change: 'open',
  chip_toggle: 'open',
  save: 'save',
  unsave: 'save',
  directions: 'visit_intent',
  redeem: 'redemption',
  rsvp: 'rsvp',
  filter_apply: 'open',
  building_anchor: 'open',
  resident_qr_presented: 'redemption'
};

function normalizeActionType(type) {
  return ACTION_TYPE_MAP[type] || 'open';
}

function normalizeSourceType(source) {
  const allowed = new Set(['building_qr', 'map_discovery', 'event_marker', 'sms', 'resident_card', 'direct_link']);
  return allowed.has(source) ? source : 'map_discovery';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(200).json({
      ok: true,
      mode: 'demo_session_only',
      storage: { stored: false, reason: 'supabase_not_configured' }
    });
  }

  const { type, entityId, entityType, campaign, value, sessionId, profileId, sourceType } = req.body || {};
  if (!type) {
    return res.status(400).json({ error: 'Missing required field: type' });
  }

  const payload = {
    source_type: normalizeSourceType(sourceType),
    action_type: normalizeActionType(type),
    value: Number.isFinite(Number(value)) ? Number(value) : 1,
    session_token: sessionId || null,
    user_email: profileId || null,
    district: typeof req.body?.district === 'string' ? req.body.district : null
  };

  if (campaign && /^[0-9a-f-]{36}$/i.test(String(campaign))) payload.campaign_id = campaign;
  if (entityType === 'venue' && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.venue_id = entityId;
  if (entityType === 'event' && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.event_id = entityId;
  if ((entityType === 'building' || entityType === 'property') && /^[0-9a-f-]{36}$/i.test(String(entityId))) payload.building_id = entityId;

  const { error } = await supabaseServer.from('analytics_signals').insert(payload);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
