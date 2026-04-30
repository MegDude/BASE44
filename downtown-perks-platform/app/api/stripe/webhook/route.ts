import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceSupabase } from '@/lib/supabase';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false, error: 'Stripe webhook env vars missing.' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'Missing stripe signature.' }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase service role env vars missing.' }, { status: 503 });
  }

  const insertResult = await supabase.from('webhook_events').insert({
    provider: 'stripe',
    event_type: event.type,
    external_id: event.id,
    payload: event as any
  });
  if (insertResult.error) {
    return NextResponse.json({ ok: false, error: insertResult.error.message }, { status: 500 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const updateResult = await supabase
      .from('checkouts')
      .update({
        status: 'paid',
        external_id: session.id
      })
      .eq('external_id', session.id);
    if (updateResult.error) {
      return NextResponse.json({ ok: false, error: updateResult.error.message }, { status: 500 });
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const updateResult = await supabase
      .from('checkouts')
      .update({
        status: 'expired'
      })
      .eq('external_id', session.id);
    if (updateResult.error) {
      return NextResponse.json({ ok: false, error: updateResult.error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
