import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({
      error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.'
    });
  }

  try {
    const { data: venues, error: venuesError } = await supabaseServer
      .from('venues')
      .select('*');

    const { data: activity, error: activityError } = await supabaseServer
      .from('activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (venuesError || activityError) {
      throw venuesError || activityError;
    }

    return res.status(200).json({
      venues: Array.isArray(venues) ? venues : [],
      activity: Array.isArray(activity) ? activity : []
    });
  } catch (err) {
    console.error('map-data failed', err);
    return res.status(500).json({
      error: err?.message || 'Failed to load data',
      venues: [],
      activity: []
    });
  }
}
