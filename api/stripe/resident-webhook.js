import Stripe from "stripe";
import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";

async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_RESIDENT_WEBHOOK_SECRET;
    if (!secretKey || !webhookSecret) throw new TransactionApiError(503, "WEBHOOK_UNAVAILABLE", "Resident payment webhook is not configured.");

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    const signature = req.headers?.["stripe-signature"];
    const payload = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    const { error: eventInsertError } = await database.from("stripe_events").insert({ id: event.id, event_type: event.type, payload: event });
    if (eventInsertError && eventInsertError.code !== "23505") throw eventInsertError;
    if (eventInsertError?.code === "23505") return res.status(200).json({ received: true, duplicate: true });

    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      const session = event.data.object;
      const registrationId = session.metadata?.registrationId || session.client_reference_id;
      if (registrationId) {
        const { data: registration, error } = await database
          .from("pending_resident_registrations")
          .update({ status: "paid", updated_at: new Date().toISOString() })
          .eq("id", registrationId)
          .select("id,email,building_id,claimed_by")
          .maybeSingle();
        if (error) throw error;

        if (registration?.claimed_by) {
          const { data: profile } = await database.from("resident_profiles").select("id").eq("auth_user_id", registration.claimed_by).maybeSingle();
          if (profile) {
            const { data: membership, error: membershipError } = await database.from("resident_memberships").upsert({
              resident_id: profile.id,
              membership_type: "resident_annual",
              building_id: registration.building_id,
              source: "paid",
              price: Number(session.amount_total || 2500),
              currency: String(session.currency || "usd"),
              status: "active",
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
              renewal_date: null,
              updated_at: new Date().toISOString(),
            }, { onConflict: "resident_id" }).select("id").single();
            if (membershipError) throw membershipError;
            await database.from("resident_profiles").update({ membership_id: membership.id, building_id: registration.building_id, updated_at: new Date().toISOString() }).eq("id", profile.id);
            await database.from("resident_signup_events").upsert({
              auth_user_id: registration.claimed_by,
              resident_profile_id: profile.id,
              event_type: "payment_succeeded",
              status: "completed",
              email: registration.email,
              payload: { stripeEventId: event.id, stripeSessionId: session.id, amountTotal: session.amount_total, currency: session.currency },
              processed_at: new Date().toISOString(),
            }, { onConflict: "auth_user_id,event_type" });
          }
        }
      }
    }

    if (["checkout.session.async_payment_failed", "payment_intent.payment_failed"].includes(event.type)) {
      const object = event.data.object;
      const registrationId = object.metadata?.registrationId || object.client_reference_id;
      if (registrationId) {
        await database.from("pending_resident_registrations").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("id", registrationId);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
