import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const { profileId, venueId, source } = req.body || {};
  if (!profileId || !venueId) {
    return res.status(400).json({ error: 'Missing required fields: profileId and venueId are required' });
  }

  const { error } = await supabaseServer.from('visits').insert({
    profile_id: profileId,
    venue_id: venueId,
    source: source ?? null
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
