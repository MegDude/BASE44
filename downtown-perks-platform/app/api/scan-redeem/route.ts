/**
 * POST /api/scan-redeem
 * Code-based redemption — no auth token needed.
 * Body: { code: string }
 *
 * The unique code acts as the proof-of-possession credential.
 * Marks the redemption as redeemed and logs a "redeemed" scan event.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'Code is required')
    .max(10, 'Code is too long')
    .toUpperCase()
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map(i => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { code } = parsed.data;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: 'mock',
      message: 'Offer redeemed! (mock mode)'
    });
  }

  // ── Look up redemption ─────────────────────────────────────────────────────
  const { data: redemption } = await supabase
    .from('perk_redemptions')
    .select('id, redeemed, resident_id, venue_id, perk_id, redeemed_at')
    .eq('redemption_code', code)
    .maybeSingle();

  if (!redemption) {
    return NextResponse.json({ ok: false, error: 'Code not found.' }, { status: 404 });
  }

  if (redemption.redeemed) {
    return NextResponse.json(
      { ok: false, error: 'This code has already been used.' },
      { status: 409 }
    );
  }

  // ── Mark redeemed ──────────────────────────────────────────────────────────
  const { error: updateErr } = await supabase
    .from('perk_redemptions')
    .update({ redeemed: true, redeemed_at: new Date().toISOString() })
    .eq('id', redemption.id);

  if (updateErr) {
    return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
  }

  // ── Log redeemed event ─────────────────────────────────────────────────────
  await supabase.from('scan_events').insert({
    resident_id: redemption.resident_id,
    venue_id: redemption.venue_id,
    perk_id: redemption.perk_id,
    redemption_id: redemption.id,
    event_type: 'redeemed',
    metadata: { code }
  });

  return NextResponse.json({ ok: true, message: 'Offer redeemed! Enjoy your perk 🎉' });
}
