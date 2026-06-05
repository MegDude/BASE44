import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Building2, CalendarDays, ChevronDown, Compass, Hotel, Landmark, MapPin, RadioTower, Store } from "lucide-react";
import {
  analyticsCards,
  heroMetrics,
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
const partnerIconMap = {
  properties: Building2,
  hotels: Hotel,
  venues: Store,
  brands: RadioTower,
  civic: Landmark,
};

function SectionShell({ id, eyebrow, title, intro, children, className = "" }) {
  return (
    <section id={id} className={cn("bg-[#F7F8FB] px-5 py-16 text-[#0B1F33] md:px-8 md:py-24", className)}>
      <div className="mx-auto max-w-7xl">
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
            {intro && <p className="mt-5 max-w-3xl text-[16px] leading-[1.75] text-[#0B1F33]/62 md:text-[18px]">{intro}</p>}
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
        "group inline-flex h-10 items-center justify-center gap-2 border-b border-transparent bg-transparent px-0 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]",
        variant === "primary" ? "text-[#0B1F33] hover:border-[#C8A96A]" : "text-[#0B1F33]/58 hover:text-[#0B1F33]",
        className
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A] transition-transform group-hover:translate-x-0.5" />
    </Component>
  );
}

function PartnerPageNav() {
  return (
    <div className="border-b border-[#0B1F33]/[0.06] bg-[#F7F8FB] px-5 pt-[88px] md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex min-w-max items-center gap-5" aria-label="Partner page navigation">
          {partnerNavLinks.map((link) => (
            <Link key={link.label} to={link.href} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56 transition-colors hover:text-[#0B1F33]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/partners/campaigns"
          className="hidden h-9 shrink-0 items-center bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#132238] md:inline-flex"
        >
          Book Intro Call
        </Link>
      </div>
    </div>
  );
}

function PartnerHeroVisual() {
  const items = [
    { label: "Rainey movement spike", value: "+28%", meta: "Movement signal" },
    { label: "Seaholm resident saves", value: "412", meta: "Partner visibility" },
    { label: "Congress coverage gap", value: "Open", meta: "Recommended action" },
  ];

  return (
    <div className="relative min-h-[460px] overflow-hidden border border-[#0B1F33]/[0.06] bg-[#0B1F33] p-5 text-white shadow-[0_8px_24px_rgba(11,31,51,0.06)] md:min-h-[560px] md:p-6">
      <div className="absolute inset-0 opacity-45" aria-hidden="true">
        <div className="absolute inset-x-8 top-10 h-px bg-white/12" />
        <div className="absolute inset-x-8 top-32 h-px bg-white/10" />
        <div className="absolute inset-y-8 left-12 w-px bg-white/10" />
        <div className="absolute inset-y-8 left-1/2 w-px bg-white/10" />
        <div className="absolute inset-y-8 right-16 w-px bg-white/10" />
        <div className="absolute left-[26%] top-[28%] h-2 w-2 bg-[#C8A96A]" />
        <div className="absolute right-[26%] top-[44%] h-2 w-2 bg-white" />
        <div className="absolute bottom-[26%] left-[42%] h-2 w-2 bg-[#C8A96A]" />
      </div>

      <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner operating layer</p>
          <h2 className="mt-4 max-w-[12ch] font-heading text-[46px] leading-[0.92] tracking-[-0.04em] text-white md:text-[58px]">
            Movement becomes visible.
          </h2>
        </div>

        <div className="grid gap-3">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease }}
              className="border border-white/12 bg-white/[0.08] p-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{item.meta}</p>
                  <p className="mt-1 text-[14px] font-medium text-white">{item.label}</p>
                </div>
                <span className="text-[20px] font-semibold text-white">{item.value}</span>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-[#C8A96A]/40 pt-4">
            <p className="text-[12px] leading-5 text-white/72">Launch nearby activation based on the strongest district movement this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PartnerHero() {
  return (
    <>
      <PartnerPageNav />
      <section className="bg-[#F7F8FB] px-5 py-14 text-[#0B1F33] md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, ease }} className="max-w-3xl">
            <p className="dp-partner-label">LIVE DOWNTOWN INFRASTRUCTURE</p>
            <h1 className="mt-5 max-w-[11ch] font-heading text-[58px] leading-[0.9] tracking-[-0.05em] text-[#0B1F33] md:text-[84px] lg:text-[96px]">
              Be the place people choose next.
            </h1>
            <div className="mt-8 max-w-2xl space-y-3 text-[17px] leading-[1.72] text-[#0B1F33]/68 md:text-[18px]">
              <p>People are already downtown.</p>
              <p>Already walking.</p>
              <p>Already deciding.</p>
              <p>Already moving between buildings, events, hotels, offices, restaurants, and neighborhoods.</p>
              <p>Downtown Perks places your property, venue, activation, hotel, or organization directly inside that movement.</p>
              <p>Not through broad advertising.</p>
              <p>Through contextual visibility at the exact moment someone nearby is deciding where to go.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <TextLink to="#partner-system">Explore Partner Roles</TextLink>
              <TextLink to="#get-started" variant="secondary">Book an Intro Call</TextLink>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-[#0B1F33]/[0.06] pt-5">
              {heroMetrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-[24px] font-semibold leading-none text-[#0B1F33] md:text-[30px]">{metric.value}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/50">{metric.label}</p>
                </div>
              ))}
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
      title="Downtown works better when discovery becomes visible."
      className="bg-white"
    >
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="max-w-3xl space-y-4 text-[16px] leading-[1.78] text-[#0B1F33]/66 md:text-[18px]">
          <p>Right now, most local participation lives inside disconnected platforms.</p>
          <p>Google for restaurants.</p>
          <p>Instagram for events.</p>
          <p>Group texts for plans.</p>
          <p>Maps for directions.</p>
          <p>Five tabs open just to decide where to go tonight.</p>
          <p>The problem is not a lack of options.</p>
          <p>The problem is friction.</p>
          <p>Downtown Perks reduces that friction by turning the neighborhood itself into one connected operational layer.</p>
          <p>Residents discover nearby places.</p>
          <p>Hotels guide guests beyond the lobby.</p>
          <p>Venues become visible during moments of intent.</p>
          <p>Brands activate around real-world movement.</p>
          <p>Civic organizations coordinate participation at a district level.</p>
          <p>Everything connects through one live map-native system.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {operatingModelCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06, ease }}
              className="border border-[#0B1F33]/[0.06] bg-[#F7F8FB] p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">0{index + 1}</p>
              <h3 className="mt-4 text-[18px] font-semibold leading-tight text-[#0B1F33]">{card.title}</h3>
              <p className="mt-3 text-[13px] leading-[1.65] text-[#0B1F33]/62">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function PartnerDashboardPreview({ partner }) {
  const Icon = partnerIconMap[partner.key] || Compass;

  return (
    <div className="border border-[#0B1F33]/[0.06] bg-white p-5 shadow-[0_8px_24px_rgba(11,31,51,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="dp-partner-label">Demo operating view</p>
          <h3 className="mt-2 text-[20px] font-semibold leading-tight text-[#0B1F33]">{partner.label} activity</h3>
        </div>
        <span className="grid h-10 w-10 place-items-center bg-[#0B1F33] text-[#C8A96A]">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {partner.metrics.map((metric) => (
          <div key={metric.label} className="border-t border-[#0B1F33]/[0.06] pt-3">
            <p className="text-[20px] font-semibold leading-none text-[#0B1F33]">{metric.value}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/50">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {partner.activityFeed.map((item) => (
          <div key={`${item.label}-${item.time}`} className="flex items-start justify-between gap-4 border-t border-[#0B1F33]/[0.06] pt-3">
            <p className="text-[13px] leading-5 text-[#0B1F33]/72">{item.label}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C8A96A]">{item.time}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-[#0B1F33]/[0.06] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Analytics framing</p>
        <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/64">{partner.analyticsFraming}</p>
      </div>
    </div>
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
        className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_420px] lg:items-start"
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
                  "shrink-0 border border-[#0B1F33]/[0.06] px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] lg:w-full",
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Pilot and pricing</p>
              <div className="mt-2 space-y-1 text-[14px] leading-6 text-[#0B1F33]/70">
                {activePartner.pricing.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <TextLink to={activePartner.ctaHref}>{activePartner.cta}</TextLink>
          </div>
        </motion.div>

        <PartnerDashboardPreview partner={activePartner} />
      </div>
    </SectionShell>
  );
}

export function IntelligenceLayer() {
  return (
    <SectionShell
      id="intelligence"
      eyebrow="MEASURABLE DOWNTOWN INTELLIGENCE"
      title="See how people move, engage, return, and participate."
      intro="Downtown Perks transforms local participation into measurable operational visibility. The analytics experience should feel calm, readable, and operational. Not like enterprise BI software."
      className="bg-white"
    >
      <div className="grid gap-4 md:grid-cols-4">
        {intelligenceMetrics.map((metric) => (
          <article key={metric.label} className="border border-[#0B1F33]/[0.06] bg-[#F7F8FB] p-4">
            <p className="text-[25px] font-semibold leading-none text-[#0B1F33]">{metric.value}</p>
            <p className="mt-2 text-[11px] font-semibold text-[#0B1F33]">{metric.label}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{metric.window}</p>
            <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/58">{metric.source}</p>
            <p className="mt-3 border-t border-[#0B1F33]/[0.06] pt-3 text-[12px] leading-5 text-[#0B1F33]/72">{metric.action}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {analyticsCards.map((card) => (
          <article key={card.title} className="border-t border-[#C8A96A]/50 pt-4">
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
                className="flex w-full items-center justify-between gap-5 bg-transparent py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                aria-expanded={isOpen}
              >
                <span className="text-[16px] font-semibold text-[#0B1F33]">{item.question}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#C8A96A] transition-transform", isOpen && "rotate-180")} />
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
  const [selectedGoal, setSelectedGoal] = useState(intakeGoals[0]);
  const activePartner = useMemo(() => partnerStates.find((state) => state.key === selectedType) || partnerStates[0], [selectedType]);

  return (
    <SectionShell
      id="get-started"
      eyebrow="PARTNER INTAKE"
      title="Bring your part of downtown into the system."
      intro="Select your organization type to see the right onboarding flow, activation structure, and operational setup."
      className="bg-white"
    >
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">What are you trying to do?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {intakeGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setSelectedGoal(goal)}
                className={cn(
                  "border px-3 py-2 text-left text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]",
                  selectedGoal === goal ? "border-[#C8A96A]/35 bg-[#C8A96A]/10 text-[#0B1F33]" : "border-[#0B1F33]/[0.06] bg-[#F7F8FB] text-[#0B1F33]/62"
                )}
              >
                {goal}
              </button>
            ))}
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Organization type</p>
          <div className="mt-4 grid gap-2">
            {organizationTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setSelectedType(type.key)}
                className={cn(
                  "flex items-center justify-between border px-4 py-3 text-left text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]",
                  selectedType === type.key ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/[0.06] bg-[#F7F8FB] text-[#0B1F33]/68"
                )}
              >
                {type.label}
                {selectedType === type.key && <span className="h-1.5 w-1.5 bg-[#C8A96A]" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className="mt-8 border border-[#0B1F33]/[0.06] bg-[#F7F8FB] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Suggested path</p>
            <p className="mt-3 text-[15px] font-semibold text-[#0B1F33]">{activePartner.intakeTargeting}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Recommended campaign type</p>
            <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{activePartner.campaignType}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Current goal</p>
            <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{selectedGoal}</p>
          </div>
        </div>

        <form className="grid gap-4 border border-[#0B1F33]/[0.06] bg-[#F7F8FB] p-5 md:grid-cols-2 md:p-6">
          {intakeFields.map((field) => {
            const isLarge = field === "Notes" || field === "Main goal";
            return (
              <label key={field} className={cn("grid gap-2", isLarge && "md:col-span-2")}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52">{field}</span>
                {isLarge ? (
                  <textarea className="min-h-28 border border-[#0B1F33]/[0.06] bg-white px-3 py-2 text-[14px] text-[#0B1F33] outline-none focus:border-[#C8A96A]/60" defaultValue={field === "Main goal" ? selectedGoal : ""} />
                ) : (
                  <input className="h-11 border border-[#0B1F33]/[0.06] bg-white px-3 text-[14px] text-[#0B1F33] outline-none focus:border-[#C8A96A]/60" defaultValue={field === "Organization type" ? activePartner.label : ""} />
                )}
              </label>
            );
          })}
          <div className="md:col-span-2">
            <button type="button" className="inline-flex h-12 items-center justify-center bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#132238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]">
              {activePartner.cta || "Start the Pilot"}
            </button>
            <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/52">This connects to the partner pilot workflow. Workspace setup begins after intake review.</p>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}

export function PartnerFinalCTA() {
  return (
    <section className="bg-[#0B1F33] px-5 py-16 text-white md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="dp-partner-label">FINAL CTA</p>
          <h2 className="mt-4 max-w-3xl font-heading text-[48px] leading-[0.94] tracking-[-0.04em] text-white md:text-[76px]">
            The city already moves. <span className="text-[#C8A96A]">Now make it visible.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.72] text-white/68 md:text-[18px]">
            Downtown Perks connects movement, discovery, participation, and visibility through one shared downtown operating layer.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <TextLink to="/partners/campaigns" className="text-white hover:border-[#C8A96A]">Book an Intro Call</TextLink>
          <TextLink to="/partners/dashboard" variant="secondary" className="text-white/68 hover:text-white">View Dashboard</TextLink>
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
          { icon: MapPin, title: "Map integration", body: "Partner CTAs connect back to the live map and partner map mode.", href: "/map?mode=partner&tab=map" },
          { icon: BarChart3, title: "Public dashboard", body: "The demo dashboard remains a proof surface for reports and operating logic.", href: "/partners/dashboard" },
          { icon: CalendarDays, title: "Workspace", body: "The operating workspace remains separate for campaigns, reports, and live partner work.", href: "/partner-workspace/overview" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={item.href} className="group border border-[#0B1F33]/[0.06] bg-white p-5 transition-colors hover:border-[#C8A96A]/40">
              <Icon className="h-5 w-5 text-[#C8A96A]" />
              <h3 className="mt-4 text-[17px] font-semibold text-[#0B1F33]">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/62">{item.body}</p>
              <span className="mt-5 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33] group-hover:text-[#C8A96A]">Open</span>
            </Link>
          );
        })}
      </div>
    </SectionShell>
  );
}
