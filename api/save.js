import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const { profileId, entityType, entityId } = req.body || {};
  if (!profileId || !entityType || !entityId) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: profileId, entityType, and entityId are required' });
  }

  const { error } = await supabaseServer.from('saved_items').upsert({
    profile_id: profileId,
    entity_type: entityType,
    entity_id: entityId
  }, {
    onConflict: 'profile_id,entity_type,entity_id'
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
