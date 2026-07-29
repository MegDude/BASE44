import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("src/supabase/migrations/20260720021018_saved_redemption_partner_intelligence.sql", "utf8");
const savedApi = readFileSync("api/resident/saved.js", "utf8");
const qrApi = readFileSync("api/resident/qr-session.js", "utf8");
const validateApi = readFileSync("api/partner/redemptions/validate.js", "utf8");
const completeApi = readFileSync("api/partner/redemptions/[id]/complete.js", "utf8");
const rejectApi = readFileSync("api/partner/redemptions/[id]/reject.js", "utf8");
const map = readFileSync("src/pages/Map.jsx", "utf8");

for (const table of [
  "resident_profiles", "partner_users", "resident_saved_entities", "user_activity_events",
  "resident_qr_sessions", "perk_redemptions", "resident_preference_features", "partner_audit_events",
]) assert.match(migration, new RegExp(`create table if not exists public\\.${table}`), `missing ${table}`);

assert.match(migration, /unique \(resident_profile_id, entity_type, entity_id\)/, "saved entities must deduplicate");
assert.match(migration, /idempotency_key text not null unique/, "redemptions must be idempotent");
assert.match(migration, /token_hash text not null unique/, "only a token hash may be stored");
assert.match(migration, /security invoker/g, "transaction RPCs must not bypass caller security by default");
assert.match(migration, /revoke all on function public\.validate_partner_redemption[\s\S]*from public, anon, authenticated/, "validation RPC must remain server-only");
assert.match(migration, /having count\(distinct resident_profile_id\) >= 10/, "partner cohorts require a privacy threshold");
assert.doesNotMatch(migration, /create policy[^;]+resident_profiles[^;]+partner/i, "partners must not browse resident profiles");

assert.match(savedApi, /requireResidentProfile\(req\)/, "saved API must derive the resident from auth");
assert.doesNotMatch(savedApi, /req\.body\?\.profileId/, "saved API must not trust a client profile ID");
assert.match(savedApi, /dp_set_resident_saved_entity/, "saved API must support the deployed prefixed RPC");
assert.doesNotMatch(savedApi, /["']set_resident_saved_entity["']/, "saved API must not call the obsolete unprefixed RPC");
assert.match(savedApi, /p_auth_user_id: user\.id/, "saved API must call the deployed auth-user RPC contract");
assert.match(savedApi, /p_idempotency_key: idempotencyKey/, "saved API must persist an idempotency key");
assert.match(qrApi, /randomBytes\(32\)/, "QR tokens must have strong entropy");
assert.match(qrApi, /hashOpaqueToken\(rawToken\)/, "QR tokens must be hashed at rest");
assert.match(validateApi, /requirePartnerMembership\(req\)/, "validation must derive partner access from auth");
assert.doesNotMatch(validateApi, /req\.body\?\.partnerId/, "validation must not trust a partner ID");
assert.match(completeApi, /complete_partner_redemption/, "completion must use the atomic database RPC");
assert.match(rejectApi, /reject_partner_redemption/, "rejection must use the partner-scoped database RPC");
assert.match(migration, /PERK_LIMIT_REACHED/, "validation must enforce the total perk limit");
assert.match(migration, /REDEMPTION_EXPIRED/, "completion must enforce the short confirmation window");
assert.doesNotMatch(map, /postWorkflow\("\/api\/save"/, "map must not call the legacy save path");
assert.doesNotMatch(map, /redemption-token/, "map must not create permanent redemption payloads");

console.log("Saved activity and redemption security contract: PASS");
