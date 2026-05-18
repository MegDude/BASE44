import { supabaseServer } from '../src/lib/supabaseServer.js';

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }

  return req.body && typeof req.body === 'object' ? req.body : {};
}

function getSessionId(body = {}, req) {
  return (
    body.sessionId ||
    body.session_id ||
    req.headers['x-vercel-id'] ||
    req.headers['x-forwarded-for'] ||
    'anonymous-session'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const { query, metadata = {} } = body;
  const trimmedQuery = String(query || '').trim();

  if (!trimmedQuery) {
    return res.status(400).json({ error: 'Missing required field: query' });
  }

  const latitude = Number(body.lat ?? body.latitude ?? metadata.lat ?? metadata.latitude);
  const longitude = Number(body.lng ?? body.longitude ?? metadata.lng ?? metadata.longitude);
  const hasValidCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  const payload = {
    session_id: String(getSessionId(body, req)),
    query: trimmedQuery,
    lat: hasValidCoordinates ? latitude : null,
    lng: hasValidCoordinates ? longitude : null,
    metadata: {
      ...metadata,
      source: metadata.source || 'client',
      capturedAt: new Date().toISOString(),
      hasLocation: hasValidCoordinates,
    },
  };

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, skipped: 'missing_supabase_server_env', payload });
  }

  const { error } = await supabaseServer.from('search_logs').insert(payload);

  if (error) {
    console.error('search-log insert failed', error);
    return res.status(200).json({ ok: true, skipped: 'insert_failed', reason: error.message });
  }

  return res.status(200).json({ ok: true });
}
