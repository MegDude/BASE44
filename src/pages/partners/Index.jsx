import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerTypeCard from "@/components/partner/PartnerTypeCard";
import PartnerBrandShowcase from "@/components/partner/PartnerBrandShowcase";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import {
  BRAND_SHOWCASE_GROUPS,
  PARTNER_DASHBOARD_LINK,
  PARTNER_LANDING_SECTIONS,
  PARTNER_PLATFORM_MODULES,
  PARTNER_TYPE_CONTENT,
  PARTNER_TYPE_ORDER,
} from "@/lib/partnerContent";

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
      {children}
    </p>
  );
}

export default function PartnersIndex() {
  const partnerCards = PARTNER_TYPE_ORDER.map((id) => PARTNER_TYPE_CONTENT[id]);

  return (
    <div className="min-h-screen bg-[#f6f2ea] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <SectionLabel>Partners</SectionLabel>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] md:text-7xl">
              One partner landing page. Five partner types. One downtown operating system.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[rgba(11,31,51,0.66)]">
              The partner section should explain the system cleanly before it sells any one example. Properties, hospitality, venues, brands, and civic partners all plug into the same live map, progressive-access resident flow, and intelligence hub.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#partner-types"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Explore partner types
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to={PARTNER_DASHBOARD_LINK}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/42 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/68"
              >
                Open intelligence hub
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
            <ResponsiveScrollSection
              items={PARTNER_LANDING_SECTIONS}
              desktopClassName="sm:grid-cols-3"
              mobileCardClassName="w-[82%]"
              getKey={(section) => section.title}
              renderItem={(section) => {
              const Icon = section.icon;
              return (
                <div className="h-full rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
                  <Icon className="h-5 w-5 text-[hsl(40,62%,42%)]" strokeWidth={1.75} />
                  <div className="mt-4 text-lg font-semibold tracking-[-0.03em]">{section.title}</div>
                  <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{section.body}</div>
                </div>
              );
            }}
            />
          </motion.div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType="dashboard"
        title="The partner map is business intelligence."
        description="Partner mode should show visibility, campaign, coverage, source, and conversion signals. It should not reuse the resident discovery map as a fake dashboard."
      />

      <section id="partner-types" className="border-y border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>Partner Types</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              Choose the layer that matches the business problem.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
              Each page should stay general, operational, and useful. Brand examples live separately so the main partner narrative stays clean.
            </p>
          </div>

          <ResponsiveScrollSection
            items={partnerCards}
            desktopClassName="md:grid-cols-2 xl:grid-cols-5"
            mobileCardClassName="w-[84%]"
            getKey={(card) => card.id}
            renderItem={(card, index) => (
              <PartnerTypeCard
                type={card.shortLabel}
                label={card.label}
                description={card.description}
                headline={card.outcomes[0]}
                proofLine="View partner details"
                icon={card.icon}
                href={card.route}
                delay={index * 0.05}
              />
            )}
          />
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <SectionLabel>Platform Logic</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              How the partner system should flow.
            </h2>
            <p className="mt-5 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
              Residents and guests browse first. The value layer unlocks later. Partner success comes from measured visibility, not early friction.
            </p>
          </div>

          <ResponsiveScrollSection
            items={PARTNER_PLATFORM_MODULES}
            desktopClassName="sm:grid-cols-2"
            mobileCardClassName="w-[84%]"
            getKey={(module) => module.title}
            renderItem={(module) => (
              <div className="h-full rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
                <div className="text-lg font-semibold tracking-[-0.03em]">{module.title}</div>
                <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{module.body}</div>
              </div>
            )}
          />
        </div>
      </section>

      <PartnerBrandShowcase groups={BRAND_SHOWCASE_GROUPS} />
    </div>
  );
}
