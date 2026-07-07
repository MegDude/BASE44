import { supabaseServer } from '../src/lib/supabaseServer.js';

function clean(value, limit = 500) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function nullableUuid(value) {
  return isUuid(value) ? String(value) : null;
}

async function insertBestEffort(table, row) {
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    return error ? { table, status: "skipped", reason: error.message } : { table, status: "stored" };
  } catch (error) {
    return { table, status: "skipped", reason: error?.message || "insert_failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, status: "accepted" });
  }

  const { cardCode, venueOfferId, venueId } = req.body || {};
  if (!cardCode || !venueOfferId || !venueId) {
    const body = req.body || {};
    const entityId = clean(body.entityId || body.venueId || body.perkId || body.entity?.id, 180);
    const profileId = clean(body.profileId || body.uid || body.residentUid, 180);
    const sessionId = clean(body.sessionId, 180);
    const source = clean(body.source, 120) || "resident_card";
    if (!entityId && !profileId && !sessionId) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: cardCode, venueOfferId, and venueId are required' });
    }

    const metadata = {
      ...body,
      entityId,
      profileId,
      sessionId,
      source,
      capturedAt: new Date().toISOString(),
    };
    const writes = [];
    writes.push(await insertBestEffort("analytics_signals", {
      source_type: "resident_card",
      action_type: "redemption",
      value: 1,
      session_token: sessionId || null,
      user_email: profileId || null,
      district: clean(body.district || body.entity?.district, 120) || null,
    }));
    writes.push(await insertBestEffort("perk_redemptions", {
      perk_id: nullableUuid(entityId),
      source,
      status: clean(body.status, 80) || "presented",
      metadata,
    }));
    writes.push(await insertBestEffort("resident_activity", {
      entity_id: nullableUuid(entityId),
      entity_type: clean(body.entityType || body.entity?.type, 120) || "perk",
      activity_type: clean(body.action, 80) || "show_card",
      points: 20,
      source,
      status: "active",
      metadata,
    }));

    return res.status(200).json({ ok: true, status: "accepted" });
  }

  const { data: card, error: cardError } = await supabaseServer
    .from('perk_cards')
    .select('id')
    .eq('card_code', cardCode)
    .maybeSingle();

  if (cardError) {
    return res.status(500).json({ error: cardError.message });
  }

  if (!card) {
    return res.status(400).json({ error: 'Card not found' });
  }

  const { error: redemptionError } = await supabaseServer.from('redemptions').insert({
    perk_card_id: card.id,
    venue_offer_id: venueOfferId,
    venue_id: venueId
  });

  if (redemptionError) {
    return res.status(500).json({ error: redemptionError.message });
  }

  return res.status(200).json({ ok: true });
}
