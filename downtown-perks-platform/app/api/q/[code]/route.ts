import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ ok: false, error: 'Missing QR code.' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 503 });
  }

  const { data: qrRow, error: qrError } = await supabase
    .from('qr_codes')
    .select('venue_id')
    .eq('code', code)
    .single();

  if (qrError || !qrRow) {
    return NextResponse.json({ ok: false, error: 'QR code not found.' }, { status: 404 });
  }

  const [{ data: venue, error: venueError }, { data: perks }] = await Promise.all([
    supabase.from('venues').select('id, name, slug').eq('id', qrRow.venue_id).single(),
    supabase.from('perks').select('id, title, description').eq('venue_id', qrRow.venue_id)
  ]);

  if (venueError || !venue) {
    return NextResponse.json({ ok: false, error: 'Venue not found.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    venue,
    perks: perks ?? []
  });
}
