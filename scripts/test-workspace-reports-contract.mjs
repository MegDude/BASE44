import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const surface = await readFile(new URL("../src/components/partner/workspace/WorkspaceReportsSurface.jsx", import.meta.url), "utf8");
const client = await readFile(new URL("../src/services/platform/reportClient.ts", import.meta.url), "utf8");
const endpoint = await readFile(new URL("../api/workspace/reports.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/workspace-reports-surface.css", import.meta.url), "utf8");

assert.ok(workspace.includes('import { WorkspaceReportsSurface }'));
assert.ok(workspace.includes('<WorkspaceReportsSurface key="reports" scope={workspaceScope} />'));
assert.ok(surface.includes("const reportScopeKey = useMemo"));
assert.ok(surface.includes("getWorkspaceReport(JSON.parse(reportScopeKey), controller.signal)"));
assert.ok(surface.includes("}, [reportScopeKey, retryNonce]);"));
assert.doesNotMatch(surface, /setInterval|refetchOnWindowFocus|Date\.now\(\)/);
assert.ok(surface.includes("Apply range"));
assert.ok(surface.includes("No activity has been recorded for this selection yet."));
assert.ok(surface.includes("Try again"));
assert.ok(client.includes("/api/workspace/reports?"));
assert.ok(client.includes("format=csv"));
assert.ok(endpoint.includes("resolveAuthorizedWorkspaceScope"));
assert.ok(endpoint.includes('partner_organization_id'));
assert.ok(styles.includes("@media (max-width: 640px)"));
console.log("Workspace reports contract: PASS");
