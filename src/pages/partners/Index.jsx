import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [activePrinciple, setActivePrinciple] = useState(0);

  const operatingPrinciples = [
    {
      id: "discovery",
      eyebrow: "Access model",
      title: "Discovery stays open",
      body: "Residents and guests should be able to browse immediately. Access layers, card issuance, and redemption unlock when the intent is real.",
    },
    {
      id: "map",
      eyebrow: "Map logic",
      title: "The map is the operating surface",
      body: "Partner value comes from visibility in context: time, distance, neighborhood, building source, and current demand.",
    },
    {
      id: "dashboard",
      eyebrow: "Intelligence layer",
      title: "The dashboard is the intelligence hub",
      body: "Scans, saves, RSVPs, redemptions, repeat behavior, and source attribution should turn into clear next actions.",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePrinciple((current) => (current + 1) % operatingPrinciples.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [operatingPrinciples.length]);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell dp-band grid gap-12 p-6 lg:grid-cols-[1fr_0.92fr] lg:items-end lg:p-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <SectionLabel>Partners</SectionLabel>
            <h1 className="dp-display-hero mt-5 max-w-5xl text-5xl md:text-7xl">
              One partner landing page. Five partner types. One downtown operating system.
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Buildings, hotels, venues, brands, and civic partners use the same downtown map, the same measurement layer, and the same operating rules.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#partner-types"
                className="dp-cta-primary"
              >
                Explore partner types
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to={PARTNER_DASHBOARD_LINK}
                className="dp-cta-secondary"
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
                <div className="h-full rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,238,0.9))] p-5 shadow-[0_14px_28px_rgba(11,31,51,0.05)]">
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

      <section id="partner-types" className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band dp-band-muted p-6 md:p-8 lg:p-10">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>Partner Types</SectionLabel>
            <h2 className="dp-display-section mt-4 text-4xl md:text-5xl">
              All partner types live in one platform.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Start with the overview, then move into the role-specific mode that matches the problem.
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

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band space-y-8 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel>Operating model</SectionLabel>
              <h2 className="dp-display-section mt-4 text-4xl md:text-5xl">
                One partner platform. Three rules.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Open discovery, a live downtown map, and an intelligence layer that turns movement into action.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {operatingPrinciples.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePrinciple(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activePrinciple === index ? "w-8 bg-[hsl(40,62%,42%)]" : "w-2.5 bg-[rgba(11,31,51,0.16)]"
                  }`}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,238,0.94))] shadow-[0_18px_44px_rgba(11,31,51,0.06)]">
            <motion.div
              animate={{ x: `-${activePrinciple * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex"
            >
              {operatingPrinciples.map((item) => (
                <div key={item.id} className="min-w-full p-6 md:p-8">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,42%)]">
                    {item.eyebrow}
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em] md:text-4xl">
                    {item.title}
                  </div>
                  <div className="mt-4 max-w-3xl text-[15px] leading-8 text-[rgba(11,31,51,0.66)]">
                    {item.body}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <ResponsiveScrollSection
            items={PARTNER_PLATFORM_MODULES}
            desktopClassName="sm:grid-cols-2"
            mobileCardClassName="w-[84%]"
            getKey={(module) => module.title}
            renderItem={(module) => (
              <div className="h-full rounded-[22px] bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_12px_26px_rgba(11,31,51,0.04)]">
                <div className="text-lg font-semibold tracking-[-0.03em]">{module.title}</div>
                <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{module.body}</div>
              </div>
            )}
          />
        </div>
      </section>

      <PartnerInsightMap
        partnerType="dashboard"
        title="The partner map is business intelligence."
        description="Partner mode should show visibility, campaign, coverage, source, and conversion signals. It should not reuse the resident discovery map as a fake dashboard."
      />

      <PartnerBrandShowcase groups={BRAND_SHOWCASE_GROUPS} />
    </div>
  );
}
