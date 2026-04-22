import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PartnerTypeCard from "@/components/partner/PartnerTypeCard";
import PartnerPricingSection from "@/components/partner/PartnerPricingSection";
import PartnerBrandShowcase from "@/components/partner/PartnerBrandShowcase";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import {
  BRAND_SHOWCASE_GROUPS,
  PARTNER_PROGRAM_FAQS,
  PARTNER_ROLE_PROOF,
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
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <SectionLabel>Partner Program</SectionLabel>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] md:text-7xl">
              Build with Downtown Perks
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[rgba(11,31,51,0.66)]">
              Five ways to grow your business: residential buildings, hotels, venues, brands, and civic organizations. Each with a live map, proven metrics, and a direct path to implementation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#partner-types"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Explore your role
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/partners/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/42 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/68"
              >
                Open dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Partners active", value: "40+" },
                { label: "Monthly scans", value: "180k" },
                { label: "Avg repeat rate", value: "52%" },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
                  <div className="text-3xl font-semibold tracking-[-0.05em]">{item.value}</div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="partner-types" className="border-y border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>Your role</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              Choose how you want to participate in the Downtown Perks ecosystem.
            </h2>
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
                description={card.heroDescription}
                headline={card.heroStats?.[0] ? `${card.heroStats[0].value} ${card.heroStats[0].label.toLowerCase()}` : "Learn more"}
                proofLine="Learn more"
                icon={card.icon}
                href={card.route}
                delay={index * 0.05}
              />
            )}
          />
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>One system, five roles</SectionLabel>
          </div>
          <ResponsiveScrollSection
            items={PARTNER_LANDING_SECTIONS}
            desktopClassName="md:grid-cols-2 xl:grid-cols-4"
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

          <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {PARTNER_PLATFORM_MODULES.map((item) => (
              <div key={item.title} className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/60 p-5">
                <div className="text-3xl font-semibold tracking-[-0.05em]">{item.body}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>See it in action</SectionLabel>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {PARTNER_ROLE_PROOF.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-6 shadow-[0_10px_24px_rgba(11,31,51,0.04)] transition hover:-translate-y-[2px]"
              >
                <div className="text-[11px] uppercase tracking-[0.16em] text-[hsl(40,62%,42%)]">{item.type}</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{item.name}</h3>
                <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{item.summary}</p>
                <div className="mt-4 text-sm font-medium text-[var(--dp-navy,#0B1F33)]">{item.proof}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PartnerPricingSection
        title="Simple annual pricing. Start small. Prove value. Expand from there."
        intro="Annual access includes placement, communications, and simple proof. Custom activations and campaign design are priced separately."
      />

      <PartnerBrandShowcase groups={BRAND_SHOWCASE_GROUPS} />

      <FAQAccordionBlock
        sectionEyebrow="Partner FAQs"
        sectionTitle="How the partner system works"
        sectionIntro="Downtown Perks gives each partner type a different way into the same downtown product."
        items={PARTNER_PROGRAM_FAQS}
        styleVariant="split"
        pageType="partners"
      />

      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-[rgba(11,31,51,0.10)] bg-white p-8 text-center shadow-[0_20px_48px_rgba(11,31,51,0.06)]">
          <SectionLabel>Join 40+ partners</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
            Let&apos;s talk about how Downtown Perks can work for you.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/partner-workspace"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#partner-pricing"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#f5efe2] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-[#efe5d0]"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
