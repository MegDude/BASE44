import { supabaseServer } from '../src/lib/supabaseServer.js';
import { z } from 'zod';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

const impressionSchema = z.object({
  sessionId: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  entityType: z.enum(['venue', 'event', 'perk']),
  lat: z.coerce.number().min(LAT_MIN).max(LAT_MAX),
  lng: z.coerce.number().min(LNG_MIN).max(LNG_MAX)
});

const getValidationMessage = (issues) => issues.map((issue) => issue.message).join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const parsedBody = impressionSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return res.status(400).json({ error: getValidationMessage(parsedBody.error.issues) || 'Invalid request body' });
  }

  const { sessionId, entityId, entityType, lat, lng } = parsedBody.data;

  const { error } = await supabaseServer.from('map_impressions').insert({
    session_id: sessionId,
    entity_id: entityId,
    entity_type: entityType,
    lat,
    lng
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
