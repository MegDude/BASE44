import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/App.jsx"), "utf8");
const layoutSource = readFileSync(join(root, "src/components/Layout.jsx"), "utf8");
const workspaceSource = readFileSync(join(root, "src/pages/PartnerWorkspace.jsx"), "utf8");
const workspaceStyles = readFileSync(join(root, "src/styles/workspace-polish-sweep-final.css"), "utf8");
const workspaceNavigationStyles = readFileSync(join(root, "src/styles/workspace-navigation-analytics-final.css"), "utf8");
const compactMediaStyles = readFileSync(join(root, "src/styles/workspace-compact-media-final.css"), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(jsx?|tsx?)$/.test(name) ? [path] : [];
  });
}

const legacyWorkspaceRoutes = [
  ["/app/workspace", "/partner-workspace/overview"],
  ["/app/workspace/reports", "/partner-workspace/reports"],
  ["/app/workspace/analytics", "/partner-workspace/analytics"],
  ["/app/workspace/assistant", "/partner-workspace/assistant"],
  ["/app/workspace/profile", "/partner-workspace/profile"],
  ["/workspace/assistant", "/partner-workspace/assistant"],
  ["/partners/dashboard", "/partner-workspace/overview"],
];

for (const [legacy, canonical] of legacyWorkspaceRoutes) {
  assert.ok(
    appSource.includes(`path="${legacy}" element={<RedirectWithSearch to="${canonical}" />}`),
    `${legacy} must preserve its query string and enter ${canonical}`,
  );
}

assert.match(
  appSource,
  /path="\/partner-workspace\/assistant" element=\{<ProtectedRoute><PartnerWorkspace \/><\/ProtectedRoute>\}/,
  "Ask the Map must have a canonical protected workspace route",
);

const canonicalRouteMatches = [...appSource.matchAll(/<Route path="(\/partner-workspace\/[^"]+)"/g)].map((match) => match[1]);
const duplicateCanonicalRoutes = canonicalRouteMatches.filter((route, index) => canonicalRouteMatches.indexOf(route) !== index);
assert.deepEqual(duplicateCanonicalRoutes, [], `duplicate canonical workspace routes: ${duplicateCanonicalRoutes.join(", ")}`);

for (const file of sourceFiles(join(root, "src"))) {
  const source = readFileSync(file, "utf8");
  assert.doesNotMatch(source, /dp-layout-back(?:-row)?|dp-partner-workspace-back/, `obsolete page-level back control remains in ${file}`);
}

assert.doesNotMatch(workspaceNavigationStyles, /dp-partner-workspace-back/);
assert.match(layoutSource, /!pathname\.startsWith\("\/partner-workspace"\)/);
assert.match(workspaceStyles, /--dp-workspace-bg:\s*#ffffff/);
assert.match(workspaceStyles, /--dp-workspace-surface:\s*#ffffff/);
assert.match(workspaceStyles, /--dp-workspace-soft:\s*#ffffff/);
assert.match(workspaceStyles, /background-color:\s*#ffffff !important;[\s\S]*?text-align:\s*left !important/);
assert.match(workspaceStyles, /\[class\*="drawer"\][\s\S]*?border-radius:\s*0 !important/);
assert.match(workspaceStyles, /max-height:\s*calc\([\s\S]*?100dvh/);
assert.match(workspaceStyles, /\.dp-report-system/);
assert.match(workspaceStyles, /\.dp-report-hero/);
assert.match(workspaceStyles, /\.dp-report-chart/);
assert.match(workspaceStyles, /\.dp-report-actions/);
assert.match(workspaceSource, /className="dp-workspace-reports dp-report-system"/);
assert.match(workspaceSource, /See what is working and what to do next\./);
assert.match(workspaceSource, /function WorkspaceMediaRail/);
assert.match(workspaceSource, /Approved media/);
assert.match(workspaceSource, /See what needs attention and what is working\./);
assert.match(workspaceSource, /Publish the dining passport offer\./);
assert.match(workspaceSource, /className="dp-os-summary-strip"/);
assert.match(workspaceSource, /WORKSPACE_MEDIA_TABS\.includes\(tab\)/);
assert.doesNotMatch(
  workspaceSource.match(/const WORKSPACE_MEDIA_TABS = \[[\s\S]*?\];/)?.[0] || "",
  /"reports"|"analytics"|"assistant"/,
  "evidence-first report, analytics, and assistant screens must not be displaced by a media rail",
);
assert.doesNotMatch(
  workspaceStyles,
  /\.dp-partner-workspace-page :is\(section, article, aside, header, footer, div, nav, form\)\s*\{\s*background-image:\s*none !important;/,
  "the workspace must not globally suppress valid panel media",
);
assert.match(compactMediaStyles, /\.dp-workspace-media-rail/);
assert.match(compactMediaStyles, /max-width:\s*1120px !important/);
assert.match(compactMediaStyles, /\.dp-os-next-action/);
assert.match(compactMediaStyles, /\.dp-os-summary-strip/);
assert.match(compactMediaStyles, /\.dp-os-entity-rail/);

for (const asset of [
  "atx-cocina-interior.webp",
  "red-ash.jpg",
  "restaurant-francois.webp",
  "dining-passport.avif",
  "listing-preview.avif",
]) {
  assert.ok(existsSync(join(root, "public/images/workspace-media", asset)), `workspace media is missing: ${asset}`);
}

console.log("Canonical workspace routing and flat iOS surface contract: PASS");
