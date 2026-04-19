import { supabaseServer } from '../src/lib/supabaseServer.js';
import { z } from 'zod';

const visitSchema = z.object({
  profileId: z.string().trim().min(1),
  venueId: z.string().trim().min(1),
  source: z.enum(['map', 'search', 'direct']).nullable().optional()
});

const getValidationMessage = (issues) => issues.map((issue) => issue.message).join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const parsedBody = visitSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return res.status(400).json({ error: getValidationMessage(parsedBody.error.issues) || 'Invalid request body' });
  }

  const { profileId, venueId, source } = parsedBody.data;

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
