import { supabaseServer } from '../src/lib/supabaseServer.js';
import { resolvePublicActor, sanitizeString } from './_utils/publicActor.js';
import { logInteraction } from './_utils/interactions.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  try {
    const actor = await resolvePublicActor(req);
    const venueId = sanitizeString(req.body?.venueId, { max: 128 });
    const source =
      typeof req.body?.source === 'string' && req.body.source.trim()
        ? req.body.source.trim().slice(0, 96)
        : null;

    const { error } = await supabaseServer.from('visits').insert({
      profile_id: actor.actorId,
      venue_id: venueId,
      source
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    await logInteraction({
      type: 'visit_confirmed',
      entityId: venueId,
      entityType: 'venue',
      userId: actor.actorId,
      source: source || 'api/visit',
      metadata: {
        actorType: actor.actorType,
      },
    });

    return res.status(200).json({ ok: true, actorType: actor.actorType });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid visit request' });
  }
}
