import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const home = read("src/pages/ResidentHome.tsx");
const map = read("src/pages/Map.jsx");
const auth = read("src/lib/AuthContext.jsx");
const account = read("src/lib/residentMembership/residentAccount.ts");
const workflows = read("src/lib/backendWorkflows.ts");
const platformClient = read("src/lib/partner/partnerMapContentClient.ts");

const checks = [
  [account.includes("resident_membership_buildings"), "membership building relation is normalized"],
  [account.includes("residentAccountStatus"), "account status has one shared formatter"],
  [home.includes("getResidentMembership") && home.includes("isAuthenticated") && home.includes("logout"), "resident home hydrates and signs out the authenticated resident"],
  [map.includes("residentAccountFromContext") && map.includes("getResidentMembership"), "resident map card uses the same authenticated account"],
  [map.includes('navigate(`/residents/login?returnTo='), "protected resident card actions return through resident sign-in"],
  [map.includes("dp-resident-card-signout"), "resident map card exposes sign out"],
  [!map.includes('value="Verified Resident"'), "resident status is not hard-coded"],
  [!map.includes("December 2026"), "resident renewal is not hard-coded"],
  [auth.includes('redirectPath = ""') && auth.includes('isResidentAccount ? "/residents/login"'), "logout returns each audience to its own sign-in"],
  [workflows.includes('authHeaders["Idempotency-Key"]'), "transaction requests send their idempotency key"],
  [platformClient.includes("https://downtown-perks-backend.vercel.app"), "production account clients use the public backend domain"],
  [workflows.includes("PLATFORM_WORKFLOW_PREFIXES") && workflows.includes("workflowUrl(endpoint)"), "protected resident and redemption workflows use the backend service"],
];

const failed = checks.filter(([ok]) => !ok);
for (const [ok, label] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
