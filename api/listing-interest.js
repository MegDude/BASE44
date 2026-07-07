import { supabaseServer } from '../src/lib/supabaseServer.js';
import { appendListingInterestLead } from "../src/lib/googleSheets.js";

function clean(value, limit = 1000) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function cleanListing(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return {
    id: clean(value.id || value.listingId || value.entityId, 180),
    name: clean(value.name || value.buildingName || value.title, 240),
    listingType: clean(value.listingType, 80),
    address: clean(value.address, 300),
    price: clean(value.price, 100),
    beds: clean(value.beds, 40),
    baths: clean(value.baths, 40),
    sqft: clean(value.sqft, 80),
    daysOnMarket: clean(value.daysOnMarket, 80),
    neighborhood: clean(value.neighborhood, 160),
    source: clean(value.source, 160),
    brand: clean(value.brand, 160) || "Legends Real Estate",
    contactEmail: clean(value.contactEmail || value.contact_email, 240),
  };
}

function listingInterestRecipient(listing) {
  return (
    listing.contactEmail ||
    clean(process.env.LEGENDS_LISTING_CONTACT_EMAIL, 240) ||
    clean(process.env.LEGENDS_CONTACT_EMAIL, 240) ||
    clean(process.env.LISTING_INTEREST_NOTIFICATION_EMAIL, 240) ||
    clean(process.env.MANAGEMENT_NOTIFICATION_EMAIL, 240)
  );
}

function escapeHtml(value) {
  return clean(value, 4000).replace(/[<&>"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
  }[char]));
}

function buildListingInterestEmail(interest) {
  const listing = interest.listing;
  const lines = [
    ["Name", interest.name],
    ["Email", interest.email],
    ["Phone", interest.phone],
    ["Move timeline", interest.moveTimeline],
    ["Message", interest.message],
    ["Listing", listing.address || listing.name || listing.id],
    ["Building", listing.name],
    ["Neighborhood", listing.neighborhood],
    ["Price", listing.price],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sqft", listing.sqft],
    ["Source", listing.source],
    ["Session", interest.sessionId],
  ].filter(([, value]) => clean(value));

  return `
    <h2>New Legends listing interest</h2>
    <p>A resident submitted interest from the Downtown Perks map.</p>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      ${lines.map(([label, value]) => `<tr><td style="font-weight:700;vertical-align:top;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
  `;
}

async function notifyListingContact(interest) {
  const recipient = listingInterestRecipient(interest.listing);
  if (!recipient) return { status: "pending_configuration", reason: "recipient_not_configured" };
  if (!process.env.RESEND_API_KEY) return { status: "pending_configuration", reason: "resend_not_configured", recipient };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LISTING_INTEREST_FROM_EMAIL || "Downtown Perks <notifications@downtownperks.local>",
      to: recipient,
      subject: `New listing interest: ${interest.listing.address || interest.listing.name || "Legends listing"}`,
      html: buildListingInterestEmail(interest),
    }),
  });

  return { status: response.ok ? "sent" : "failed", providerStatus: response.status, recipient };
}

async function appendInterestToSheet(interest) {
  try {
    await appendListingInterestLead(interest);
    return { status: "appended" };
  } catch (error) {
    if (/Google Sheets environment variables are not configured/i.test(error?.message || "")) {
      return { status: "pending_configuration", reason: "google_sheets_not_configured" };
    }
    return { status: "failed", error: error?.message || "Google Sheets append failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const { name, email, phone, moveTimeline, message, sessionId, profileId, pageUrl } = req.body || {};
  const listing = cleanListing(req.body?.listing);
  if (!clean(name) || !clean(email) || !clean(phone) || !listing.address) {
    return res.status(400).json({ error: 'Missing required fields: name, email, phone, and listing.address are required' });
  }

  const interest = {
    createdAt: new Date().toISOString(),
    name: clean(name, 160),
    email: clean(email, 240),
    phone: clean(phone, 80),
    moveTimeline: clean(moveTimeline, 120),
    message: clean(message, 2000),
    listing,
    sessionId: clean(sessionId, 180),
    profileId: clean(profileId, 180),
    pageUrl: clean(pageUrl, 1000),
  };

  const { error } = await supabaseServer.from('listing_interest_requests').insert({
    name: interest.name,
    email: interest.email,
    phone: interest.phone,
    move_timeline: interest.moveTimeline || null,
    message: interest.message || null,
    listing: interest.listing,
    session_id: interest.sessionId || null,
    profile_id: interest.profileId || null
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const [sheet, notification] = await Promise.all([
    appendInterestToSheet(interest),
    notifyListingContact(interest),
  ]);

  return res.status(200).json({
    ok: true,
    storage: { status: "stored", table: "listing_interest_requests" },
    sheet,
    notification,
  });
}
