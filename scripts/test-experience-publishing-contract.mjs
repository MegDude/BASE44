import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const component = readFileSync("src/components/partner/workspace/WorkspaceExperienceSystem.jsx", "utf8");
const contract = readFileSync("src/lib/experiences/experienceSystem.ts", "utf8");

assert.equal(existsSync("api/experiences.js"), false, "experience persistence must remain in the Backend Platform");
assert.equal(
  existsSync("supabase/migrations/20260728160000_restore_partner_experience_publishing.sql"),
  false,
  "experience schema and RLS must remain in the Backend Platform",
);
assert.match(contract, /publish:\s*"\/api\/experiences"/);
assert.match(component, /getPartnerContentApiBaseUrl\(\).*EXPERIENCE_API_CONTRACT\.publish/);
assert.match(component, /Authorization:\s*`Bearer \$\{token\}`/);
assert.match(component, /"Idempotency-Key": idempotencyKeyRef\.current/);
assert.match(component, /cache:\s*"no-store"/);
assert.match(component, /if \(!draft\.organizationId\)/);
assert.match(component, /if \(!response\.ok \|\| !body\?\.data\?\.id\)/);
assert.match(component, /setPublishState\("error"\)/);

console.log("Experience publishing frontend/backend contract checks passed.");
