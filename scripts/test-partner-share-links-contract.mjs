import { readFileSync } from "node:fs";

const app = readFileSync("src/App.jsx", "utf8");
const page = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const modules = readFileSync("src/config/workspaceModuleRegistry.ts", "utf8");
const registry = readFileSync("src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts", "utf8");
const panel = readFileSync("src/components/partner/workspace/PartnerShareLinksPanel.jsx", "utf8");
const client = readFileSync("src/lib/partner/partnerShareLinksClient.ts", "utf8");
const analytics = readFileSync("src/components/analytics/PartnerAnalyticsExperience.jsx", "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(app, 'path="/partner-workspace/share-links"', "Share links route is missing.");
requireText(page, "<PartnerShareLinksPanel", "Partner workspace does not render the share-links module.");
requireText(modules, 'id: "share_links"', "Share links are missing from the workspace module registry.");
requireText(modules, 'href: "/partner-workspace/share-links"', "Share links do not open their own workspace surface.");
requireText(panel, "Create and publish", "The immediate publish action is missing.");
requireText(panel, "Download QR", "The QR download action is missing.");
requireText(panel, "How reporting works", "Share-link attribution is not explained.");
requireText(client, "/api/partner/share-links", "The share-links publishing API is not connected.");
requireText(analytics, "Share-link opens", "Share-link opens are missing from partner analytics.");
requireText(analytics, "ShareLinkSources", "Share-link placement reporting is missing from partner analytics.");

for (const [name, source] of [["registry", registry], ["workspace", page], ["module registry", modules]]) {
  if (/\bentry links?\b/i.test(source)) throw new Error(`Legacy entry-link wording remains in the ${name}.`);
}

console.log("Partner share-links contract passed.");
