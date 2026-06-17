import { getDb, type Queryable } from "./client";

export async function getLegendsProperties(db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, slug, name, description, address, district, lat, lng, image_url, logo_url, partner_status, metadata
     from properties
     where status = 'active'
     order by name`,
  );
  return result.rows;
}

export async function getPropertyListings(propertyId: string, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `select id, source_entity_id, target_entity_id, relationship_type, metadata
     from entity_relationships
     where source_entity_id = $1 and relationship_type in ('listing', 'unit', 'available_unit')`,
    [propertyId],
  );
  return result.rows;
}
