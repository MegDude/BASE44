import { supabaseServer } from '../src/lib/supabaseServer.js';
import { z } from 'zod';

const saveSchema = z.object({
  profileId: z.string().trim().min(1),
  entityType: z.enum(['venue', 'event', 'perk']),
  entityId: z.string().trim().min(1)
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const parsedBody = saveSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.issues[0]?.message ?? 'Invalid request body' });
  }

  const { profileId, entityType, entityId } = parsedBody.data;

  const { error } = await supabaseServer.from('saved_items').insert({
    profile_id: profileId,
    entity_type: entityType,
    entity_id: entityId
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
