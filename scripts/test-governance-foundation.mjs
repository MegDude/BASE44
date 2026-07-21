import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const specificationPath = "docs/governance/resident-governance-platform-v2.md";
const gatePath = "docs/governance/foundation-gate-checklist.md";
const indexPath = "docs/governance/README.md";

for (const path of [specificationPath, gatePath, indexPath]) {
  assert.ok(existsSync(path), `Missing governance foundation document: ${path}`);
}

const specification = readFileSync(specificationPath, "utf8");
const gate = readFileSync(gatePath, "utf8");
const index = readFileSync(indexPath, "utf8");
const appRoutes = readFileSync("src/App.jsx", "utf8");
const residentHome = readFileSync("src/pages/ResidentHome.tsx", "utf8");

const requiredSections = [
  "Complete resident journeys",
  "Screen and UI state matrix",
  "Reusable component inventory",
  "Universal object relationship model",
  "AI interaction model and boundaries",
  "Civic map integration rules",
  "Notification and lifecycle event model",
];

for (const section of requiredSections) {
  assert.ok(specification.includes(section), `Governance foundation is missing: ${section}`);
}

assert.match(specification, /Home \| Map \| Perks \| Events \| Governance/, "Primary mobile Governance navigation is not resolved");
assert.match(specification, /One location-relevant object produces at most one active map representation/, "One-object/one-pin governance is missing");
assert.match(specification, /AI may summarize, classify, suggest, cluster, retrieve, and draft[\s\S]*may not publish/, "AI human-review boundary is incomplete");
assert.match(specification, /DANA does not endorse political candidates/, "Political-neutrality statement is missing");
assert.match(specification, /The LLM is stateless\. Downtown Perks owns memory/, "LLM system-of-record boundary is missing");
assert.match(specification, /Every drawer stays within the visible viewport/, "Governance panel containment is missing");
assert.match(gate, /Schema and API implementation begins only after/, "Foundation approval gate is not enforceable");
assert.match(index, /does not authorize:[\s\S]*creating production tables/, "Pre-implementation scope boundary is missing");
assert.match(appRoutes, /path="\/resident\/civic" element={<ResidentCivicHub \/>}/, "Canonical resident civic route is missing");
assert.match(appRoutes, /path="\/resident\/civic\/:actionId" element={<ResidentCivicHub \/>}/, "Resident civic action route is missing");
assert.match(appRoutes, /path="\/residents\/governance" element={<Navigate to="\/resident\/civic" replace \/>}/, "Legacy resident governance route must redirect to Civic Inbox");
assert.match(residentHome, /to="\/resident\/civic"/, "Resident home must link to Civic Inbox");
assert.doesNotMatch(residentHome, /Ask Downtown|Quick actions|Walking routes|Collections/, "Resident Home still contains duplicate map discovery");

console.log("Governance Volume 2 foundation covers all seven required implementation gates: PASS");
