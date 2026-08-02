import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [summaryApi, tracker, workspace, migration, importer] = await Promise.all([
  readFile(new URL("../api/partner/workspace-summary.js", import.meta.url), "utf8"),
  readFile(new URL("../api/track.js", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/202608020001_workspace_live_inventory.sql", import.meta.url), "utf8"),
  readFile(new URL("./sync-production-map-inventory.mjs", import.meta.url), "utf8"),
]);

assert.match(summaryApi, /requireAuthenticatedUser/, "workspace summary must require an authenticated server session");
assert.match(summaryApi, /requirePartnerMembership/, "workspace summary must enforce partner membership");
assert.match(summaryApi, /platform_profiles/, "workspace summary must resolve trusted platform roles");
assert.match(summaryApi, /partner_listings/, "workspace summary must calculate connected places from persisted listings");
assert.match(summaryApi, /partner_campaigns/, "workspace summary must calculate persisted campaigns");
assert.match(summaryApi, /eligibleResidents: null/, "unscoped audience must not be fabricated");
assert.match(summaryApi, /MAP_COVERAGE/, "published map coverage must have an explicit source");
assert.match(summaryApi, /map_inventory/, "workspace map coverage must read the canonical map inventory table");
assert.match(tracker, /partner_organization_id/, "analytics tracking must persist organization attribution");
assert.match(tracker, /listing_id/, "analytics tracking must persist listing attribution");
assert.match(tracker, /entity_id: isUuid\(entityId\) \? entityId : null/, "analytics tracking must write only UUID entity IDs");
assert.match(tracker, /map_entity_id/, "non-UUID public map IDs must remain in metadata");
assert.doesNotMatch(tracker, /attribution: \{ organizationId/, "public tracking must not return internal attribution IDs");
assert.match(summaryApi, /scopedListingsQuery/, "workspace listing rows must respect the active scope");
assert.match(summaryApi, /resolveListingId/, "public listing IDs must resolve inside the active organization before UUID queries");
assert.match(summaryApi, /WORKSPACE_SCOPE_INVALID/, "workspace identifiers must be validated before database filtering");
assert.match(workspace, /getPartnerWorkspaceSummary/, "workspace UI must request the server summary");
assert.match(workspace, /Map inventory/, "workspace UI must distinguish map coverage from connected places");
assert.doesNotMatch(workspace, /\["Potential audience", "Not connected"\]/, "workspace must not retain the fabricated potential-audience metric");
assert.match(migration, /create table if not exists public\.map_inventory/, "migration must create map inventory storage");
assert.match(migration, /create table if not exists public\.partner_campaigns/, "migration must create campaign storage");
assert.match(migration, /create table if not exists public\.audience_members/, "migration must create consent-aware audience storage");
assert.match(migration, /alter table public\.analytics_signals add column if not exists partner_organization_id/, "migration must add attribution");
assert.match(importer, /production-map-inventory\.json/, "inventory importer must use the approved published map registry");
assert.match(importer, /const dryRun = args\.has\("--dry-run"\)/, "inventory importer must expose an explicit dry-run mode");
assert.match(importer, /validateRecords/, "inventory importer must validate records before database writes");
assert.match(importer, /duplicate_id/, "inventory importer must reject duplicate IDs");
assert.match(importer, /invalid_latitude/, "inventory importer must validate latitude values");
assert.match(importer, /invalid_longitude/, "inventory importer must validate longitude values");
assert.match(importer, /planChanges/, "inventory importer must compare live rows before writing");
assert.match(importer, /noop/, "inventory importer must report no-op rows");
assert.match(importer, /written: dryRun \? 0 : changedRows\.length/, "dry-run mode must never report production writes");
assert.match(importer, /if \(!dryRun && changedRows\.length\)/, "upsert must be guarded behind non-dry-run mode and changed rows only");
assert.match(importer, /upsert/, "inventory importer must remain idempotent for changed rows");
assert.doesNotMatch(importer, /canonical_entities/, "inventory importer must not own backend canonical-entity persistence");
assert.doesNotMatch(migration, /references public\.canonical_entities/, "UI migration must not depend on an undeclared backend table");
console.log("Workspace live inventory contract: PASS");
