import assert from "node:assert/strict";
import {
  readPartnerWorkspaceScope,
  replacePartnerWorkspaceScope,
  withPartnerWorkspaceScope,
} from "../src/lib/partnerWorkspaceContext";

const scope = readPartnerWorkspaceScope(
  "?organizationId=org-1&portfolioId=portfolio-1&listingId=listing-1&range=30d",
  false,
);
assert.deepEqual(scope, {
  organizationId: "org-1",
  portfolioId: "portfolio-1",
  listingId: "listing-1",
  view: undefined,
  section: undefined,
  range: "30d",
});

const reportRoute = withPartnerWorkspaceScope("/partner-workspace/reports?view=redemptions", { ...scope, view: "overview" });
assert.match(reportRoute, /organizationId=org-1/);
assert.match(reportRoute, /portfolioId=portfolio-1/);
assert.match(reportRoute, /listingId=listing-1/);
assert.match(reportRoute, /range=30d/);
assert.match(reportRoute, /view=redemptions/);
assert.doesNotMatch(reportRoute, /view=overview/);

const mapRoute = withPartnerWorkspaceScope("/map?mode=partner", scope);
assert.match(mapRoute, /workspaceId=org-1/);
assert.match(mapRoute, /entityId=listing-1/);

const aggregateRoute = replacePartnerWorkspaceScope(
  "/partner-workspace/performance?organizationId=org-1&listingId=listing-1&range=30d",
  { organizationId: "org-1", range: "30d" },
);
assert.doesNotMatch(aggregateRoute, /listingId=/);
assert.match(aggregateRoute, /organizationId=org-1/);

const unscoped = readPartnerWorkspaceScope("", false);
assert.equal(unscoped.organizationId, undefined, "An unknown session must not receive an arbitrary organization");

console.log("Partner workspace scope contract passed.");
