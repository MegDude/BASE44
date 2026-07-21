import { supabaseServer } from "../../src/lib/supabaseServer.js";

const ACTIVE_PERK_STATUSES = new Set(["active", "live", "published"]);
const ACTIVE_EVENT_STATUSES = new Set(["active", "live", "published", "scheduled", "upcoming"]);

function text(value, max = 180) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function dateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function timeLabel(value) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }).format(value);
}

function eventTiming(row, now) {
  const starts = dateValue(row.start_time || row.date || row.start_at);
  const ends = dateValue(row.end_time || row.end_at);
  if (starts && starts <= now && (!ends || ends >= now)) return "Happening now";
  if (!starts) return "Date available in details";
  if (isSameDay(starts, now)) return `Starts today at ${timeLabel(starts)}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(starts, tomorrow)) return `Tomorrow at ${timeLabel(starts)}`;
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }).format(starts);
}

function perkTiming(row, now) {
  const starts = dateValue(row.starts_at || row.valid_from || row.start_date || row.start_at);
  const ends = dateValue(row.ends_at || row.valid_until || row.end_date || row.end_at);
  if (starts && starts > now) return `Starts ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" }).format(starts)}`;
  if (ends && isSameDay(ends, now)) return `Available until ${timeLabel(ends)}`;
  return "Available now";
}

function metadata(row) {
  return row?.metadata && typeof row.metadata === "object" ? row.metadata : {};
}

function partnerName(row, partners) {
  const meta = metadata(row);
  return text(
    partners.get(String(row.partner_id || ""))
      || row.venue_name
      || meta.partnerName
      || meta.organizationName
      || meta.venueName
  );
}

function mapHref(kind, row, place) {
  const params = new URLSearchParams({
    mode: "resident",
    tab: kind === "perk" ? "perks" : "events",
    filter: kind === "perk" ? "Perks" : "Events",
    query: text(row.title || place, 120),
  });
  if (kind === "perk") params.set("perkId", String(row.external_id || row.id));
  else params.set("eventId", String(row.id));
  if (row.entity_id) params.set("entityId", String(row.entity_id));
  return `/map?${params.toString()}`;
}

function isCurrentPerk(row, now) {
  if (!ACTIVE_PERK_STATUSES.has(String(row.status || "active").toLowerCase())) return false;
  const starts = dateValue(row.starts_at || row.valid_from || row.start_date || row.start_at);
  const ends = dateValue(row.ends_at || row.valid_until || row.end_date || row.end_at);
  return (!starts || starts.getTime() <= now.getTime() + 7 * 86400000) && (!ends || ends >= now);
}

function isCurrentEvent(row, now) {
  if (row.active === false || !ACTIVE_EVENT_STATUSES.has(String(row.status || "scheduled").toLowerCase())) return false;
  const starts = dateValue(row.start_time || row.date || row.start_at);
  const ends = dateValue(row.end_time || row.end_at);
  if (ends && ends < now) return false;
  return !starts || starts.getTime() <= now.getTime() + 7 * 86400000;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  if (!supabaseServer) {
    return res.status(200).json({ status: "unavailable", items: [], updatedAt: new Date().toISOString() });
  }

  try {
    const now = new Date();
    const [{ data: perks, error: perksError }, { data: events, error: eventsError }] = await Promise.all([
      supabaseServer.from("perks").select("*").order("updated_at", { ascending: false }).limit(40),
      supabaseServer.from("events").select("*").order("start_time", { ascending: true }).limit(40),
    ]);
    if (perksError && eventsError) throw perksError;

    const records = [...(perksError ? [] : (perks || [])), ...(eventsError ? [] : (events || []))];
    const partnerIds = [...new Set(records.map((row) => row.partner_id).filter(Boolean))];
    const partners = new Map();
    if (partnerIds.length) {
      const { data } = await supabaseServer.from("partners").select("id,name").in("id", partnerIds);
      (data || []).forEach((partner) => partners.set(String(partner.id), text(partner.name)));
    }

    const perkItems = (perksError ? [] : (perks || [])).filter((row) => isCurrentPerk(row, now)).map((row) => {
      const place = partnerName(row, partners);
      return place && text(row.title) ? {
        id: `perk:${row.id}`,
        kind: "perk",
        place,
        action: text(row.title),
        status: perkTiming(row, now),
        href: mapHref("perk", row, place),
        startsAt: row.starts_at || row.valid_from || row.start_date || row.start_at || null,
        updatedAt: row.updated_at || row.created_at || null,
        priority: 2,
      } : null;
    }).filter(Boolean);

    const eventItems = (eventsError ? [] : (events || [])).filter((row) => isCurrentEvent(row, now)).map((row) => {
      const place = partnerName(row, partners);
      const starts = dateValue(row.start_time || row.date || row.start_at);
      return place && text(row.title) ? {
        id: `event:${row.id}`,
        kind: "event",
        place,
        action: text(row.title),
        status: eventTiming(row, now),
        href: mapHref("event", row, place),
        startsAt: starts?.toISOString() || null,
        updatedAt: row.updated_at || row.created_at || null,
        priority: starts && starts <= now ? 0 : 1,
      } : null;
    }).filter(Boolean);

    const items = [...eventItems, ...perkItems]
      .sort((left, right) => left.priority - right.priority
        || Date.parse(left.startsAt || left.updatedAt || 0) - Date.parse(right.startsAt || right.updatedAt || 0))
      .slice(0, 6)
      .map(({ priority, ...item }) => item);

    return res.status(200).json({ status: items.length ? "ready" : "empty", items, updatedAt: now.toISOString() });
  } catch (error) {
    console.error("[resident-live-activity]", error);
    return res.status(200).json({ status: "unavailable", items: [], updatedAt: new Date().toISOString() });
  }
}
