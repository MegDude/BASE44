import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { resolveSameOriginUrl } from '@/lib/url';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export const runtime = 'nodejs';

const planMap: Record<string, { amount: number; name: string; priceEnv?: string }> = {
  'venue-pilot': { amount: 60000, name: 'Venue Pilot', priceEnv: 'STRIPE_PRICE_VENUE_PILOT' },
  'property-pilot': { amount: 120000, name: 'Property Pilot', priceEnv: 'STRIPE_PRICE_PROPERTY_PILOT' },
  'resident-card': { amount: 0, name: 'Resident Card' }
};

const checkoutSchema = z.object({
  plan: z.enum(['venue-pilot', 'property-pilot', 'resident-card']).default('venue-pilot'),
  email: z.string().email().optional().or(z.literal('')),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional()
});

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues.map((issue) => issue.message).join(', ') }, { status: 400 });
  }

  const body = parsed.data;
  const plan = planMap[body.plan];
  const success_url = resolveSameOriginUrl(body.successUrl, req, '/partner-dashboard?checkout=success');
  const cancel_url = resolveSameOriginUrl(body.cancelUrl, req, '/partner-dashboard?checkout=cancelled');
  let provider = 'mock';
  let checkoutUrl = success_url;
  let external_id: string | null = null;

  if (stripe && plan.amount > 0) {
    const configuredPrice = plan.priceEnv ? process.env[plan.priceEnv] : null;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url,
      cancel_url,
      customer_email: body.email || undefined,
      line_items: configuredPrice ? [{ price: configuredPrice, quantity: 1 }] : [{
        price_data: {
          currency: 'usd',
          unit_amount: plan.amount,
          product_data: { name: plan.name }
        },
        quantity: 1
      }],
      metadata: {
        plan: body.plan,
        source: 'downtown-perks'
      }
    });
    provider = 'stripe';
    checkoutUrl = session.url || success_url;
    external_id = session.id;
  }

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from('checkouts').insert({
      plan: body.plan,
      success_url,
      cancel_url,
      amount: plan.amount,
      provider,
      email: body.email || null,
      status: 'created',
      external_id
    });
  }

  return NextResponse.json({ ok: true, provider, checkoutUrl, external_id });
}
