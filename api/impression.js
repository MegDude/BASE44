import { supabaseServer } from '../src/lib/supabaseServer.js';
import { logInteraction } from './_utils/interactions.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
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
    return res.status(500).json({ error: error.message });
  }

  await logInteraction({
    type: 'impression',
    entityId,
    entityType,
    sessionId,
    district: typeof req.body?.district === 'string' ? req.body.district : null,
    source: 'api/impression',
    metadata: {
      lat: latitude,
      lng: longitude,
    },
  });

  return res.status(200).json({ ok: true });
}
