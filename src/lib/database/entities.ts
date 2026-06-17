import { getDb, type Queryable } from "./client";

export type StoredEntity = {
  id: string;
  entity_type: string;
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
  image_url?: string;
  district?: string;
  partner_status?: string;
  status?: string;
  metadata?: Record<string, unknown>;
};

const ENTITY_COLUMNS = "id, entity_type, title, description, lat, lng, image_url, district, partner_status, status, metadata";

export async function getEntityById(id: string, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query<StoredEntity>(`select ${ENTITY_COLUMNS} from map_entities where id = $1 limit 1`, [id]);
  return result.rows[0] || null;
}

export async function getEntitiesByType(entityType: string, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query<StoredEntity>(`select ${ENTITY_COLUMNS} from map_entities where entity_type = $1 and status = 'active' order by title limit 250`, [entityType]);
  return result.rows;
}

export async function getNearbyEntities({ lat, lng, radiusMeters = 400, entityType }: { lat: number; lng: number; radiusMeters?: number; entityType?: string }, db?: Queryable) {
  const client = await getDb(db);
  const typeClause = entityType ? "and entity_type = $4" : "";
  const params = entityType ? [lat, lng, radiusMeters, entityType] : [lat, lng, radiusMeters];
  const result = await client.query<StoredEntity>(
    `select ${ENTITY_COLUMNS},
      (6371000 * acos(
        cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2)) +
        sin(radians($1)) * sin(radians(lat))
      )) as distance_meters
     from map_entities
     where lat is not null and lng is not null ${typeClause}
     and (6371000 * acos(
        cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2)) +
        sin(radians($1)) * sin(radians(lat))
      )) <= $3
     order by distance_meters asc
     limit 50`,
    params,
  );
  return result.rows;
}

export async function searchEntities(query: string, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query<StoredEntity>(
    `select ${ENTITY_COLUMNS}
     from map_entities
     where title ilike $1 or description ilike $1 or district ilike $1
     order by title
     limit 50`,
    [`%${query}%`],
  );
  return result.rows;
}

export async function saveEntity({ userId, residentId, entityId, entityType }: { userId?: string; residentId?: string; entityId: string; entityType: string }, db?: Queryable) {
  const client = await getDb(db);
  const result = await client.query(
    `insert into saved_entities (user_id, resident_id, entity_id, entity_type, source, status)
     values ($1, $2, $3, $4, 'map', 'active')
     returning id`,
    [userId || null, residentId || null, entityId, entityType],
  );
  return result.rows[0] || null;
}
