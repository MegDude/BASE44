import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MapShell from "@/components/map/MapShell";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";
import { PARTNER_LANDING_SECTIONS, PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";
import { ROUTES } from "@/lib/routes";
import {
  PartnerRoleGrid,
  SystemSteps,
  PartnerForm,
  PartnerDirectory,
} from "@/components/partners";

export default function PartnersIndex() {
  const [activePartner, setActivePartner] = useState("venues");
  const [directoryItems, setDirectoryItems] = useState([]);
  const [selectedPartnerItem, setSelectedPartnerItem] = useState(null);

  useEffect(() => {
    setDirectoryItems([]);
    setSelectedPartnerItem(null);
  }, [activePartner]);

  const activeItem = PARTNER_TYPE_CONTENT[activePartner] || PARTNER_TYPE_CONTENT.venues;
  const storyItems = useMemo(
    () => [
      {
        title: "Properties turn downtown into an amenity.",
        body: "Connected buildings give residents one live neighborhood layer instead of a scattered mix of welcome packets, static links, and forgotten apps. The building becomes a practical way into downtown life.",
      },
      {
        title: "Venues and local businesses become easier to choose.",
        body: "Restaurants, bars, coffee, wellness, and everyday places show up in the moment someone nearby is ready to decide. That makes the map more useful for residents and more measurable for operators.",
      },
      {
        title: "Brands sponsor useful moments.",
        body: "Brand presence works better when it is tied to a real place, a real district, and a real timing window. Useful access, offers, and event tie-ins land better than generic awareness.",
      },
      {
        title: "Civic partners make participation easier.",
        body: "District groups, chambers, and civic organizations can make local activity easier to find, easier to join, and easier to measure without pushing people through disconnected information channels.",
      },
    ],
    []
  );
  const formPartnerType =
    {
      properties: "property",
      hospitality: "hospitality",
      venues: "venue",
      brands: "brand",
      civic: "civic",
    }[activeItem.id] || "venue";

  return (
    <main>
      <section className="px-4 pb-8 pt-[104px] md:px-6 md:pb-10">
        <div className="dp-page-shell max-w-5xl">
          <div className="dp-micro-label">Partner ecosystem</div>
          <h1 className="dp-heading-modern mt-4 text-[2.7rem] md:text-[4.6rem]">
            Show up where decisions happen.
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-muted-foreground md:text-[17px]">
            Connect your place, offer, or activation to people already nearby, then see what actually works across the same map they use to decide where to go.
          </p>
        </div>
      </section>

      <section id="partner-map" className="relative">
        <MapShell
          key={activeItem.id}
          mode={activeItem.mapMode || "partners"}
          initialQuery={`${activeItem.label.toLowerCase()} downtown`}
          items={directoryItems}
          selected={selectedPartnerItem}
          onSelect={setSelectedPartnerItem}
        />
      </section>

      <PartnerDirectory
        activeRole={activePartner}
        onItemsChange={(items) => {
          setDirectoryItems(items);
          if (items.length > 0) {
            setSelectedPartnerItem(items[0]);
          }
        }}
        onSelect={setSelectedPartnerItem}
      />

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="mb-8">
            <div className="dp-micro-label">Partner routing</div>
            <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.8rem]">
              Pick the role. See the live downtown layer. Move into the right path.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              The map stays central. The role cards handle the routing. Each partner type gets one clear entry point, useful proof, and the right next click without stacked duplicate explainers.
            </p>
          </div>

          <PartnerRoleGrid className="md:grid-cols-3 xl:grid-cols-5" />

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.partnerDashboard} className="dp-cta-secondary">
              Open dashboard
            </Link>
            <Link to={ROUTES.partnerWorkspace} className="dp-cta-secondary">
              Open workspace
            </Link>
            <Link to={ROUTES.partnerApply} className="dp-cta-primary">
              Apply to be a partner
            </Link>
          </div>
        </div>
      </section>

      <SystemSteps
        steps={PARTNER_LANDING_SECTIONS.map((item) => ({
          title: item.title,
          body: item.body,
        }))}
      />

      <AudienceStoryPanel items={storyItems} />

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="max-w-[520px]">
              <div className="dp-micro-label">Real signals, not guesses</div>
              <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.7rem]">
                The partner layer works because the map keeps producing proof.
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
                Saves show intent. Visits show movement. Redemptions show value. The same system that helps people decide where to go gives partners a clearer read on what is working nearby.
              </p>
            </div>

            <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.48))] p-6 shadow-[0_18px_40px_rgba(11,31,51,0.05)]">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label: "Saves",
                    detail: "Signal intent before someone moves.",
                  },
                  {
                    label: "Visits",
                    detail: "Show where downtown movement actually goes.",
                  },
                  {
                    label: "Redemptions",
                    detail: "Prove which offers are worth keeping live.",
                  },
                  {
                    label: "Searches",
                    detail: "Reveal what people are actively asking the map for.",
                  },
                ].map((item) => (
                  <div key={item.label} className="border-t border-[rgba(11,31,51,0.08)] pt-4">
                    <div className="text-[0.98rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{item.label}</div>
                    <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="grid gap-8 border-t border-[rgba(11,31,51,0.08)] pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="max-w-[520px]">
              <div className="dp-micro-label">Connected platform</div>
              <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.7rem]">
                The landing page routes the story. The workspace runs the system. The dashboard shows what is working.
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
                Partners should be able to move from fit, to setup, to live proof without losing the thread. That is why the same map logic now connects the landing page, the workspace, and the dashboard.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  label: "Partner Workspace",
                  title: "Manage offers, events, source points, and team access.",
                  body: "Use one shared control surface instead of jumping across scattered tools and half-configured states.",
                  href: ROUTES.partnerWorkspace,
                },
                {
                  label: "Partner Dashboard",
                  title: "See what people are doing and what to do next.",
                  body: "Read visits, saves, check-ins, perks used, and nearby activity through the same downtown map partners are trying to influence.",
                  href: ROUTES.partnerDashboard,
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block border-t border-[rgba(11,31,51,0.08)] pt-4 transition-opacity hover:opacity-80"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-[1rem] font-semibold leading-6 text-[var(--dp-navy,#0B1F33)]">
                    {item.title}
                  </div>
                  <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                    {item.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PartnerForm defaultType={formPartnerType} />
    </main>
  );
}
