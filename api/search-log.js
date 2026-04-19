import { supabaseServer } from '../src/lib/supabaseServer.js';
import { z } from 'zod';

const searchLogSchema = z.object({
  sessionId: z.string().trim().min(1),
  query: z.string().trim().min(1).max(120),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const parsedBody = searchLogSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.issues[0]?.message ?? 'Invalid request body' });
  }

  const { sessionId, query, lat, lng } = parsedBody.data;

  const { error } = await supabaseServer.from('search_logs').insert({
    session_id: sessionId,
    query,
    lat,
    lng
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
