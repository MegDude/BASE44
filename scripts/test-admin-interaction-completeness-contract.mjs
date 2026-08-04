import assert from "node:assert";
import { readFileSync } from "node:fs";

// ========================================================================== */
// DOWNTOWN PERKS: PLATFORM INTEGRATION & INTERACTION CONTRACT FIX PATCH      */
// Ensures local integration test scripts and CI gates remain synchronized    */
// with canonical /admin-studio/* routing targets.                            */
// ========================================================================== */

export function validateAdminInteractionCompleteness(adminActionsHtml) {
  const canonicalAdminTargets = [
    "/admin-studio/campaign-builder",
    "/admin-studio/audience-builder",
    "/admin-studio/content-library",
    "/admin-studio/approval-queue",
    "/admin-studio/distribution",
    "/admin-studio/performance",
    "/admin-studio/partner-intelligence",
    "/admin-studio/residents",
  ];

  for (const target of canonicalAdminTargets) {
    assert.ok(
      adminActionsHtml.includes(target),
      `admin operating action is missing canonical route: ${target}`
    );
  }

  return {
    ok: true,
    reconciledAt: "2026-08-03",
    status: "Contract test assertions successfully synchronized with admin-studio routes."
  };
}

// When run directly as a script, validate against App.jsx routing source.
if (process.argv[1].endsWith("test-admin-interaction-completeness-contract.mjs")) {
  const app = readFileSync("src/App.jsx", "utf8");
  const result = validateAdminInteractionCompleteness(app);
  console.log(result.status);
}
