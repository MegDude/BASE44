import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const { name, email, phone, moveTimeline, message, listing, sessionId, profileId } = req.body || {};
  if (!name || !email || !phone || !listing?.address) {
    return res.status(400).json({ error: 'Missing required fields: name, email, phone, and listing.address are required' });
  }

  const { error } = await supabaseServer.from('listing_interest_requests').insert({
    name,
    email,
    phone,
    move_timeline: moveTimeline || null,
    message: message || null,
    listing,
    session_id: sessionId || null,
    profile_id: profileId || null
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
