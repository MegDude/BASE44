export const PARTNER_WORKSPACE_MODULES = [
  {
    id: "overview",
    label: "Overview",
    description: "Operating snapshot across offers, events, sources, and recent movement.",
    owner: "analytics",
    roles: ["owner", "manager", "editor", "analyst", "viewer"],
    cta: "Review workspace health",
    responsibilities: [
      "Show active content counts and recent publishing state.",
      "Surface the modules that need action next.",
      "Keep partner operators inside one control surface.",
    ],
  },
  {
    id: "offers",
    label: "Offers",
    description: "Create, edit, pause, and review perk performance by source and timing.",
    owner: "offers",
    roles: ["owner", "manager", "editor"],
    cta: "Publish an offer",
    responsibilities: [
      "Manage live perk inventory and visibility windows.",
      "Track redemptions and view source contribution.",
      "Keep offer details aligned with map presentation.",
    ],
  },
  {
    id: "events",
    label: "Events",
    description: "Publish map-visible events with timing, RSVP, and district context.",
    owner: "events",
    roles: ["owner", "manager", "editor"],
    cta: "Create an event",
    responsibilities: [
      "Manage event dates, status, and RSVP settings.",
      "Tie event visibility to the shared map layer.",
      "Review upcoming versus live event performance.",
    ],
  },
  {
    id: "sources",
    label: "Sources",
    description: "Manage QR placements, building nodes, and attribution entry points.",
    owner: "sources",
    roles: ["owner", "manager", "editor", "analyst"],
    cta: "Add a source point",
    responsibilities: [
      "Track which QR or placement drives action.",
      "Keep source labels and placements normalized.",
      "Preserve attribution from entry through redemption.",
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Review partner performance, source breakdowns, and next-best actions.",
    owner: "analytics",
    roles: ["owner", "manager", "analyst", "viewer"],
    cta: "Open analytics",
    responsibilities: [
      "Show conversion, repeat, and source-level behavior.",
      "Surface recommendations from live or fallback rules.",
      "Keep dashboard and workspace grounded in one metric model.",
    ],
  },
  {
    id: "team",
    label: "Team",
    description: "Invite operators, assign roles, and control workspace access.",
    owner: "team_access",
    roles: ["owner", "manager"],
    cta: "Invite a teammate",
    responsibilities: [
      "Manage partner users and roles.",
      "Limit editing to authenticated operators.",
      "Keep audit ownership clear across modules.",
    ],
  },
  {
    id: "profile",
    label: "Profile",
    description: "Maintain organization details, defaults, and workspace preferences.",
    owner: "partner_profile",
    roles: ["owner", "manager", "editor"],
    cta: "Update profile",
    responsibilities: [
      "Keep partner identity and metadata current.",
      "Store publishing defaults and notification settings.",
      "Align visible profile copy with operational metadata.",
    ],
  },
];

export function getWorkspaceModule(moduleId) {
  return PARTNER_WORKSPACE_MODULES.find((module) => module.id === moduleId) || null;
}
