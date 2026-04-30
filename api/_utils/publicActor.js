import { createClient } from "@supabase/supabase-js";

const ENTITY_TYPES = new Set([
  "venue",
  "event",
  "perk",
  "building",
  "property",
  "hotel",
  "brand",
  "civic",
  "partner",
]);

function readBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== "string") return null;
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function sanitizeString(value, { max = 255, required = true } = {}) {
  if (typeof value !== "string") {
    if (!required) return null;
    throw new Error("Expected a string value");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    if (!required) return null;
    throw new Error("Expected a non-empty value");
  }

  return trimmed.slice(0, max);
}

export function sanitizeEntityType(value) {
  const entityType = sanitizeString(value, { max: 32 }).toLowerCase();
  if (!ENTITY_TYPES.has(entityType)) {
    throw new Error(`Unsupported entity type: ${entityType}`);
  }
  return entityType;
}

export async function resolvePublicActor(req) {
  const accessToken = readBearerToken(req);
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (accessToken && supabaseUrl && supabaseAnonKey) {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await authClient.auth.getUser();
    if (!error && data?.user?.id) {
      return {
        actorId: data.user.id,
        actorType: "profile",
      };
    }
  }

  const sessionId =
    req.body?.sessionId ||
    req.headers?.["x-session-id"] ||
    req.headers?.["X-Session-Id"];

  if (typeof sessionId === "string" && sessionId.trim()) {
    return {
      actorId: `session:${sessionId.trim().slice(0, 96)}`,
      actorType: "session",
    };
  }

  throw new Error("Missing user identity. Provide a signed-in session or a public sessionId.");
}
