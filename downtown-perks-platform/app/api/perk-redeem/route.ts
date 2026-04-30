/**
 * POST /api/perk-redeem
 * Authenticated: resident redeems a perk (1 per perk per calendar day).
 * Body: { perkId: string; venueId: string }
 * Header: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { withAuth } from '@/lib/perk-auth';

export const runtime = 'nodejs';

const schema = z.object({
  perkId: z.string().uuid('perkId must be a UUID'),
  venueId: z.string().uuid('venueId must be a UUID')
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
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

  const { perkId, venueId } = parsed.data;
  const supabase = getServiceSupabase();

  if (!supabase) {
    // Mock mode: pretend it worked
    return NextResponse.json({
      ok: true,
      mode: 'mock',
      redemption: { id: `mock-${Date.now()}`, perkId, venueId, redeemedAt: new Date().toISOString() }
    });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Check for existing redemption today (belt-and-suspenders; DB unique index also enforces this)
  const { data: existing } = await supabase
    .from('perk_redemptions')
    .select('id')
    .eq('resident_id', user.userId)
    .eq('perk_id', perkId)
    .eq('redemption_date', today)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { ok: false, error: 'You have already redeemed this perk today.' },
      { status: 409 }
    );
  }

  const { data: redemption, error } = await supabase
    .from('perk_redemptions')
    .insert({
      resident_id: user.userId,
      venue_id: venueId,
      perk_id: perkId,
      redemption_date: today
    })
    .select('id, redeemed_at')
    .single();

  if (error) {
    // Unique constraint violation = already redeemed (race condition)
    if (error.code === '23505') {
      return NextResponse.json(
        { ok: false, error: 'You have already redeemed this perk today.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    redemption: { id: redemption.id, perkId, venueId, redeemedAt: redemption.redeemed_at }
  });
});
