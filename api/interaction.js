import { supabaseServer } from '../src/lib/supabaseServer.js';

const SCORE = {
  'check-in': 10,
  redemption: 20,
  rsvp: 10,
  save: 5,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const { workspaceId, entityId, userId, eventType, meta = {} } = req.body || {};
  const points = SCORE[eventType] || 0;
  if (!workspaceId || !eventType) return res.status(400).json({ error: 'workspaceId and eventType are required' });
  if (!supabaseServer) return res.status(503).json({ error: 'Supabase server client is not configured' });

  const { error } = await supabaseServer.from('interactions').insert({
    workspace_id: workspaceId,
    entity_id: entityId || null,
    user_id: userId || null,
    event_type: eventType,
    points,
    meta,
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, points });
}

