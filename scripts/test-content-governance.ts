import assert from "node:assert/strict";
import { reviewGovernedContent } from "../src/content/contentGovernance";

const valid = reviewGovernedContent([
  { id: "headline", viewId: "offers", sectionId: "hero", role: "headline", text: "Offers" },
  { id: "support", viewId: "offers", sectionId: "hero", role: "support", text: "Create an offer residents can use." },
  { id: "action", viewId: "offers", sectionId: "hero", role: "button", text: "Create offer", primary: true },
]);
assert.deepEqual(valid, []);

const invalid = reviewGovernedContent([
  { id: "heading-a", viewId: "workspace", sectionId: "hero", role: "headline", text: "Performance Snapshot" },
  { id: "heading-b", viewId: "workspace", sectionId: "hero", role: "section", text: "Performance Snapshot" },
  { id: "support-a", viewId: "workspace", sectionId: "hero", role: "support", text: "First explanation." },
  { id: "support-b", viewId: "workspace", sectionId: "hero", role: "support", text: "Second explanation." },
  { id: "cta-a", viewId: "workspace", sectionId: "hero", role: "button", text: "Learn more", primary: true },
  { id: "cta-b", viewId: "workspace", sectionId: "hero", role: "button", text: "Continue", primary: true },
  { id: "resident", viewId: "resident", sectionId: "hero", role: "card", text: "Review the activation workflow.", audience: "resident" },
]);

for (const rule of ["voice", "duplicate-heading", "support-count", "action", "primary-action-count", "audience"]) {
  assert.ok(invalid.some((issue) => issue.rule === rule), `${rule} is enforced`);
}

console.log("Content governance rule checks passed.");
