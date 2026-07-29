import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const text = (path) => readFileSync(resolve(root, path), "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const walk = (directory) => {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute)
    .flatMap((name) => {
      const path = resolve(absolute, name);
      return statSync(path).isDirectory() ? walk(relative(root, path)) : [relative(root, path)];
    })
    .sort();
};

const apiFiles = walk("api").filter((path) => /\.(js|ts)$/.test(path));
const migrationFiles = [...walk("supabase/migrations"), ...walk("src/supabase/migrations")].filter((path) => path.endsWith(".sql"));
const productionSourceFiles = [...apiFiles, ...walk("src")]
  .filter((path) => /\.(js|jsx|mjs|ts|tsx|sql)$/.test(path));
const productionSource = productionSourceFiles.map((path) => ({ path, content: text(path) }));

const requestedFlags = [
  "resident_access_v2",
  "redemption_v2",
  "rsvp_v2",
  "survey_pipeline_v2",
  "broadcast_delivery_v2",
  "partner_reporting_v2",
  "imports_v2",
];

const requiredDomains = {
  authSession: ["api/auth/session.js", "api/auth/session.ts"],
  organizations: ["api/organizations.js", "api/organizations.ts"],
  organizationMemberships: ["api/organization-memberships.js", "api/organization-memberships.ts"],
  residentProfiles: ["api/resident-profiles.js", "api/resident-profiles.ts"],
  buildingAccess: ["api/building-access.js", "api/building-access.ts"],
  partners: ["api/partners.js", "api/partners.ts"],
  partnerMemberships: ["api/partner-memberships.js", "api/partner-memberships.ts"],
  perks: ["api/perks.js", "api/perks.ts"],
  redemptionIssue: ["api/redemptions/issue.js", "api/redemptions/issue.ts"],
  redemptionVerify: ["api/redemptions/verify.js", "api/redemptions/verify.ts"],
  events: ["api/events.js", "api/events.ts"],
  eventRsvp: ["api/events/rsvp.js", "api/events/rsvp.ts"],
  eventCancelRsvp: ["api/events/cancel-rsvp.js", "api/events/cancel-rsvp.ts"],
  surveys: ["api/surveys.js", "api/surveys.ts"],
  surveyResponses: ["api/survey-responses.js", "api/survey-responses.ts"],
  broadcasts: ["api/broadcasts.js", "api/broadcasts.ts"],
  announcements: ["api/announcements.js", "api/announcements.ts"],
  reports: ["api/reports.js", "api/reports.ts"],
  exports: ["api/exports.js", "api/exports.ts"],
  importValidate: ["api/imports/validate.js", "api/imports/validate.ts"],
  importExecute: ["api/imports/execute.js", "api/imports/execute.ts"],
  adminAccounts: ["api/admin/accounts.js", "api/admin/accounts.ts"],
  auditEvents: ["api/audit-events.js", "api/audit-events.ts"],
};

const allSource = productionSource.map(({ content }) => content).join("\n");
const domainStatus = Object.fromEntries(
  Object.entries(requiredDomains).map(([domain, expectedFiles]) => [
    domain,
    {
      present: expectedFiles.some((path) => apiFiles.includes(path)),
      matchingFiles: expectedFiles.filter((path) => apiFiles.includes(path)),
      expectedFiles,
    },
  ]),
);

const envNames = [...new Set(
  [
    ...text(".env.example").matchAll(/^([A-Z][A-Z0-9_]*)=/gm),
    ...allSource.matchAll(/(?:process\.env\.|import\.meta\.env\.)([A-Z][A-Z0-9_]*)/g),
  ].map((match) => match[1]),
)].sort();

const demoSeedMatches = productionSource
  .flatMap(({ path, content }) =>
    content.split("\n").flatMap((line, index) =>
      /\b(seedDemoData|seed-demo|DEMO_CARD_CODE|DemoQrCode)\b/.test(line)
        ? [{ path, line: index + 1, excerpt: line.trim().slice(0, 180) }]
        : [],
    ),
  );

const routeSource = existsSync(resolve(root, "src/App.jsx")) ? text("src/App.jsx") : allSource;
const routePaths = [...new Set([...routeSource.matchAll(/path\s*=\s*["'`]([^"'`]+)["'`]/g)].map((match) => match[1]))].sort();
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

const baseline = {
  schemaVersion: "1.0.0",
  capturedAt: new Date().toISOString(),
  mode: "read-only repository baseline",
  canonicalRepository: "MegDude/BASE44",
  commit,
  deployment: {
    id: process.env.DP_BASELINE_DEPLOYMENT_ID || null,
    url: process.env.DP_BASELINE_DEPLOYMENT_URL || null,
    state: process.env.DP_BASELINE_DEPLOYMENT_STATE || "not-provided",
  },
  productionReadiness: {
    durablePersistenceConfigured: process.env.DP_BASELINE_DURABLE_PERSISTENCE === "true",
    frontendAuthConfigured: process.env.DP_BASELINE_FRONTEND_AUTH === "true",
    supabaseServerConfigured: process.env.DP_BASELINE_SUPABASE_SERVER === "true",
    databaseConfigured: process.env.DP_BASELINE_DATABASE === "true",
  },
  inventory: {
    apiCount: apiFiles.length,
    apiFiles: apiFiles.map((path) => ({ path, sha256: hash(text(path)) })),
    routeCount: routePaths.length,
    routePaths,
    migrationCount: migrationFiles.length,
    migrations: migrationFiles.map((path) => ({ path, sha256: hash(text(path)) })),
    environmentVariableNames: envNames,
  },
  featureFlags: Object.fromEntries(
    requestedFlags.map((flag) => [flag, { implemented: allSource.includes(flag) }]),
  ),
  demoAndSeed: {
    executableSeedRouteDetected: apiFiles.some((path) => /seed/i.test(path)),
    matches: demoSeedMatches,
  },
  requiredDomainStatus: domainStatus,
  productionDatabase: {
    recordCountsCaptured: false,
    checksumsCaptured: false,
    status: "blocked",
    reason: "Production readiness reports databaseConfigured=false; no Supabase project reference is committed. Do not substitute repository inventory counts for live database counts.",
  },
  guardrails: {
    schemaChanged: false,
    productionDataChanged: false,
    seedExecuted: false,
    importExecuted: false,
    harmonyDataImported: false,
  },
};

process.stdout.write(`${JSON.stringify(baseline, null, 2)}\n`);
