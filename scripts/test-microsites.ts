import {
  PARTNER_MICROSITE_REGISTRY,
  PUBLIC_PARTNER_MICROSITES,
} from "../src/content/microsites/partnerMicrositeRegistry";

const fail = (message: string) => {
  throw new Error(message);
};

const routes = new Set<string>();
const ids = new Set<string>();

for (const record of PARTNER_MICROSITE_REGISTRY) {
  if (!record.id || ids.has(record.id)) fail(`Duplicate or missing microsite id: ${record.id}`);
  ids.add(record.id);

  if (!record.route.startsWith("/")) fail(`Microsite route must be relative: ${record.name}`);
  if (routes.has(record.route)) fail(`Duplicate microsite route: ${record.route}`);
  routes.add(record.route);

  if (/notion\.(so|site)|app\.notion\.com/i.test(JSON.stringify(record))) {
    fail(`Public application registry leaks a Notion URL: ${record.name}`);
  }

  if (record.publicApproved) {
    if (!record.publicSafe) fail(`Public record is not public-safe: ${record.name}`);
    if (record.reviewState !== "approved") fail(`Public record lacks approval: ${record.name}`);
    if (record.readiness !== "ready") fail(`Public record is not ready: ${record.name}`);
    if (record.mediaState !== "approved") fail(`Public record lacks approved media: ${record.name}`);
  }

  if (record.type === "individual" && record.publicApproved) {
    fail(`Individual microsite cannot be public: ${record.name}`);
  }
}

if (PUBLIC_PARTNER_MICROSITES.some((record) => !record.publicApproved)) {
  fail("Public directory contains an unapproved record.");
}

console.log(`Validated ${PARTNER_MICROSITE_REGISTRY.length} microsite records; ${PUBLIC_PARTNER_MICROSITES.length} are public.`);
