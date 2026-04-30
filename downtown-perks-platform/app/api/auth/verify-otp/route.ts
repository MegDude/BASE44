/**
 * POST /api/auth/verify-otp
 * Verifies the OTP via Twilio Verify, upserts resident_user in Supabase,
 * and returns a signed JWT.
 * Body: { phone: string; code: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { signResidentToken, maskPhone, type ResidentRole } from '@/lib/perk-auth';

export const runtime = 'nodejs';

const schema = z.object({
  phone: z.string().trim().min(7),
  code: z.string().trim().min(4).max(10)
});

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

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

  const phone = toE164(parsed.data.phone);
  const code = parsed.data.code;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // Dev mode: accept code "000000" without Twilio
  const devMode = !sid || !token || !verifySid;
  if (!devMode) {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationChecks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ To: phone, Code: code })
      }
    );

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Could not verify code.' }, { status: 502 });
    }

    const data = (await res.json()) as { status?: string };
    if (data.status !== 'approved') {
      return NextResponse.json({ ok: false, error: 'Invalid or expired code.' }, { status: 401 });
    }
  } else if (code !== '000000') {
    // In mock mode, only accept the dev code
    return NextResponse.json(
      { ok: false, error: 'Mock mode: use code 000000.' },
      { status: 401 }
    );
  }

  // Upsert resident user
  const masked = maskPhone(phone);
  const supabase = getServiceSupabase();

  if (!supabase) {
    // No Supabase — issue a token for a synthetic user ID
    const fakeId = `mock-${Buffer.from(phone).toString('base64').slice(0, 12)}`;
    const jwtToken = await signResidentToken(fakeId, 'resident');
    return NextResponse.json({
      ok: true,
      mode: 'mock',
      token: jwtToken,
      user: { id: fakeId, phoneMasked: masked }
    });
  }

  const { data: user, error } = await supabase
    .from('resident_users')
    .upsert({ phone, phone_masked: masked }, { onConflict: 'phone' })
    .select('id, role')
    .single();

  if (error || !user) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'DB error.' }, { status: 500 });
  }

  const jwtToken = await signResidentToken(user.id, user.role as ResidentRole);

  return NextResponse.json({
    ok: true,
    mode: devMode ? 'mock' : 'twilio',
    token: jwtToken,
    user: { id: user.id, phoneMasked: masked }
  });
}
