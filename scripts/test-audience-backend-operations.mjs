import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const endpoint = await readFile(new URL("../api/partner/audience.js", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/partner/workspace/WorkspaceAudience.jsx", import.meta.url), "utf8").catch(() => "");
const migration = await readFile(new URL("../supabase/migrations/202608020002_audience_scope_bindings.sql", import.meta.url), "utf8");

assert.match(endpoint, /requireAuthenticatedUser/);
assert.match(endpoint, /requirePartnerMembership/);
assert.match(endpoint, /audience_scope_bindings/);
assert.match(endpoint, /consent_partner_contact/);
assert.match(endpoint, /MINIMUM_COHORT_SIZE/);
assert.doesNotMatch(endpoint, /select\([^)]*(email_hash|external_member_id|resident_profile_id)/);
assert.match(migration, /enable row level security/);
assert.match(component, /getPartnerAudience/);
assert.match(component, /connectAudienceBuilding/);
assert.match(component, /Create campaign/);
assert.doesNotMatch(component, /POTENTIAL_REACH|mock audience/i);

console.log("Audience backend operations contract passed.");
