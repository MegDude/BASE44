import { getDb, type Queryable } from "./client";

export async function getActiveEvents(db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, entity_id, title, description, start_time, end_time, address, lat, lng, image_url, rsvp_enabled, metadata
     from events
     where active = true and status in ('scheduled', 'active')
     order by start_time nulls last
     limit 250`,
  );
  return result.rows;
}

export async function getEventOccurrences(db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, title, start_time, end_time, timezone, venue_name, address, lat, lng, source, source_url, image_url, category, price_label, status, metadata
     from event_occurrences
     where status = 'scheduled'
     order by start_time nulls last
     limit 250`,
  );
  return result.rows;
}
