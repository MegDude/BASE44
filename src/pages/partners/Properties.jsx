import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import PartnerTypeTemplate from "@/components/partner/PartnerTypeTemplate";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";
import { LEGENDS_IMPORT_SUMMARY } from "@/data/legendsImportData";
import { FEATURED_BRANDS } from "@/data/featuredBrands";
import { agents } from "@/data/replitApiStore";

const content = PARTNER_TYPE_CONTENT.properties;
const legendsAdvisor =
  agents.find((agent) => agent.team === "Legends Real Estate") ?? null;

const FEATURED_BRAND_NETWORK = FEATURED_BRANDS.filter((brand) =>
  [
    "the-paseo",
    "the-waterline",
    "bangers",
    "the-stay-put",
    "hotel-van-zandt",
    "four-seasons",
    "four-seasons-residences",
    "the-shore",
    "inspired-closets-austin",
    "yeti",
    "rivian",
    "lululemon",
    "equinox",
    "austin-fc",
    "fabi-and-rosi",
  ].includes(brand.slug)
);

function SectionLabel({ children }) {
  return <p className="dp-micro-label">{children}</p>;
}

function PropertiesSupplement() {
  return (
    <>
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="overflow-hidden rounded-[32px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(11,31,51,0.98),rgba(15,40,64,0.96))] text-white">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-white/10 px-6 py-7 md:px-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-10 lg:py-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                  Foundational partner
                </div>
                <h2 className="dp-heading-modern-light mt-5 text-[1.9rem] md:text-[2.5rem]">
                  Legends Real Estate is the real-estate deployment model, not just another listing.
                </h2>
                <div className="mt-4 space-y-4 text-[14px] leading-7 text-white/74">
                  <p>
                    Verified buildings, active inventory, neighborhood context, and the live downtown map now work as one operating layer. A resident, prospect, or broker can understand an address in context instead of piecing the story together across separate tools.
                  </p>
                  <p>
                    For real estate, the pilot is straightforward: connect the building, connect the live inventory, connect the local layer, then measure what people actually open, save, and ask about. For brokers, each listing can carry its walkable value, nearby routine, and direct lead path instead of relying on a cold listing page alone.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/86">
                    {LEGENDS_IMPORT_SUMMARY.importedInBounds} in-bounds imported listings
                  </div>
                  <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/86">
                    {LEGENDS_IMPORT_SUMMARY.groupedBuildings} grouped property markers
                  </div>
                  {legendsAdvisor ? (
                    <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/86">
                      {legendsAdvisor.activeListingCount} active advisor listings
                    </div>
                  ) : null}
                </div>
                <Link to="/partners/dashboard/about" className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-white">
                  View founding partner detail
                  <ArrowRight className="h-4 w-4 text-[var(--dp-gold)]" />
                </Link>
              </div>

              <div className="px-6 py-7 md:px-8 lg:px-10 lg:py-10">
                <div className="grid gap-0 overflow-hidden rounded-[24px] border border-white/10">
                  {[
                    {
                      label: "Pilot path",
                      body: "Start with one building, one QR entry path, one live listing feed, and one broker follow-up loop. That is enough to prove resident utility and listing interest without a heavy rollout.",
                    },
                    {
                      label: "Broker application",
                      body: "A broker can send one link or QR and let the prospect see the unit, the building, and the nearby life around it, then convert that curiosity into a warmer contact moment.",
                    },
                    {
                      label: "Lead generation logic",
                      body: "The conversation starts when someone explores a real address in context. The lead is stronger because the system already knows the building, the corridor, the nearby routine, and the source of interest.",
                    },
                    {
                      label: "Why it is a no-brainer",
                      body: "Legends already owns the inventory and the local expertise. Downtown Perks adds the usable map layer, resident attention, and measurable action that static listing systems do not carry.",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={`grid gap-3 px-0 py-5 md:grid-cols-[150px_minmax(0,1fr)] ${index < 3 ? "border-b border-white/10" : ""}`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold)]">
                        {item.label}
                      </div>
                      <div className="text-[14px] leading-7 text-white/74">{item.body}</div>
                    </div>
                  ))}
                </div>

                {legendsAdvisor ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="border-b border-white/10 pb-3">
                      <div className="font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
                        {legendsAdvisor.leadsThisYear}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">Leads this year</div>
                    </div>
                    <div className="border-b border-white/10 pb-3">
                      <div className="font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
                        {legendsAdvisor.websiteVisitors}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">Website visitors</div>
                    </div>
                    <div className="pb-3">
                      <div className="font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
                        {legendsAdvisor.localSearchDirections}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">Local directions</div>
                    </div>
                    <div className="pb-3">
                      <div className="font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
                        {legendsAdvisor.propertiesSold}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">Properties sold</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="dp-band dp-band-muted p-6 md:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <SectionLabel>Neighborhood network</SectionLabel>
                <motion.h2
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="dp-heading-modern mt-4 max-w-3xl text-[2rem] md:text-[2.8rem]"
                >
                  The buildings and brands need to read as one downtown layer.
                </motion.h2>
              </div>
              <p className="text-[14px] leading-7 text-muted-foreground">
                Residents do not separate the building from the places around it. The property page, the shared map, and the featured directory now point to the same network: buildings, hospitality, venues, wellness, retail, and local anchors that shape daily use.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white">
              {FEATURED_BRAND_NETWORK.map((brand, index) => (
                <Link
                  key={brand.slug}
                  to={brand.route}
                  className={`grid gap-4 px-5 py-5 transition hover:bg-[rgba(248,250,252,0.9)] md:grid-cols-[120px_220px_minmax(0,1fr)_auto] md:px-8 ${
                    index < FEATURED_BRAND_NETWORK.length - 1 ? "border-b border-[rgba(11,31,51,0.08)]" : ""
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                      {brand.tag}
                    </div>
                    <div className="mt-2 text-[1.15rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy)]">
                      {brand.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                      {brand.category}
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                      {brand.description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PropertiesPartner() {
  return (
    <PartnerTypeTemplate
      content={content}
      extraSection={<PropertiesSupplement />}
    />
  );
}
