import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  analyticsCards,
  intakeFields,
  intakeGoals,
  intelligenceMetrics,
  operatingModelCards,
  organizationTypes,
  partnerFaqs,
  partnerNavLinks,
  partnerStates,
} from "@/data/partnerHomepage";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];
const partnerDecisionMoments = [
  ["Coffee before work", "A nearby offer residents can use on the way out."],
  ["Dinner after a show", "A simple path from event discovery to a table nearby."],
  ["Weekend guests", "Hotel recommendations tied to places people can reach easily."],
];

function SectionShell({ id, eyebrow, title, intro, children, className = "" }) {
  return (
    <section id={id} className={cn("bg-white px-5 py-14 text-[#0B1F33] md:px-8 md:py-20", className)}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || intro) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.5, ease }}
            className="mb-10 max-w-4xl"
          >
            {eyebrow && <p className="dp-partner-label">{eyebrow}</p>}
            {title && <h2 className="dp-partner-section-title">{title}</h2>}
            {intro && <p className="mt-4 max-w-3xl text-[15px] leading-[1.68] text-[#0B1F33]/66 md:text-[16px]">{intro}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

function TextLink({ to, children, variant = "primary", className = "" }) {
  const Component = to?.startsWith("/") ? Link : "a";
  const props = to?.startsWith("/") ? { to } : { href: to };

  return (
    <Component
      {...props}
      className={cn(
        "group inline-flex h-10 items-center justify-center gap-2 border-b border-transparent bg-transparent px-0 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]",
        variant === "primary" ? "text-[#0B1F33] hover:border-[#BFA46A]" : "text-[#0B1F33]/58 hover:text-[#0B1F33]",
        className
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 text-[#BFA46A] transition-transform group-hover:translate-x-0.5" />
    </Component>
  );
}

function PartnerPageNav() {
  return (
    <div className="dp-partner-page-nav bg-white px-5 pt-[82px] md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-start gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex min-w-max items-center gap-5" aria-label="Partner page navigation">
          {partnerNavLinks.map((link) => (
            <Link key={link.label} to={link.href} className="text-[12px] font-medium tracking-normal text-[#0B1F33]/58 transition-colors hover:text-[#0B1F33]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function PartnerHeroVisual() {
  return (
    <div id="moments-that-matter" className="dp-partner-hero-visual relative overflow-hidden bg-[#0B1F33] p-5 text-white md:p-6">
      <div className="relative z-10 grid min-h-[330px] content-between gap-8">
        <div>
          <p className="dp-partner-label text-[#BFA46A]">Partner map</p>
          <h2 className="mt-4 max-w-[13ch] text-[34px] font-semibold leading-[1.02] text-white md:text-[46px]">Local plans, made easier.</h2>
        </div>
        <div className="grid gap-4">
          {partnerDecisionMoments.map(([title, body]) => (
            <article key={title} className="border-t border-white/14 pt-4">
              <strong className="block text-[13px] font-semibold text-white">{title}</strong>
              <p className="mt-1 text-[12px] leading-5 text-white/70">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PartnerHero() {
  return (
    <>
      <PartnerPageNav />
      <section className="dp-partner-hero bg-white px-5 py-12 text-[#0B1F33] md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, ease }} className="max-w-3xl">
            <p className="dp-partner-label">Partners</p>
            <h1 className="mt-5 max-w-[14ch] font-body text-[38px] font-semibold leading-[1.04] tracking-normal text-[#0B1F33] md:text-[56px] lg:text-[64px]">
              Show up when downtown decisions happen.
            </h1>
            <div className="mt-7 max-w-2xl space-y-3 text-[15px] leading-[1.68] text-[#0B1F33]/68 md:text-[17px]">
              <p>Downtown Perks helps properties, hotels, venues, brands, and civic organizations become useful while people nearby are making plans.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <TextLink to="#shared-layer">See How It Works</TextLink>
              <TextLink to="#partner-system" variant="secondary">Explore Partner Types</TextLink>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, delay: 0.08, ease }}>
            <PartnerHeroVisual />
          </motion.div>
        </div>
      </section>
    </>
  );
}

export function SharedOperatingLayer() {
  return (
    <SectionShell
      id="shared-layer"
      eyebrow="THE SHARED DOWNTOWN LAYER"
      title="One map for the moments people already use."
      className="bg-white"
    >
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="max-w-3xl text-[15px] leading-[1.72] text-[#0B1F33]/66 md:text-[16px]">
          <p>People already use downtown in connected ways: coffee before work, dinner before a show, a hotel recommendation, a resident perk on the walk home. Downtown Perks brings those moments into one map so partners can be useful without making people search across five different places.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {operatingModelCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06, ease }}
              className="border border-[#0B1F33]/[0.06] bg-white p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A]">0{index + 1}</p>
              <h3 className="mt-4 text-[18px] font-semibold leading-tight text-[#0B1F33]">{card.title}</h3>
              <p className="mt-3 text-[13px] leading-[1.65] text-[#0B1F33]/62">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function RotatingPartnerSystem() {
  const [activeKey, setActiveKey] = useState("properties");
  const [paused, setPaused] = useState(false);
  const activeIndex = partnerStates.findIndex((state) => state.key === activeKey);
  const activePartner = partnerStates[activeIndex] || partnerStates[0];

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return undefined;
    const interval = window.setInterval(() => {
      setActiveKey((current) => {
        const currentIndex = partnerStates.findIndex((state) => state.key === current);
        return partnerStates[(currentIndex + 1) % partnerStates.length].key;
      });
    }, 6200);
    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <SectionShell id="partner-system" eyebrow="ROTATING PARTNER SYSTEM" title="One shared system. Different partner views.">
      <div
        className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:items-start"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
      >
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Partner type">
          {partnerStates.map((partner) => {
            const isActive = partner.key === activePartner.key;
            return (
              <button
                key={partner.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveKey(partner.key);
                  setPaused(true);
                }}
                className={cn(
                  "shrink-0 border border-[#0B1F33]/[0.06] px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] lg:w-full",
                  isActive ? "bg-[#0B1F33] text-white" : "bg-white text-[#0B1F33]/58 hover:text-[#0B1F33]"
                )}
              >
                {partner.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={activePartner.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="min-w-0"
        >
          <p className="dp-partner-label">{activePartner.eyebrow}</p>
          <h2 className="mt-4 max-w-4xl font-heading text-[42px] leading-[0.96] tracking-[-0.04em] text-[#0B1F33] md:text-[62px]">
            {activePartner.headline}
          </h2>
          <div className="mt-7 max-w-3xl space-y-4 text-[15px] leading-[1.76] text-[#0B1F33]/66 md:text-[17px]">
            {activePartner.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 grid gap-4 border-y border-[#0B1F33]/[0.06] py-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A]">Pilot and pricing</p>
              <div className="mt-2 space-y-1 text-[14px] leading-6 text-[#0B1F33]/70">
                {activePartner.pricing.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <TextLink to={activePartner.ctaHref}>{activePartner.cta}</TextLink>
          </div>
          <div className="mt-6 border-t border-[#0B1F33]/[0.06] pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]">What you can review</p>
            <p className="mt-2 max-w-3xl text-[13px] leading-[1.68] text-[#0B1F33]/64">{activePartner.analyticsFraming}</p>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function IntelligenceLayer() {
  return (
    <SectionShell
      id="intelligence"
      eyebrow="PARTNER REPORTING"
      title="See what people opened, saved, and used."
      intro="Reporting should help a partner decide what to do next. No jargon, no noisy dashboard language, and no fake complexity."
      className="bg-white"
    >
      <div className="grid gap-4 md:grid-cols-4">
        {intelligenceMetrics.map((metric) => (
          <article key={metric.label} className="border border-[#0B1F33]/[0.06] bg-[#F7F8FB] p-4">
            <p className="text-[25px] font-semibold leading-none text-[#0B1F33]">{metric.value}</p>
            <p className="mt-2 text-[11px] font-semibold text-[#0B1F33]">{metric.label}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">{metric.window}</p>
            <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/58">{metric.source}</p>
            <p className="mt-3 border-t border-[#0B1F33]/[0.06] pt-3 text-[12px] leading-5 text-[#0B1F33]/72">{metric.action}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {analyticsCards.map((card) => (
          <article key={card.title} className="border-t border-[#BFA46A]/50 pt-4">
            <h3 className="text-[16px] font-semibold text-[#0B1F33]">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/62">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function PartnerFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <SectionShell id="faq" title="Questions partners usually ask first.">
      <div className="mx-auto max-w-4xl divide-y divide-[#0B1F33]/[0.06] border-y border-[#0B1F33]/[0.06]">
        {partnerFaqs.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-5 bg-transparent py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
                aria-expanded={isOpen}
              >
                <span className="text-[16px] font-semibold text-[#0B1F33]">{item.question}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#BFA46A] transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && <p className="max-w-3xl pb-5 text-[14px] leading-[1.7] text-[#0B1F33]/64">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function DynamicIntakeWorkflow() {
  const [selectedType, setSelectedType] = useState("properties");
  const [selectedGoal, setSelectedGoal] = useState("Increase repeat visits");
  const activePartner = useMemo(() => {
    const matched = partnerStates.find((state) => state.key === selectedType);
    if (matched) return matched;
    if (selectedType === "real-estate") {
      return {
        label: "Real estate / leasing",
        intakeTargeting: "Listing layer + neighborhood guide.",
        campaignType: "Listing launch + buyer or renter follow-up.",
        cta: "Bring This to Your Listings",
      };
    }
    return {
      label: "Custom",
      intakeTargeting: "Custom onboarding + shared map setup.",
      campaignType: "Pilot campaign built around your first use case.",
      cta: "Start a Custom Pilot",
    };
  }, [selectedType]);

  return (
    <SectionShell
      id="get-started"
      eyebrow="PARTNER INTAKE"
      title="Bring your part of downtown into the map."
      intro="Choose what you are trying to do, then share the basics. The right partner path starts from there."
      className="bg-white"
    >
      <div className="dp-partner-intake-shell">
        <div className="dp-partner-intake-controls">
          <section>
            <h3>What are you trying to do?</h3>
            <div className="dp-partner-intake-choice-rail" role="listbox" aria-label="Partner goal">
            {intakeGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setSelectedGoal(goal)}
                className={cn(selectedGoal === goal && "is-active")}
              >
                {goal}
              </button>
            ))}
            </div>
          </section>

          <section>
            <h3>Partner type</h3>
            <div className="dp-partner-intake-choice-rail" role="tablist" aria-label="Partner type">
            {organizationTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                role="tab"
                aria-selected={selectedType === type.key}
                onClick={() => setSelectedType(type.key)}
                className={cn(selectedType === type.key && "is-active")}
              >
                {type.label}
              </button>
            ))}
            </div>
          </section>

          <div className="dp-partner-intake-readout">
            <div>
              <span>Suggested path</span>
              <p>{activePartner.intakeTargeting}</p>
            </div>
            <div>
              <span>Recommended campaign type</span>
              <p>{activePartner.campaignType}</p>
            </div>
            <div>
              <span>Current goal</span>
              <p>{selectedGoal}</p>
            </div>
          </div>
        </div>

        <form className="dp-partner-intake-form">
          {intakeFields.map((field) => {
            const isLarge = field === "Notes" || field === "Main goal";
            const inputValue = field === "Partner type" ? activePartner.label : "";
            const textValue = field === "Main goal" ? selectedGoal : undefined;
            return (
              <label key={field} className={cn("grid gap-2", isLarge && "md:col-span-2")}>
                <span>{field}</span>
                {isLarge ? (
                  <textarea
                    className="min-h-28 border border-[#0B1F33]/[0.06] bg-white px-3 py-2 text-[14px] text-[#0B1F33] outline-none focus:border-[#BFA46A]/60"
                    value={textValue}
                    onChange={() => {}}
                    readOnly={field === "Main goal"}
                  />
                ) : (
                  <input
                    className="h-11 border border-[#0B1F33]/[0.06] bg-white px-3 text-[14px] text-[#0B1F33] outline-none focus:border-[#BFA46A]/60"
                    value={inputValue}
                    onChange={() => {}}
                    readOnly={field === "Partner type"}
                  />
                )}
              </label>
            );
          })}
          <div className="md:col-span-2">
            <button type="button">
              {activePartner.cta || "Start the Pilot"}
            </button>
            <p>This connects to the partner pilot workflow. Workspace setup begins after intake review.</p>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}

export function PartnerFinalCTA() {
  return (
    <section className="bg-[#0B1F33] px-5 py-16 text-white md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="dp-partner-label">FINAL CTA</p>
          <h2 className="mt-4 max-w-3xl font-heading text-[48px] leading-[0.94] tracking-[-0.04em] text-white md:text-[76px]">
            The city already moves. <span className="text-[#BFA46A]">Now make it visible.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.72] text-white/68 md:text-[18px]">
            Downtown Perks connects discovery, participation, and visibility through one shared downtown map.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <TextLink to="/partners/campaigns" className="text-white hover:border-[#BFA46A]">Book an Intro Call</TextLink>
          <TextLink to="/partner-workspace/overview" variant="secondary" className="text-white/68 hover:text-white">View Platform</TextLink>
        </div>
      </div>
    </section>
  );
}

export function PartnerWorkspaceBridge() {
  return (
    <SectionShell id="workspace-bridge" eyebrow="WORKSPACE CONNECTION" title="Public story first. Workspace after login." className="bg-[#F7F8FB]">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Map", body: "Open the partner map and review places, offers, events, and nearby context.", href: "/map?mode=partner&tab=map" },
          { title: "Performance", body: "See what people opened, saved, scanned, and requested—then choose the next action.", href: "/app/workspace/reports" },
          { title: "Workspace", body: "Manage campaigns, reports, and partner follow-up after login.", href: "/partner-workspace/overview" },
        ].map((item) => {
          return (
            <Link key={item.title} to={item.href} className="group border border-[#0B1F33]/[0.06] bg-white p-5 transition-colors hover:border-[#BFA46A]/40">
              <h3 className="mt-4 text-[17px] font-semibold text-[#0B1F33]">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/62">{item.body}</p>
              <span className="mt-5 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33] group-hover:text-[#BFA46A]">Open</span>
            </Link>
          );
        })}
      </div>
    </SectionShell>
  );
}
