import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA,
  PARTNER_WORKSPACE_HERO_MEDIA,
  getPartnerWorkspaceHeroMedia,
} from "../src/data/partnerWorkspaceHeroMedia.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredOrganizations = [
  "demo-org-waterloo-greenway",
  "demo-org-legends-real-estate",
  "demo-org-larry-and-guy",
  "demo-org-hotel-van-zandt",
  "demo-org-yeti",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const organizationId of requiredOrganizations) {
  const media = getPartnerWorkspaceHeroMedia(organizationId);
  assert(PARTNER_WORKSPACE_HERO_MEDIA[organizationId], `Missing hero media for ${organizationId}`);
  assert(media.src.startsWith("/images/"), `${organizationId} does not use a local production image`);
  assert(media.alt.trim().length >= 24, `${organizationId} needs descriptive alternative text`);
  assert(media.caption.trim().length >= 8, `${organizationId} needs a useful visible caption`);
  assert(media.width >= 1200, `${organizationId} hero width is below 1200px`);
  assert(media.height >= 675, `${organizationId} hero height is below 675px`);
  assert(fs.existsSync(path.join(projectRoot, "public", media.src)), `${organizationId} image is missing: ${media.src}`);
}

const uniqueSources = new Set(requiredOrganizations.map((organizationId) => getPartnerWorkspaceHeroMedia(organizationId).src));
assert(uniqueSources.size === requiredOrganizations.length, "Partner homes must not share generic hero media");
assert(getPartnerWorkspaceHeroMedia("future-partner") === DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA, "Unknown partners need a stable fallback hero");

console.log(`Partner workspace hero media verified for ${requiredOrganizations.length} configured organizations.`);
