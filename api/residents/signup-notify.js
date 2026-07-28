import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";

function clean(value, limit = 500) {
  return String(value || "").trim().slice(0, limit);
}

function getAdminEmail() {
  return clean(process.env.RESIDENT_SIGNUP_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "me@megdude.com", 320);
}

async function sendResendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = clean(process.env.RESIDENT_EMAIL_FROM || "Downtown Perks <members@downtownperks.com>", 320);
  if (!apiKey) return { skipped: true, reason: "RESEND_API_KEY missing" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || "Resend delivery failed");
  return { skipped: false, id: body?.id || null };
}

async function appendGoogleSheet(payload) {
  const webhookUrl = process.env.RESIDENT_SIGNUP_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.RESIDENT_SIGNUP_SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl) return { skipped: true, reason: "Sheets webhook missing" };
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Google Sheets sync failed (${response.status})`);
  return { skipped: false };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const secret = clean(req.headers?.["x-signup-notify-secret"], 500);
    const expected = clean(process.env.RESIDENT_SIGNUP_NOTIFY_SECRET, 500);
    if (!expected || secret !== expected) throw new TransactionApiError(401, "NOTIFY_UNAUTHORIZED", "Unauthorized.");

    const authUserId = clean(req.body?.authUserId, 80);
    if (!authUserId) throw new TransactionApiError(400, "AUTH_USER_REQUIRED", "Missing auth user ID.");

    const { data: profile, error } = await database
      .from("resident_profiles")
      .select("id,auth_user_id,first_name,last_name,email,phone,apartment,building_id,created_at,interests,consent_partner_contact")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new TransactionApiError(404, "PROFILE_NOT_FOUND", "Resident profile not found.");

    const { data: building } = profile.building_id
      ? await database.from("resident_membership_buildings").select("name,district,address").eq("id", profile.building_id).maybeSingle()
      : { data: null };
    const { data: membership } = await database
      .from("resident_memberships")
      .select("id,source,status,price,currency,stripe_customer_id,stripe_subscription_id,created_at")
      .eq("resident_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "New resident";
    const payload = {
      timestamp: new Date().toISOString(),
      residentId: profile.id,
      authUserId: profile.auth_user_id,
      name,
      email: profile.email || "",
      phone: profile.phone || "",
      building: building?.name || "",
      district: building?.district || "",
      apartment: profile.apartment || "",
      membershipSource: membership?.source || "",
      membershipStatus: membership?.status || "account_created",
      stripeCustomerId: membership?.stripe_customer_id || "",
      stripeSubscriptionId: membership?.stripe_subscription_id || "",
      interests: profile.interests || [],
      marketingConsent: Boolean(profile.consent_partner_contact),
      signupSource: clean(req.body?.source || "resident_signup", 120),
    };

    const adminEmail = getAdminEmail();
    const adminResult = await sendResendEmail({
      to: adminEmail,
      subject: `New Downtown Perks resident: ${name}`,
      html: `<h1>New resident signup</h1><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${payload.email}</p><p><strong>Building:</strong> ${payload.building || "Not selected"}</p><p><strong>Membership:</strong> ${payload.membershipStatus}</p><p><strong>Source:</strong> ${payload.signupSource}</p><p><strong>Time:</strong> ${payload.timestamp}</p>`,
    });

    const welcomeResult = profile.email
      ? await sendResendEmail({
          to: profile.email,
          subject: "Welcome to Downtown Perks",
          html: `<h1>Welcome, ${profile.first_name || "downtown resident"}.</h1><p>Your Downtown Perks account is ready. Continue to your resident home to finish your profile, confirm your building, and open your personal map.</p><p><a href="https://base-44-downtown-perks-live-meg-dude.vercel.app/resident/home">Open resident home</a></p>`,
        })
      : { skipped: true, reason: "Resident email missing" };

    const sheetResult = await appendGoogleSheet(payload);

    const eventUpdates = [
      ["admin_notified", adminResult],
      ["welcome_sent", welcomeResult],
      ["sheet_synced", sheetResult],
    ];
    for (const [eventType, result] of eventUpdates) {
      await database.from("resident_signup_events").upsert({
        auth_user_id: profile.auth_user_id,
        resident_profile_id: profile.id,
        event_type: eventType,
        status: result.skipped ? "skipped" : "completed",
        email: profile.email,
        payload: result,
        processed_at: new Date().toISOString(),
      }, { onConflict: "auth_user_id,event_type" });
    }

    return res.status(200).json({ ok: true, adminResult, welcomeResult, sheetResult });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
