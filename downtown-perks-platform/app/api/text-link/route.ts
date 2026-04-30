import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { getAbsoluteUrl, resolveSameOriginUrl } from '@/lib/url';

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

const textLinkSchema = z.object({
  phone: z.string().trim().min(7),
  source: z.string().trim().max(120).optional(),
  url: z.string().optional()
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = textLinkSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues.map((issue) => issue.message).join(', ') }, { status: 400 });
  }

  const body = parsed.data;
  const phone = toE164(body.phone);
  if (!/^\+\d{10,15}$/.test(phone)) {
    return NextResponse.json({ ok: false, error: 'Phone number must be a valid E.164-compatible US number.' }, { status: 400 });
  }

  const url = resolveSameOriginUrl(body.url, req, '/resident-app');
  const callback = process.env.TWILIO_STATUS_CALLBACK_URL || getAbsoluteUrl('/api/twilio/status', req);
  let sent = false;
  let provider = 'mock';
  let external_id: string | null = null;
  let status = 'queued';
  let errorMessage = '';

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    provider = 'twilio';
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const params = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `Downtown Perks link: ${url}`,
      StatusCallback: callback
    });
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    if (twilioRes.ok) {
      const data = await twilioRes.json();
      sent = true;
      provider = 'twilio';
      external_id = data.sid || null;
      status = data.status || 'queued';
    } else {
      status = 'failed';
      errorMessage = 'Twilio rejected the SMS request.';
    }
  }

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from('text_links').insert({
      phone,
      url,
      source: body.source || 'site',
      status,
      external_id
    });
  }

  const ok = !errorMessage;
  return NextResponse.json({
    ok,
    sent,
    provider,
    message: sent
      ? `Text link sent to ${phone}.`
      : ok
        ? `Text-link flow saved for ${phone}. Add Twilio env vars to send live SMS.`
        : `Text-link flow recorded for ${phone}, but Twilio did not accept the request.`
  }, { status: ok ? 200 : 502 });
}
