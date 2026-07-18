import { ArrowLeft, ArrowRight, Building2, Flag, Landmark, Map, Megaphone, Route, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { mapCollections } from "@/data/mapCollections";
import { mapNativeCampaigns } from "@/data/mapNativeCampaigns";

type GatewayItem = {
  title: string;
  detail: string;
  href: string;
  meta?: string;
};

const partnerTypes: GatewayItem[] = [
  { title: "Properties", detail: "Residential buildings, condominium communities and property teams.", href: "/partners/sign-up?type=property", meta: "Partner type" },
  { title: "Hotels", detail: "Guest discovery, dining, local events and stay experiences.", href: "/partners/sign-up?type=hotel", meta: "Partner type" },
  { title: "Venues", detail: "Restaurants, bars, cafes, retail, wellness and local experiences.", href: "/partners/sign-up?type=venue", meta: "Partner type" },
  { title: "Brands", detail: "Campaigns, placements and activations tied to downtown intent.", href: "/partners/sign-up?type=brand", meta: "Partner type" },
  { title: "Civic", detail: "Districts, public spaces, community programs and surveys.", href: "/partners/sign-up?type=civic", meta: "Partner type" },
  { title: "Real estate", detail: "Listings, neighborhood context and property discovery.", href: "/partners/sign-up?type=real-estate", meta: "Partner type" },
];

const featuredPartners: GatewayItem[] = [
  { title: "Hotel Van Zandt", detail: "Hotel, dining, rooftop and live-music discovery.", href: "/map?mode=partner&tab=map&filter=Hotels&entityId=partner-hotel-van-zandt", meta: "Hotel" },
  { title: "Four Seasons Austin", detail: "Resident, dining, spa and waterfront experiences.", href: "/map?mode=partner&tab=map&filter=Hotels&entityId=partner-four-seasons", meta: "Hotel" },
  { title: "inKind", detail: "Dining value across participating downtown restaurants.", href: "/map?mode=partner&tab=map&filter=Perks&query=inKind", meta: "Dining network" },
  { title: "Downtown Austin Alliance", detail: "Public realm, art walks and downtown programs.", href: "/map?mode=partner&tab=map&filter=Civic&query=Downtown%20Austin%20Alliance", meta: "Civic" },
  { title: "DANA", detail: "Resident feedback and neighborhood participation.", href: "/map?mode=partner&tab=map&filter=Surveys&query=DANA", meta: "Civic" },
  { title: "Legends", detail: "Downtown real-estate listings and neighborhood context.", href: "/map?mode=partner&tab=map&filter=Real%20Estate&query=Legends", meta: "Real estate" },
];

const buildings: GatewayItem[] = [
  { title: "The Independent", detail: "Resident access, nearby perks and shared amenities.", href: "/map?mode=partner&tab=map&filter=Properties&query=The%20Independent", meta: "Residential" },
  { title: "Waterline", detail: "Mixed-use property, hospitality and resident experiences.", href: "/map?mode=partner&tab=map&filter=Properties&query=Waterline", meta: "Mixed use" },
  { title: "70 Rainey", detail: "Building-linked resident perks and neighborhood discovery.", href: "/map?mode=partner&tab=map&filter=Properties&query=70%20Rainey", meta: "Residential" },
  { title: "Four Seasons Residences", detail: "Residential hospitality and shared amenity access.", href: "/map?mode=partner&tab=map&filter=Properties&query=Four%20Seasons%20Residences", meta: "Residential" },
];

const features: GatewayItem[] = [
  { title: "Shared amenities", detail: "Building-to-building access and participating resident benefits.", href: "/map?mode=partner&tab=map&filter=Properties&query=shared%20amenities", meta: "Map feature" },
  { title: "Resident perks", detail: "Current offers, eligibility and redemption paths.", href: "/map?mode=partner&tab=perks&filter=Perks", meta: "Map feature" },
  { title: "Events", detail: "Upcoming programs, RSVPs and nearby event discovery.", href: "/map?mode=partner&tab=events&filter=Events", meta: "Map feature" },
  { title: "Surveys", detail: "Public feedback actions and resident participation.", href: "/map?mode=partner&tab=map&filter=Surveys", meta: "Map feature" },
];

const sections: Array<{ id: string; title: string; copy: string; icon: typeof Store; items: GatewayItem[] }> = [
  { id: "types", title: "Partner types", copy: "Start from the operating model that matches the organization.", icon: Store, items: partnerTypes },
  { id: "partners", title: "Featured partners and brands", copy: "Open a specific partner context on the existing map.", icon: Flag, items: featuredPartners },
  { id: "buildings", title: "Buildings and properties", copy: "Review residential and mixed-use map surfaces.", icon: Building2, items: buildings },
  { id: "campaigns", title: "Campaigns", copy: "Open active campaign records without changing campaign routing.", icon: Megaphone, items: mapNativeCampaigns.slice(0, 8).map((campaign) => ({ title: campaign.title, detail: campaign.summary || campaign.description, meta: campaign.sponsorName || "Campaign", href: `/map?mode=partner&tab=map&filter=Campaigns&entityId=${encodeURIComponent(campaign.id)}` })) },
  { id: "routes", title: "Routes and collections", copy: "Launch ordered walks and curated downtown experiences.", icon: Route, items: mapCollections.map((route) => ({ title: route.title, detail: route.summary, meta: [route.estimatedTime, route.distanceLabel].filter(Boolean).join(" · ") || `${route.stopIds.length} stops`, href: `/map?mode=partner&tab=map&routeId=${encodeURIComponent(route.id)}` })) },
  { id: "features", title: "Map features", copy: "Open a controlled functional layer for later gateway configuration.", icon: Map, items: features },
];

export default function PartnerGateway() {
  return (
    <main className="dp-partner-gateway">
      <header className="dp-partner-gateway__header">
        <Link to="/partners" aria-label="Back to partners"><ArrowLeft aria-hidden="true" />Back</Link>
        <div><span>Downtown Perks</span><strong>Partner gateway</strong></div>
        <Link to="/partner-workspace/overview">Workspace <ArrowRight aria-hidden="true" /></Link>
      </header>

      <section className="dp-partner-gateway__intro" aria-labelledby="partner-gateway-title">
        <p>Standalone routing index</p>
        <h1 id="partner-gateway-title">Choose what you want to open.</h1>
        <span>This separate gateway collects partner types, brands, buildings, campaigns, routes and map features without replacing current entry points.</span>
      </section>

      <nav className="dp-partner-gateway__index" aria-label="Gateway sections">
        {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
      </nav>

      <div className="dp-partner-gateway__sections">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.id} id={section.id} className="dp-partner-gateway__section" aria-labelledby={`${section.id}-title`}>
              <header><Icon aria-hidden="true" /><div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.copy}</p></div></header>
              <div className="dp-partner-gateway__grid">
                {section.items.map((item) => (
                  <Link key={`${section.id}-${item.title}`} to={item.href}>
                    <span>{item.meta}</span><strong>{item.title}</strong><p>{item.detail}</p><ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer><Landmark aria-hidden="true" /><span>This route is intentionally separate from the live partner entry and may be revised or removed later.</span></footer>
    </main>
  );
}
