import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  return stripeClient;
}

function getAppBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5173';
}

function normalizeMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};

  return Object.fromEntries(
    Object.entries(metadata as Record<string, unknown>).map(([key, value]) => [
      key,
      value == null ? '' : String(value),
    ]),
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripe = getStripeClient();

  if (!stripe) {
    res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
    return;
  }

  try {
    const { productId, mode = 'payment', quantity = 1, metadata = {} } = req.body || {};

    if (!productId) {
      res.status(400).json({ error: 'Missing productId' });
      return;
    }

    if (mode !== 'payment' && mode !== 'subscription') {
      res.status(400).json({ error: 'mode must be payment or subscription' });
      return;
    }

    const product = await stripe.products.retrieve(productId);
    const defaultPrice =
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id;

    if (!defaultPrice) {
      res.status(400).json({ error: `Product ${productId} has no default_price` });
      return;
    }

    const appBaseUrl = getAppBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: defaultPrice, quantity: Number(quantity) || 1 }],
      success_url: `${appBaseUrl}/#partners/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/#partners/pricing?payment=cancelled`,
      metadata: normalizeMetadata(metadata),
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Stripe error' });
  }
}
