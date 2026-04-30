/**
 * POST /api/auth/request-otp
 * Sends an OTP to the given phone number via Twilio Verify.
 * Body: { phone: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  phone: z.string().trim().min(7)
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
  if (!/^\+\d{10,15}$/.test(phone)) {
    return NextResponse.json({ ok: false, error: 'Invalid phone number format.' }, { status: 400 });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // Dev mode: skip real send if Twilio creds are missing
  if (!sid || !token || !verifySid) {
    return NextResponse.json({
      ok: true,
      sent: false,
      mode: 'mock',
      message: `OTP flow mocked for ${phone}. Add TWILIO_VERIFY_SERVICE_SID to send real codes.`
    });
  }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: phone, Channel: 'sms' })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, error: (err as { message?: string }).message ?? 'Twilio error.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, sent: true, mode: 'twilio' });
}
