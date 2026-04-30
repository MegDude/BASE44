/**
 * POST /api/message
 * Authenticated partner broadcast — sends an SMS to all unique residents
 * who have redeemed at the given venue, and logs the message.
 * Body: { venueId: string; content: string }
 * Header: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { withAuth } from '@/lib/perk-auth';

export const runtime = 'nodejs';

const schema = z.object({
  venueId: z.string().uuid('venueId must be a UUID'),
  content: z.string().trim().min(1).max(320, 'Message too long (max 320 chars)')
});

export const POST = withAuth(async (req: NextRequest) => {
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

  const { venueId, content } = parsed.data;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json({ ok: true, mode: 'mock', sent: 0 });
  }

  // Fetch distinct residents who redeemed at this venue
  const { data: rows, error: fetchError } = await supabase
    .from('perk_redemptions')
    .select('resident_id, resident_users(phone)')
    .eq('venue_id', venueId);

  if (fetchError) {
    return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
  }

  type Row = { resident_id: string; resident_users: { phone: string } | null };

  // Deduplicate by resident_id
  const seen = new Set<string>();
  const recipients: string[] = [];
  for (const row of (rows ?? []) as unknown as Row[]) {
    if (!seen.has(row.resident_id) && row.resident_users?.phone) {
      seen.add(row.resident_id);
      recipients.push(row.resident_users.phone);
    }
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const hasTwilio = sid && token && from;

  let sentCount = 0;
  const errors: string[] = [];

  if (hasTwilio) {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    await Promise.all(
      recipients.map(async phone => {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ To: phone, From: from, Body: content })
          }
        );
        if (res.ok) {
          sentCount++;
        } else {
          errors.push(`Failed for ${phone.slice(-4)}`);
        }
      })
    );
  } else {
    // Mock: all recipients "sent"
    sentCount = recipients.length;
  }

  // Log the broadcast regardless of Twilio status
  await supabase
    .from('partner_messages')
    .insert({ venue_id: venueId, content, sent_count: sentCount });

  return NextResponse.json({
    ok: true,
    mode: hasTwilio ? 'twilio' : 'mock',
    sent: sentCount,
    total: recipients.length,
    errors: errors.length ? errors : undefined
  });
});
