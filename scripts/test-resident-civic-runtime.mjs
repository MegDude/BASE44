import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const files = [
  "src/pages/ResidentHome.tsx",
  "src/pages/ResidentCivicHub.tsx",
  "src/features/resident/civic/QuickCivicQuestion.tsx",
  "src/features/resident/resident-pass/ResidentPassModal.tsx",
  "api/resident/civic.js",
  "api/resident/home.js",
  "api/resident/qr-session.js",
  "api/partner/governance.js",
  "supabase/migrations/202607210002_resident_civic_runtime.sql",
];
for (const file of files) assert.ok(existsSync(file), `Missing resident civic runtime file: ${file}`);

const home = readFileSync(files[0], "utf8");
for (const label of ["Open map", "Show resident pass", "Civic inbox"]) assert.match(home, new RegExp(label, "i"), `Missing Home action: ${label}`);
for (const removed of ["Ask Downtown", "Quick actions", "Walking routes", "Collections", "Where should we go?"]) assert.ok(!home.includes(removed), `Removed Home discovery remains: ${removed}`);
assert.equal((home.match(/dp-resident-home-primary-actions/g) || []).length, 1, "Home must have one primary action group");
assert.match(home, /setPassOpen\(true\)/, "Home does not open the secure Resident Pass");

const layout = readFileSync("src/components/Layout.jsx", "utf8");
assert.match(layout, /pathname\.startsWith\("\/resident\/civic"\)/, "Civic Inbox is not treated as a native product route");

const civicPage = readFileSync("src/pages/ResidentGovernance.tsx", "utf8");
for (const label of ["Open civic map", "Send a question", "Your activity"]) assert.match(civicPage, new RegExp(label, "i"), `Missing Civic Inbox action: ${label}`);
assert.doesNotMatch(civicPage, /reason\.message/, "Civic Inbox exposes raw service errors to residents");

const civicApi = readFileSync("api/resident/civic.js", "utf8");
assert.match(civicApi, /submit_resident_civic_response/, "Civic responses do not use the atomic database transaction");
assert.match(civicApi, /requireResidentProfile/, "Civic responses are not resident scoped");

const migration = readFileSync(files.at(-1), "utf8");
for (const table of ["resident_civic_inbox","civic_action_followups","civic_signals"]) assert.match(migration, new RegExp(`create table if not exists public\\.${table}`), `Missing civic extension table: ${table}`);
for (const canonical of ["governance_consultations","governance_consultation_responses","partner_organizations","partner_intelligence_sources","partner_intelligence_records"]) assert.ok(migration.includes(canonical), `Civic runtime does not extend canonical ${canonical}`);
assert.doesNotMatch(migration, /create table if not exists public\.civic_(organizations|actions|survey_responses)/, "Migration creates duplicate civic records instead of extending governance records");
assert.match(migration, /enable row level security/g, "Civic tables do not enable RLS");
assert.match(migration, /alter publication supabase_realtime add table public\.resident_civic_inbox/, "Civic Inbox is not enabled for realtime");
assert.match(migration, /grant execute on function public\.submit_resident_civic_response[\s\S]*to service_role/, "Civic response transaction is not server-only");

console.log("Resident Home, Civic Inbox, secure pass, event, permission, and realtime contracts: PASS");
