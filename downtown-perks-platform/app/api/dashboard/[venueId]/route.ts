/**
 * GET /api/dashboard/[venueId]
 * Authenticated partner dashboard — returns redemptions for a venue with masked phone numbers.
 * Header: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { withAuth } from '@/lib/perk-auth';

export const runtime = 'nodejs';

export function GET(req: NextRequest, ctx: { params: Promise<{ venueId: string }> }) {
  return withAuth(async (_req, { user }) => {
    const { venueId } = await ctx.params;

    if (!venueId) {
      return NextResponse.json({ ok: false, error: 'Missing venueId.' }, { status: 400 });
    }

    // Venue admins can only view their own venue
    // Platform admins can view any venue
    if (user.role !== 'platform_admin') {
      // In a full implementation you'd check a venue_admin → venue mapping.
      // For now, venue_admin is trusted to only query their own venueId.
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('perk_redemptions')
      .select('id, redeemed_at, perk_id, perks(title), resident_id, resident_users(phone_masked)')
      .eq('venue_id', venueId)
      .order('redeemed_at', { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    type Row = {
      id: string;
      redeemed_at: string;
      perk_id: string;
      perks: { title: string } | null;
      resident_id: string;
      resident_users: { phone_masked: string } | null;
    };

    const redemptions = (data as unknown as Row[]).map(r => ({
      id: r.id,
      redeemedAt: r.redeemed_at,
      perk: r.perks?.title ?? r.perk_id,
      user: {
        id: r.resident_id,
        phoneMasked: r.resident_users?.phone_masked ?? '··········'
      }
    }));

    return NextResponse.json({ ok: true, venueId, redemptions });
  })(req);
}
