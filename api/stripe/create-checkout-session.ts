import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

// Legacy recurring partner price IDs from the retired billing model. Blocked from active checkout.
const BLOCKED_MONTHLY_PRICE_IDS = new Set([
  'price_1ThxCaEH6o7elwpUha0gU6q2',
  'price_1ThxCbEH6o7elwpU76PyAm5C',
  'price_1ThxCcEH6o7elwpUBOErkj0Q',
  'price_1ThxCdEH6o7elwpUaUM39TT6',
  'price_1ThxCdEH6o7elwpU34wAoofj',
  'price_1ThxCeEH6o7elwpUuA6hNrzj',
  'price_1ThxCfEH6o7elwpUkSQY1s1Y',
  'price_1ThxCgEH6o7elwpUxuIWw3hb',
  'price_1ThxChEH6o7elwpUp7aT0UPu',
  'price_1ThxChEH6o7elwpURgd5lw8c',
  'price_1ThxCiEH6o7elwpUadaJ0MDs',
  'price_1ThxCjEH6o7elwpU8qE0igRA',
  'price_1ThxCrEH6o7elwpUTCCE9XVb',
  'price_1ThxD1EH6o7elwpUrrNKAKhz',
  'price_1ThxD3EH6o7elwpUMGqlUN7K',
  'price_1ThxD4EH6o7elwpUMhKs0Gyx',
  'price_1ThxDPEH6o7elwpUApsXF6Zk',
]);

function rejectBlockedMonthlyPrice(res: any, priceIds: Array<unknown>) {
  const blockedPriceId = priceIds
    .map((priceId) => (priceId == null ? '' : String(priceId)))
    .find((priceId) => BLOCKED_MONTHLY_PRICE_IDS.has(priceId));

  if (!blockedPriceId) return false;

  res.status(400).json({
    error: 'Monthly Stripe price IDs are not allowed for partner subscriptions.',
  });
  return true;
}

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
  return 'https://downtownperks.com';
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

function buildWorkspaceSuccessUrl(appBaseUrl: string, metadata: Record<string, string>) {
  if (metadata.accessType === 'resident') {
    const params = new URLSearchParams({
      checkout: 'success',
      mode: 'resident',
      tab: 'pass',
      filter: 'Perks',
    });

    ['residentId', 'verificationStatus', 'buildingName'].forEach((key) => {
      if (metadata[key]) params.set(key, metadata[key]);
    });

    return `${appBaseUrl}/app?${params.toString()}&session_id={CHECKOUT_SESSION_ID}`;
  }

  const params = new URLSearchParams({
    checkout: 'success',
  });

  [
    'partnerType',
    'plan',
    'sku',
    'modules',
    'moduleLabels',
    'annualTotal',
    'recurringAnnualTotal',
    'oneTimeTotal',
    'annualAddOnTotal',
  ].forEach((key) => {
    if (metadata[key]) params.set(key, metadata[key]);
  });

  return `${appBaseUrl}/partner-workspace/overview?${params.toString()}&session_id={CHECKOUT_SESSION_ID}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripe = getStripeClient();

  if (!stripe) {
    res.status(503).json({ error: 'Checkout is not available right now. Please try again shortly.' });
    return;
  }

  try {
    const { productId, priceId, lineItems, mode = 'payment', quantity = 1, metadata = {} } = req.body || {};

    if (!productId && !priceId && !Array.isArray(lineItems)) {
      res.status(400).json({ error: 'Missing productId, priceId, or lineItems' });
      return;
    }

    if (mode !== 'payment' && mode !== 'subscription') {
      res.status(400).json({ error: 'mode must be payment or subscription' });
      return;
    }

    let checkoutLineItems = [];
    let defaultPrice = priceId;

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      if (rejectBlockedMonthlyPrice(res, lineItems.map((item) => item?.priceId))) return;

      checkoutLineItems = lineItems
        .filter((item) => item?.priceId)
        .map((item) => ({
          price: String(item.priceId),
          quantity: Number(item.quantity) || 1,
        }));

      if (!checkoutLineItems.length) {
        res.status(400).json({ error: 'lineItems must include at least one priceId' });
        return;
      }
    }

    if (rejectBlockedMonthlyPrice(res, [defaultPrice])) return;

    if (!checkoutLineItems.length && !defaultPrice) {
      const product = await stripe.products.retrieve(productId);
      defaultPrice =
        typeof product.default_price === 'string'
          ? product.default_price
          : product.default_price?.id;
    }

    if (!checkoutLineItems.length && !defaultPrice) {
      res.status(400).json({ error: `Product ${productId} has no default_price` });
      return;
    }

    if (rejectBlockedMonthlyPrice(res, [defaultPrice])) return;

    const appBaseUrl = getAppBaseUrl();
    const normalizedMetadata = normalizeMetadata(metadata);
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: checkoutLineItems.length
        ? checkoutLineItems
        : [{ price: defaultPrice, quantity: Number(quantity) || 1 }],
      success_url: buildWorkspaceSuccessUrl(appBaseUrl, normalizedMetadata),
      cancel_url: normalizedMetadata.accessType === 'resident' ? `${appBaseUrl}/card?checkout=cancelled` : `${appBaseUrl}/pricing?checkout=cancelled`,
      metadata: normalizedMetadata,
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Stripe error' });
  }
}
