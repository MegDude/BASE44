import crypto from "node:crypto";
import Stripe from "stripe";
import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../../src/lib/api/transactionAuth.js";

function clean(value, limit = 320) {
  return String(value || "").trim().slice(0, limit);
}

function getBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://base-44-downtown-perks-live-meg-dude.vercel.app";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const buildingId = clean(req.body?.buildingId, 80);
    const email = clean(req.body?.email, 320).toLowerCase();
    if (!buildingId || !email) throw new TransactionApiError(400, "MEMBERSHIP_INPUT_REQUIRED", "Choose your building and enter your email.");

    const { data: building, error: buildingError } = await database
      .from("resident_membership_buildings")
      .select("id,name,slug,district,partner_status,resident_membership_included,resident_price_override")
      .eq("id", buildingId)
      .eq("searchable", true)
      .maybeSingle();
    if (buildingError) throw buildingError;
    if (!building) throw new TransactionApiError(404, "BUILDING_NOT_FOUND", "That building is not available for resident membership.");

    const source = building.partner_status === "active" && building.resident_membership_included ? "free_building" : "paid";
    const price = source === "free_building" ? 0 : Number(building.resident_price_override ?? 2500);
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const { data: registration, error: registrationError } = await database
      .from("pending_resident_registrations")
      .insert({ building_id: building.id, email, source, token_hash: tokenHash, status: "pending" })
      .select("id")
      .single();
    if (registrationError) throw registrationError;

    const baseUrl = getBaseUrl();
    if (source === "free_building") {
      return res.status(200).json({
        source,
        nextUrl: `${baseUrl}/residents/login?mode=register&registration=${encodeURIComponent(token)}&returnTo=${encodeURIComponent("/resident/home")}`,
      });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_RESIDENT_ANNUAL_PRICE_ID;
    if (!secretKey || !priceId) throw new TransactionApiError(503, "CHECKOUT_UNAVAILABLE", "Resident checkout is not configured yet.");
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: registration.id,
      success_url: `${baseUrl}/residents/login?mode=register&registration=${encodeURIComponent(token)}&checkout=success&session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent("/resident/home")}`,
      cancel_url: `${baseUrl}/residents/membership?checkout=cancelled`,
      metadata: {
        accessType: "resident",
        registrationId: registration.id,
        buildingId: building.id,
        buildingName: building.name,
        membershipSource: source,
        annualPrice: String(price),
      },
    });

    await database.from("pending_resident_registrations").update({ stripe_checkout_session_id: session.id, status: "checkout_created", updated_at: new Date().toISOString() }).eq("id", registration.id);
    return res.status(200).json({ source, checkoutUrl: session.url });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
