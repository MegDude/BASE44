import { NextRequest, NextResponse } from 'next/server';
import { parseActionPayload, persistAction } from '@/lib/actions';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = parseActionPayload(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const saved = await persistAction('rsvps', parsed.data);
  if (!saved.ok) {
    return NextResponse.json(saved, { status: 500 });
  }

  return NextResponse.json({ ...saved, message: `RSVP saved for ${parsed.data.itemTitle}.` });
}
