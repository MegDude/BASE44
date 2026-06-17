export type Queryable = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

export type CloudSqlConfig = {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  instanceConnectionName?: string;
};

export function getCloudSqlConfig(env: Record<string, string | undefined> = process.env): CloudSqlConfig {
  return {
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    instanceConnectionName: env.DB_INSTANCE_CONNECTION_NAME,
  };
}

export async function createPool(config: CloudSqlConfig = getCloudSqlConfig()): Promise<Queryable> {
  const missing = [
    !config.host ? "DB_HOST" : "",
    !config.database ? "DB_NAME" : "",
    !config.user ? "DB_USER" : "",
    !config.password ? "DB_PASSWORD" : "",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Cloud SQL is not configured: ${missing.join(", ")}`);
  }

  const pg = await import("pg");
  const Pool = (pg as any).Pool;
  return new Pool({
    host: config.host,
    database: config.database,
    user: config.user,
    password: config.password,
    port: config.port || 5432,
  });
}

export async function getDb(explicitDb?: Queryable) {
  return explicitDb || createPool();
}
