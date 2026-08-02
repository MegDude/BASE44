import {
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
} from "../../../src/lib/api/transactionAuth.js";

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };
const MINIMUM_REPORTABLE_AUDIENCE = 5;

function startOfRange(range) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - RANGE_DAYS[range]);
  return date.toISOString();
}

function isMissingRelation(error) {
  return /relation .* does not exist|42P01/i.test(String(error?.message || ""));
}

function isGuestActivity(row) {
  const metadata = row?.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const audience = String(metadata.audience || metadata.audienceType || metadata.audience_type || "").toLowerCase();
  const surface = String(row?.source_surface || "").toLowerCase();
  return audience === "guest" || audience === "hotel_guest" || surface.includes("guest") || surface.includes("hotel");
}

function reportableMetric(id, label, count, latestAt, emptyAction) {
  const hasActivity = count > 0;
  const reportable = count >= MINIMUM_REPORTABLE_AUDIENCE;
  return {
    id,
    label,
    value: reportable ? count : null,
    status: reportable ? "ready" : hasActivity ? "collecting" : "not_connected",
    latestAt: latestAt || null,
    description: reportable
      ? `Activity is attributed to this partner in the selected period.`
      : hasActivity
        ? `Activity is being collected. Totals appear after ${MINIMUM_REPORTABLE_AUDIENCE} people to protect individual privacy.`
        : `No attributable ${label.toLowerCase()} activity has been recorded for this partner yet.`,
    nextAction: reportable
      ? { label: "Review activity", href: "/partner-workspace/analytics?view=audience" }
      : emptyAction,
  };
}

function newest(rows, predicate = () => true) {
  return rows.filter(predicate).map((row) => row.occurred_at || row.completed_at || row.created_at).filter(Boolean).sort().at(-1) || null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const { membership } = await requirePartnerMembership(req);
    const range = RANGE_DAYS[req.query?.range] ? req.query.range : "30d";
    const from = startOfRange(range);

    const [{ data: activityRows, error: activityError }, { data: redemptionRows, error: redemptionError }] = await Promise.all([
      database.from("user_activity_events")
        .select("resident_profile_id,session_id,event_type,source_surface,metadata,occurred_at")
        .eq("partner_id", membership.partner_id)
        .gte("occurred_at", from)
        .order("occurred_at", { ascending: false })
        .limit(5000),
      database.from("perk_redemptions")
        .select("resident_profile_id,status,completed_at,started_at")
        .eq("partner_id", membership.partner_id)
        .eq("status", "completed")
        .gte("started_at", from)
        .order("started_at", { ascending: false })
        .limit(5000),
    ]);
    if (activityError) throw activityError;
    if (redemptionError) throw redemptionError;

    const leadResponse = await database.from("partner_audience_lead_events")
      .select("status,created_at")
      .eq("partner_id", membership.partner_id)
      .gte("created_at", from)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (leadResponse.error && !isMissingRelation(leadResponse.error)) throw leadResponse.error;

    const activity = activityRows || [];
    const redemptions = redemptionRows || [];
    const leads = leadResponse.data || [];
    const residentIds = new Set([
      ...activity.map((row) => row.resident_profile_id).filter(Boolean),
      ...redemptions.map((row) => row.resident_profile_id).filter(Boolean),
    ]);
    const attendeeIds = new Set(activity
      .filter((row) => ["event_rsvp", "civic_event_rsvp", "event_check_in", "check-in"].includes(String(row.event_type)))
      .map((row) => row.resident_profile_id || row.session_id)
      .filter(Boolean));
    const guestIds = new Set(activity
      .filter(isGuestActivity)
      .map((row) => row.session_id || row.resident_profile_id)
      .filter(Boolean));
    const openLeads = leads.filter((row) => !["closed", "archived"].includes(String(row.status || "").toLowerCase()));

    return res.status(200).json({
      ok: true,
      range: { key: range, from, to: new Date().toISOString() },
      privacy: { minimumReportableAudience: MINIMUM_REPORTABLE_AUDIENCE, personalDataIncluded: false },
      metrics: [
        reportableMetric("residents", "Residents", residentIds.size, newest([...activity, ...redemptions]), { label: "Review member benefit", href: "/partner-workspace/offers" }),
        reportableMetric("guests", "Guests", guestIds.size, newest(activity, isGuestActivity), { label: "Create guest link", href: "/partner-workspace/share-links" }),
        reportableMetric("attendees", "Attendees", attendeeIds.size, newest(activity, (row) => attendeeIds.has(row.resident_profile_id || row.session_id)), { label: "Create an event", href: "/partner-workspace/events" }),
        reportableMetric("leads", "Leads", openLeads.length, newest(openLeads), { label: "Add a contact path", href: "/partner-workspace/share-links" }),
      ],
      lastActivityAt: newest([...activity, ...redemptions, ...leads]),
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
