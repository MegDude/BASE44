import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const surface = await readFile(new URL("../src/components/partner/workspace/WorkspaceReportsSurface.jsx", import.meta.url), "utf8");
const client = await readFile(new URL("../src/services/platform/reportClient.ts", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/workspace-reports-surface.css", import.meta.url), "utf8");

assert.match(workspace, /WorkspaceReportsSurface/);
assert.match(workspace, /<WorkspaceReportsSurface key="reports" scope={workspaceScope} />/);
assert.match(surface, /const reportScopeKey = useMemo/);
assert.match(surface, /getWorkspaceReport(JSON.parse(reportScopeKey), controller.signal)/);
assert.match(surface, /}, [reportScopeKey, retryNonce]);/);
assert.doesNotMatch(surface, /setInterval|refetchOnWindowFocus|Date.now()/);
assert.match(surface, /Apply range/);
assert.match(surface, /No activity has been recorded for this selection yet./);
assert.match(surface, /Try again/);
assert.match(client, /\/api\/workspace\/reports\?/);
assert.match(client, /\/api\/workspace\/reports\/export\?/);
assert.match(styles, /@media \(max-width: 640px\)/);
console.log("Workspace reports contract: PASS");
