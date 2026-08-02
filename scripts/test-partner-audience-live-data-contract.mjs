import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [api, panel, migration, page] = await Promise.all([
  readFile(new URL("../api/partner/audience/overview.js", import.meta.url), "utf8"),
  readFile(new URL("../src/features/partner/audience/PartnerAudiencePanel.tsx", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/20260802064500_partner_audience_aggregate_contract.sql", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8"),
]);

assert.match(api, /requirePartnerMembership/, "Audience API must authorize through partner membership.");
assert.match(api, /user_activity_events/, "Audience API must use attributed activity.");
assert.match(api, /perk_redemptions/, "Audience API must include verified redemptions.");
assert.match(api, /partner_audience_lead_events/, "Audience API must include real lead events.");
assert.match(api, /MINIMUM_REPORTABLE_AUDIENCE = 5/, "Audience counts need a privacy threshold.");
assert.match(panel, /\/api\/partner\/audience\/overview/, "Workspace must request the live audience API.");
assert.match(panel, /There are no estimates, borrowed totals, or contact records/, "Workspace must clearly reject placeholder totals and PII.");
assert.match(migration, /enable row level security/, "Audience lead events require RLS.");
assert.match(migration, /revoke all/, "Audience lead events must not be exposed through the Data API.");
assert.match(page, /PartnerAudiencePanel/, "Residents route must render the live audience panel.");
console.log("partner audience live-data contract passed");
