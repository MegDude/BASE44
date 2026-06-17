import { getDb, type Queryable } from "./client";

export async function getActivePerks(db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, partner_id, entity_id, entity_type, title, description, offer_text, start_date, end_date, redemption_type, metadata
     from perks
     where active = true and status = 'active'
     order by created_at desc
     limit 250`,
  );
  return result.rows;
}

export async function getPerksForEntity(entityId: string, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, title, description, offer_text, redemption_type, metadata
     from perks
     where entity_id = $1 and active = true and status = 'active'
     order by created_at desc`,
    [entityId],
  );
  return result.rows;
}
