import { supabaseServer } from '../src/lib/supabaseServer.js';
import { resolvePublicActor, sanitizeEntityType, sanitizeString } from './_utils/publicActor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  try {
    const actor = await resolvePublicActor(req);
    const entityType = sanitizeEntityType(req.body?.entityType);
    const entityId = sanitizeString(req.body?.entityId, { max: 128 });

    const { error } = await supabaseServer.from('saved_items').insert({
      profile_id: actor.actorId,
      entity_type: entityType,
      entity_id: entityId
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, actorType: actor.actorType });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid save request' });
  }
}
