import { Link, useLocation } from "react-router-dom";
import PearlPartnerInsightMap from "@/components/partner/PearlPartnerInsightMap";
import PartnerStoryCarousel from "@/components/partner/PartnerStoryCarousel";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";
import { ROUTES } from "@/lib/routes";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const DASHBOARD_TABS = [
  { label: "Overview", href: ROUTES.partnerDashboard },
  { label: "Map", href: "/partners/dashboard/map" },
  { label: "Properties", href: ROUTES.partnerDashboardResidential },
  { label: "Hospitality", href: ROUTES.partnerDashboardHospitality },
  { label: "Venues", href: ROUTES.partnerDashboardVenues },
  { label: "Brands", href: ROUTES.partnerDashboardBrands },
  { label: "Civic", href: ROUTES.partnerDashboardCivic },
  { label: "Redemptions", href: "/partners/dashboard/redemptions" },
  { label: "Integrations", href: "/partners/dashboard/integrations" },
  { label: "About", href: "/partners/dashboard/about" },
];

const DASHBOARD_VARIANTS = {
  dashboard: {
    title: "Downtown activity, shown clearly.",
    description: "Ask a question or use filters to see where people are going, what they are saving, and which offers are being used.",
    partnerType: "dashboard",
  },
  residential: { title: "Resident activity around the building.", description: "See what residents are doing nearby.", partnerType: "property" },
  hospitality: { title: "Guest activity, shown clearly.", description: "See where guests go after they arrive.", partnerType: "hospitality" },
  venues: { title: "Venue performance, shown clearly.", description: "See what is bringing people in.", partnerType: "venue" },
  brands: { title: "Brand activity, shown clearly.", description: "See where campaigns are working.", partnerType: "brand" },
  civic: { title: "District activity, shown clearly.", description: "See where downtown is active.", partnerType: "civic" },
};

function getVariant(path) {
  if (path.includes("residential")) return "residential";
  if (path.includes("hospitality")) return "hospitality";
  if (path.includes("venues")) return "venues";
  if (path.includes("brands")) return "brands";
  if (path.includes("civic")) return "civic";
  return "dashboard";
}

export default function Dashboard() {
  const location = useLocation();
  const variantKey = getVariant(location.pathname);
  const variant = DASHBOARD_VARIANTS[variantKey];
  const content = PARTNER_TYPE_CONTENT[variantKey === "residential" ? "properties" : variantKey] || null;

  return (
    <div className="pearl-page pt-[68px]">
      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="pearl-navy-block rounded-[28px] p-6">
            <h1 className="dp-display-hero">See what’s working downtown right now.</h1>
            <p className="dp-page-intro mt-3 text-white/80">Track activity, see what converts, and decide what to change next.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/partner-workspace" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                Manage offers <Arrow />
              </Link>
              <Link to="/partners" className="text-white/70 text-sm">Partner overview</Link>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto">
            {DASHBOARD_TABS.map((item) => (
              <Link key={item.href} to={item.href} className="dp-chip text-xs">{item.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {content ? <PartnerStoryCarousel items={content.storySlides || []} /> : null}

      <PearlPartnerInsightMap
        partnerType={variant.partnerType}
        title={variant.title}
        description={variant.description}
      />
    </div>
  );
}
