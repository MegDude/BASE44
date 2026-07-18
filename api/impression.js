import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, status: 'accepted' });
  }

  const { sessionId, entityId, entityType, lat, lng } = req.body || {};
  if (!sessionId || !entityId || !entityType) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: sessionId, entityId, and entityType are required' });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({
      error: 'Invalid coordinates: latitude and longitude must be finite numbers'
    });
  }

  const { error } = await supabaseServer.from('map_impressions').insert({
    session_id: sessionId,
    entity_id: entityId,
    entity_type: entityType,
    lat: latitude,
    lng: longitude
  });

  if (error) {
    const { error: fallbackError } = await supabaseServer.from('analytics_signals').insert({
      source_type: 'map_discovery',
      action_type: 'open',
      value: 1,
      session_token: sessionId,
      entity_type: entityType,
      metadata: {
        legacy_entity_id: entityId,
        latitude,
        longitude,
        fallback_reason: error.message
      }
    });

    if (fallbackError) {
      return res.status(202).json({
        ok: true,
        status: 'accepted_without_persistence',
        reason: fallbackError.message
      });
    }

    return res.status(200).json({ ok: true, status: 'stored_in_analytics_signals' });
  }

  return res.status(200).json({ ok: true });
}
