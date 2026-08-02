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
    id: "backendMasterControlPlane",
    label: "Backend Master Control Plane",
    shortLabel: "Control Plane",
    description: "Review the server-authorized Admin Studio, identity, entitlement, QR, payment, audit, and workspace contract.",
    href: "/admin/resources/backend-master-control-plane",
    section: "resources",
    adminOnly: true,
    priority: 0,
    searchTerms: ["backend master", "control plane", "admin studio", "entitlements", "audit log", "payments", "qr", "super admin"],
  },
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
