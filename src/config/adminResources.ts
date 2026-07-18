export type AdminResource = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  section: "resources";
  adminOnly: true;
  priority: number;
  searchTerms: string[];
};

export const ADMIN_RESOURCES: AdminResource[] = [
  {
    id: "partnerJourneyLinks",
    label: "Partner Journey Links",
    shortLabel: "Journey Links",
    description: "Open the canonical partner, resident, admin, public, and review routes.",
    href: "/admin/resources/partner-journey",
    section: "resources",
    adminOnly: true,
    priority: 1,
    searchTerms: ["partner links", "journey links", "resident links", "registration links", "admin resources", "review links"],
  },
  {
    id: "partnerMicrosites",
    label: "Partner Pages",
    shortLabel: "Partner Pages",
    description: "Review source coverage, conflicts, media, and public approval before partner pages publish.",
    href: "/admin-studio/microsites",
    section: "resources",
    adminOnly: true,
    priority: 2,
    searchTerms: ["partner pages", "microsites", "notion sources", "content review", "missing media"],
  },
];
