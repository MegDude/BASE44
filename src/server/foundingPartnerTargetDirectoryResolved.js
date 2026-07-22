import {
  collectionBriefMeta,
  collectionBuildingDirectory,
  collectionTargetDirectory,
} from "./foundingPartnerTargetDirectory.js";

const targetOverrides = {
  "rainey-street-coalition": (target) => ({
    ...target,
    assets: Array.from(new Set([
      "Banger’s Sausage House & Beer Garden",
      "Coalition member route",
      ...target.assets,
    ])),
    contacts: [
      {
        name: "Ben Siegel",
        role: "President / public coalition lead — supplied in the confidential brief; current title, coalition scope, and approval authority to verify",
        status: "Supplied public route — verify",
        channel: "Use Nina’s relationship path or the coalition’s current public route. Do not describe Ben as founder unless independently confirmed.",
      },
      ...target.contacts,
    ],
    assetNote: "Banger’s and the wider coalition network are relationship routes, not automatic pilot participants. Verify current coalition leadership, membership, venue participation, and authority before outreach.",
    nextAction: "Confirm Ben Siegel’s current coalition role, identify the accountable district decision lead, and define the clean coalition-level ask without reopening active operator conversations.",
    ask: "Could Ben or the current coalition decision lead sponsor one district-level Founding Partner conversation and identify one or two operators ready for a focused pilot?",
  }),
  "mml-hospitality": (target) => ({
    ...target,
    assets: Array.from(new Set([...target.assets, "Pool Burger"])),
  }),
  do512: (target) => ({
    ...target,
    assets: Array.from(new Set([...target.assets, "Romantic Spots Austin content asset"])),
    preparedPages: Array.from(new Set([...target.preparedPages, "Romantic Spots Austin"])),
  }),
};

const pouringWithHeartTarget = {
  id: "pouring-with-heart",
  priority: "1",
  name: "Pouring With Heart",
  segment: "Hospitality portfolio / active relationship",
  relationshipStrength: "Active — do not reintroduce",
  pageStatus: "Active pilot route; current portfolio verification required",
  why: "This relationship is already in motion. The work should progress through the existing thread rather than return to the net-new introduction queue.",
  pilot: "Advance the active pilot through one accountable portfolio owner, the currently participating concepts, and one measurable 30-day proof path.",
  assets: [
    "Stay Put",
    "Half Step",
    "Current Pouring With Heart concepts — confirm before use",
    "Rainey hospitality operating network",
  ],
  assetNote: "Stay Put and Half Step are the supplied active relationship anchors. Confirm current ownership, operating status, portfolio affiliation, participating concepts, and location-level owners before outreach or publication.",
  contacts: [
    {
      name: "Current Pouring With Heart executive / portfolio lead",
      role: "Existing relationship and approval owner",
      status: "Active route — current name and title to confirm",
      channel: "Use the existing active relationship thread. Do not create a cold or duplicate introduction.",
    },
    {
      name: "Current portfolio operations / marketing owner",
      role: "Day-to-day pilot and reporting owner",
      status: "To identify in the active thread",
      channel: "Ask the existing relationship owner to appoint one accountable operator across the selected concepts.",
    },
    {
      name: "Stay Put and Half Step location leads",
      role: "Location execution",
      status: "Current managers to confirm",
      channel: "Confirm only after the portfolio owner names the participating venues.",
    },
  ],
  preparedPages: ["Stay Put", "Half Step", "Rainey corridor assets"],
  missingPages: ["Current Pouring With Heart portfolio owner", "Confirmed active-concept list", "Pilot operating brief"],
  nextAction: "Progress the existing pilot, confirm the current portfolio and location owners, and keep Pouring With Heart out of the net-new introduction list.",
  ask: "Can we confirm the active pilot owner, the participating concepts, and the one 30-day proof measure that determines the next step?",
  sources: [],
};

export const collectionResolvedBriefMeta = collectionBriefMeta;
export const collectionResolvedBuildingDirectory = collectionBuildingDirectory;
export const collectionResolvedTargetDirectory = [
  ...collectionTargetDirectory.map((target) => targetOverrides[target.id]?.(target) || target),
  pouringWithHeartTarget,
];
