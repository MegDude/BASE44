import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidTwilioSignature(req: NextRequest, body: string) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true;

  const signature = req.headers.get('x-twilio-signature');
  if (!signature) return false;

  const params = new URLSearchParams(body);
  let payload = req.url;
  Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => {
      payload += `${key}${value}`;
    });

  const expected = createHmac('sha1', authToken).update(payload).digest('base64');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!isValidTwilioSignature(req, body)) {
    return NextResponse.json({ ok: false, error: 'Invalid Twilio signature.' }, { status: 401 });
  }

  const formData = new URLSearchParams(body);
  const MessageSid = String(formData.get('MessageSid') || '');
  const MessageStatus = String(formData.get('MessageStatus') || '');
  const To = String(formData.get('To') || '');

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase service role env vars missing.' }, { status: 503 });
  }

  if (MessageSid) {
    const { error } = await supabase
      .from('text_links')
      .update({ status: MessageStatus, external_id: MessageSid })
      .eq('external_id', MessageSid);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  const { error } = await supabase.from('webhook_events').insert({
    provider: 'twilio',
    event_type: MessageStatus || 'status',
    external_id: MessageSid,
    payload: { To, MessageStatus, MessageSid }
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
