import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const { sessionId, query, lat, lng } = req.body || {};
  if (!sessionId || typeof query !== 'string' || !query.trim()) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: sessionId and a non-empty query are required' });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({
      error: 'Invalid coordinates: latitude and longitude must be finite numbers'
    });
  }

  const { error } = await supabaseServer.from('search_logs').insert({
    session_id: sessionId,
    query: query.trim(),
    lat: latitude,
    lng: longitude
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
