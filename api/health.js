import { supabaseServer } from '../src/lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    ok: true,
    runtime: 'vercel-function',
    timestamp: new Date().toISOString(),
    env: {
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
      supabaseConfigured: Boolean(supabaseServer),
      base44Configured: Boolean(process.env.VITE_BASE44_APP_ID || process.env.BASE44_APP_ID)
    }
  });
}
