import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const endpoint = await readFile(new URL("../api/partner/audience.js", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/partner/workspace/WorkspaceAudience.jsx", import.meta.url), "utf8").catch(() => "");
const migration = await readFile(new URL("../supabase/migrations/202608020002_audience_scope_bindings.sql", import.meta.url), "utf8");
const packageManifest = await readFile(new URL("../package.json", import.meta.url), "utf8");

assert.doesNotThrow(() => JSON.parse(packageManifest), "package manifest must remain valid JSON");

assert.match(endpoint, /requireAuthenticatedUser/);
assert.match(endpoint, /requirePartnerMembership/);
assert.match(endpoint, /audience_scope_bindings/);
assert.match(endpoint, /consent_partner_contact/);
assert.match(endpoint, /MINIMUM_COHORT_SIZE/);

assert.doesNotMatch(endpoint, /analytics_signals[\s\S]{0,180}select\([^)]*\bsource\b(?!_type)/, "Audience activity must not query analytics_signals.source");
assert.match(endpoint, /analytics_signals[\s\S]{0,220}source_type/, "Audience activity must query analytics_signals.source_type");
assert.match(endpoint, /signal\.source_type/, "Audience activity must group by source_type");
assert.match(endpoint, /toRows\(bySource, "source"\)/, "API response must keep the { source, count } response label");

assert.match(endpoint, /applyNullableScopeFilter\(query, "portfolio_id", portfolioId\)/, "binding reads must preserve selected portfolio scope");
assert.match(endpoint, /applyNullableScopeFilter\(query, "listing_id", listingId\)/, "binding reads must preserve selected listing scope");
assert.match(endpoint, /applyNullableScopeFilter\(existingQuery, "portfolio_id", scope\.portfolioId\)/, "existing-binding lookup must use selected portfolio scope");
assert.match(endpoint, /applyNullableScopeFilter\(existingQuery, "listing_id", scope\.listingId\)/, "existing-binding lookup must use selected listing scope");
assert.match(endpoint, /portfolio_id:\s*scope\.portfolioId/, "inserted/reactivated bindings must persist portfolio_id");
assert.match(endpoint, /listing_id:\s*scope\.listingId/, "inserted/reactivated bindings must persist listing_id");
assert.match(endpoint, /value \? query\.eq\(column, value\) : query\.is\(column, null\)/, "organization-wide bindings must remain null-scoped only when no scope is selected");

assert.match(endpoint, /readPortfolioListingIds/, "portfolio activity must resolve scoped listing IDs");
assert.match(endpoint, /partner_listings[\s\S]{0,240}portfolio_id/, "portfolio activity must filter through listings in the selected portfolio");
assert.match(endpoint, /if \(!listingIds\.length\)[\s\S]{0,160}total: 0/, "portfolio activity with no listings must return zero activity");
assert.match(endpoint, /query\.in\("listing_id", listingIds\)/, "portfolio activity must filter analytics_signals by scoped listing IDs");
assert.match(endpoint, /query\.eq\("listing_id", scope\.listingId\)/, "direct listing activity filter must remain in place");

assert.match(endpoint, /source\.status === "connected"/, "only connected audience sources may contribute members");
assert.match(endpoint, /\.in\("source_id", connectedSourceIds\)/, "member reach must exclude inactive sources");
assert.match(endpoint, /sourceHealthRows/, "source health visibility should remain in the response");

assert.match(endpoint, /dedupeMembers/, "Audience members must be deduplicated before aggregation");
assert.match(endpoint, /memberIdentityKey/, "Audience dedupe must use stable canonical identity");
assert.match(endpoint, /RESIDENT_PROFILE_COLUMN[\s\S]{0,240}EMAIL_HASH_COLUMN[\s\S]{0,240}EXTERNAL_MEMBER_COLUMN/, "Audience dedupe must prefer resident profile, then email hash, then source identity");
assert.match(endpoint, /existing\.consent_partner_contact === true && member\.consent_partner_contact === true/, "deduped contact consent must aggregate conservatively");
assert.match(endpoint, /const dedupedMembers = dedupeMembers\(members \|\| \[\]\);[\s\S]{0,140}aggregateMembers\(dedupedMembers/, "cohort thresholds must run after dedupe");

assert.doesNotMatch(endpoint, /email_hash|resident_profile_id|external_member_id/, "Audience API source must not expose literal person-level identifier fields to browser responses");
assert.doesNotMatch(endpoint, /return res\.status\(200\)\.json\([\s\S]*(email_hash|resident_profile_id|external_member_id)/, "Audience API must not return person-level identifiers");
assert.match(migration, /enable row level security/);
assert.match(migration, /coalesce\(portfolio_id::text, ''\)/, "binding uniqueness must distinguish root and scoped portfolio bindings");
assert.match(migration, /coalesce\(listing_id::text, ''\)/, "binding uniqueness must distinguish root and scoped listing bindings");
assert.doesNotMatch(migration, /create policy[^;]+audience_(members|sources|scope_bindings)[^;]+(anon|authenticated)/i, "audience backend tables must not gain browser-readable RLS policies");
assert.match(component, /getPartnerAudience/);
assert.match(component, /connectAudienceBuilding/);
assert.match(component, /Create campaign/);
assert.doesNotMatch(component, /POTENTIAL_REACH|mock audience/i);

console.log("Audience backend operations contract passed.");
