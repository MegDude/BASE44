import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, animate } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  MapPin,
  Megaphone,
  QrCode,
  Sparkles,
} from "lucide-react";
import PartnerMapIntelligenceLayer from "@/components/partner/PartnerMapIntelligenceLayer";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_BRANDS } from "@/lib/faq-partner-data";

const CAMPAIGN_POINTS = [
  {
    id: "legends",
    name: "Legends Real Estate",
    type: "Verified listing layer",
    district: "2nd Street",
    lat: 30.2659,
    lng: -97.7475,
    logo: "/pins/downtown-perks/legends-logo.avif",
    scans: 340,
    saves: 118,
    redemptions: 58,
    signal: "Listings + resident demand",
  },
  {
    id: "paseo",
    name: "The Paseo",
    type: "Building access",
    district: "Rainey",
    lat: 30.2578,
    lng: -97.7388,
    scans: 620,
    saves: 214,
    redemptions: 96,
    signal: "Lobby QR + resident welcome flow",
  },
  {
    id: "van-zandt",
    name: "Hotel Van Zandt",
    type: "Hospitality placement",
    district: "Rainey",
    lat: 30.2571,
    lng: -97.7392,
    scans: 410,
    saves: 122,
    redemptions: 74,
    signal: "Guest arrival + nearby discovery",
  },
  {
    id: "waterline",
    name: "Waterline District",
    type: "District activation",
    district: "Congress",
    lat: 30.2633,
    lng: -97.7414,
    scans: 520,
    saves: 176,
    redemptions: 88,
    signal: "Event tie-in + corridor visibility",
  },
];

const FORMATS = [
  {
    id: "placement",
    title: "Map placement",
    icon: MapPin,
    copy: "Show up when people nearby are already deciding where to go, what to do, or what to try next.",
    details: ["District targeting", "Category context", "Nearby resident visibility"],
  },
  {
    id: "qr",
    title: "QR entry points",
    icon: QrCode,
    copy: "Connect lobby, venue, event, and campaign surfaces directly into the live downtown map.",
    details: ["Building QR", "Venue QR", "Event QR"],
  },
  {
    id: "events",
    title: "Event-linked campaigns",
    icon: CalendarDays,
    copy: "Tie the brand to something people can actually attend, save, scan, or redeem.",
    details: ["RSVP flow", "Timed offer", "Post-event follow-up"],
  },
  {
    id: "resident",
    title: "Resident access",
    icon: BadgeCheck,
    copy: "Create useful resident-only moments without making the campaign feel like advertising.",
    details: ["Card unlock", "Resident perk", "Building audience"],
  },
];

const WORKFLOW = [
  ["01", "Choose the moment", "Pick the district, building, event, venue, or resident behavior the campaign should live inside."],
  ["02", "Place the entry points", "Set up map placement, QR access, offer logic, and the surfaces people will actually see."],
  ["03", "Go live downtown", "The campaign appears in context while people are nearby and already making decisions."],
  ["04", "Track what happened", "Measure scans, saves, redemptions, visits, and district activity without relying on vague impressions."],
];

const PROOF = [
  ["12", "Campaigns live"],
  ["4", "Active districts"],
  ["2.4k", "Campaign scans"],
  ["340", "Redemptions"],
];

const PROMPTS = [
  "We want to activate a downtown district.",
  "We want a campaign tied to residents and buildings.",
  "We want QR entry points connected to the map.",
  "We want to track real-world scans and redemptions.",
];

function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, Number(to), {
      duration: 1.15,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return controls.stop;
  }, [inView, to]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={`border-t border-[#0B1F33]/8 px-5 py-14 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] text-[#0B1F33] md:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function PrimaryButton({ href, children }) {
  return (
    <a href={href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#081521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
      {children}
      <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
    </a>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <a href={href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:border-[#B38F4F]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
      {children}
    </a>
  );
}

export default function BrandsPartner() {
  const [activePoint, setActivePoint] = useState(CAMPAIGN_POINTS[0]);
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);
  const [submitted, setSubmitted] = useState(false);

  function submitPlan(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,51,0.28) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative mx-auto max-w-6xl">
          <Link to="/partners" className="mb-8 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/58 transition hover:text-[#0B1F33]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Partner overview
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <span className="dp-label mb-4 block">Brand Partner Layer</span>
              <h1 className="font-heading text-[38px] font-medium leading-[1.03] md:text-[56px]">
                Buy the moment, not the impression.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-[#0B1F33]/68">
                The best advertising does not feel like advertising. It feels like something useful that arrived at the right time. Downtown Perks places brands inside decisions already happening downtown: coffee, lunch, drinks, events, tonight.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href="#brand-form">Start a conversation</PrimaryButton>
                <SecondaryButton href="#brand-map">See placement map</SecondaryButton>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                {PROOF.map(([value, label], index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => document.querySelector("#proof")?.scrollIntoView({ behavior: "smooth" })}
                    className="rounded-md border border-[#0B1F33]/8 bg-white/86 p-3 text-left shadow-[0_8px_24px_rgba(11,31,51,0.05)] transition hover:border-[#B38F4F]/45"
                  >
                    <div className="font-heading text-2xl font-medium text-[#0B1F33]">
                      {Number.isFinite(Number(value)) ? <CountUp to={value} /> : value}
                    </div>
                    <div className="mt-1 text-[11px] text-[#0B1F33]/58">{label}</div>
                    {index === 0 && <span className="sr-only">View proof metrics</span>}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="dp-glass-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">Campaign preview</span>
                <Sparkles className="h-4 w-4 text-[#B38F4F]" />
              </div>
              <div className="mt-5 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0B1F33] text-[#B38F4F]">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0B1F33]">{activePoint.name}</div>
                    <div className="text-[11px] text-[#0B1F33]/52">{activePoint.type} · {activePoint.district}</div>
                  </div>
                </div>
                <p className="mt-4 text-[12px] leading-5 text-[#0B1F33]/62">{activePoint.signal}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Scans", activePoint.scans],
                  ["Saves", activePoint.saves],
                  ["Redeem", activePoint.redemptions],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[#0B1F33]/8 bg-white p-3 text-center">
                    <div className="text-[16px] font-semibold text-[#0B1F33]">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#0B1F33]/48">{label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#0B1F33]/52">Performance is grouped by placement, district, and action so the campaign can be adjusted while it is live.</p>
            </motion.aside>
          </div>
        </div>
      </section>

      <Section id="brand-map" eyebrow="Spatial Placement" title="See where campaigns actually run.">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-lg" style={{ height: 480 }}>
            <PartnerMapIntelligenceLayer
              activeId={activePoint.id}
              caption="Campaign intelligence layer"
              insight="Campaign placements, QR scans, resident saves, and redemptions shown by downtown context."
              kind="brand"
              onSelect={setActivePoint}
              points={CAMPAIGN_POINTS}
            />
          </div>

          <div className="rounded-lg border border-[#0B1F33]/8 bg-white">
            <div className="border-b border-[#0B1F33]/8 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">Placement layer</div>
              <h3 className="mt-2 font-heading text-2xl font-medium">{activePoint.name}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/62">{activePoint.signal}</p>
            </div>
            <div className="divide-y divide-[#0B1F33]/8">
              {CAMPAIGN_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActivePoint(point)}
                  className={`grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 p-3 text-left transition ${
                    point.id === activePoint.id ? "bg-[#0B1F33] text-white" : "hover:bg-[#F7F8FB]"
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                    point.id === activePoint.id ? "border-[#B38F4F]/60 bg-white/10 text-[#B38F4F]" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]"
                  }`}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{point.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] opacity-65">{point.type} · {point.district}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Operating Model" title="A brand campaign becomes useful when it belongs to a place.">
        <div className="grid gap-3 md:grid-cols-4">
          {FORMATS.map((format) => {
            const Icon = format.icon;
            return (
              <motion.article
                key={format.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="dp-glass-card p-5"
              >
                <Icon className="h-5 w-5 text-[#B38F4F]" />
                <h3 className="mt-4 font-body text-[14px] font-semibold text-[#0B1F33]">{format.title}</h3>
                <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/62">{format.copy}</p>
                <div className="mt-4 space-y-1.5">
                  {format.details.map((detail) => (
                    <div key={detail} className="rounded-md border border-[#0B1F33]/8 bg-white/72 px-2.5 py-1.5 text-[11px] text-[#0B1F33]/62">{detail}</div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Workflow" title="How a downtown campaign turns into action." className="bg-white">
        <div className="grid gap-3 md:grid-cols-4">
          {WORKFLOW.map(([num, title, copy]) => (
            <article key={num} className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">{num}</div>
              <h3 className="mt-4 font-body text-[14px] font-semibold text-[#0B1F33]">{title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/62">{copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-[#0B1F33]/8 bg-white p-4 text-center text-[13px] font-medium text-[#0B1F33]/70">
          QR entry <span className="mx-3 text-[#0B1F33]/34">→</span>
          Map open <span className="mx-3 text-[#0B1F33]/34">→</span>
          Save or scan <span className="mx-3 text-[#0B1F33]/34">→</span>
          Visit <span className="mx-3 text-[#0B1F33]/34">→</span>
          Redemption
        </div>
      </Section>

      <Section id="proof" eyebrow="Measurement" title="Proof that goes beyond impressions.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Scans", "2,400+", "People opened the campaign from QR, map, or placement."],
            ["Saves", "630+", "People kept the place, offer, or event for later."],
            ["Redemptions", "340+", "People used the offer or checked in through the resident card."],
            ["Districts", "4", "Campaign activity grouped by downtown context."],
          ].map(([label, value, copy]) => (
            <div key={label} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5 shadow-[0_12px_30px_rgba(11,31,51,0.05)]">
              <div className="font-heading text-3xl font-medium text-[#0B1F33]">{value}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">{label}</div>
              <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/60">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Brand pricing" title="Campaigns can start small, then add placement when the data says to.">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-5 shadow-[0_14px_34px_rgba(11,31,51,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">Brand range</p>
            <div className="mt-3 font-heading text-3xl font-medium text-[#0B1F33]">$99-$149/year</div>
            <p className="mt-4 text-[13px] leading-6 text-[#0B1F33]/64">
              Pricing depends on footprint, timing, placements, and whether the campaign includes survey capture, event activation, or district visibility.
            </p>
            <Link to="/partners/pricing#surveys" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#081521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              View pricing matrix
              <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Dumb tech entry", "QR code or text prompt. No app rollout, no complicated partner software."],
              ["Survey learning", "Ask people why they came, what they want, and what would bring them back."],
              ["Smart reporting", "The engine turns scans, answers, district, and timing into plain-English next steps."],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-md border border-[#0B1F33]/8 bg-white p-4">
                <h3 className="text-[13px] font-semibold text-[#0B1F33]">{title}</h3>
                <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/60">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="brand-form" eyebrow="Get Started" title="Start a brand conversation." className="bg-white">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0B1F33] text-[#B38F4F]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-body text-[14px] font-semibold">Buy the moment, not the impression.</h3>
                <p className="mt-1 text-[12px] text-[#0B1F33]/58">From $99-$149/year depending on footprint and activation.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`rounded-md border px-3 py-2 text-left text-[12px] leading-5 transition ${
                    selectedPrompt === prompt ? "border-[#B38F4F]/60 bg-white text-[#0B1F33]" : "border-[#0B1F33]/8 bg-white/58 text-[#0B1F33]/62 hover:border-[#B38F4F]/45"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submitPlan} className="grid gap-3 rounded-lg border border-[#0B1F33]/8 bg-white p-5">
            {["Brand/Company Name", "Your Name & Role", "Email", "Phone", "Timeline"].map((label) => (
              <label key={label} className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{label}</span>
                <input required={label !== "Phone"} className="h-10 rounded-md border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 text-[13px] outline-none focus:border-[#B38F4F]" />
              </label>
            ))}
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">What are you activating?</span>
              <textarea
                value={selectedPrompt}
                onChange={(event) => setSelectedPrompt(event.target.value)}
                className="min-h-28 rounded-md border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 py-2.5 text-[13px] outline-none focus:border-[#B38F4F]"
              />
            </label>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#081521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Start a conversation
            </button>
            {submitted && (
              <p className="rounded-md border border-[#B38F4F]/35 bg-[#F7F8FB] px-3 py-2 text-[12px] text-[#0B1F33]/68">
                Thanks. Your brand campaign request is ready for follow-up.
              </p>
            )}
          </form>
        </div>
      </Section>

      <FAQAccordionBlock
        sectionEyebrow="Brand FAQs"
        sectionTitle="Questions about downtown campaigns"
        sectionIntro="Brands use Downtown Perks to show up inside real downtown movement, not beside it."
        items={FAQ_BRANDS}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="brands"
        backgroundVariant="light"
      />

      <Section eyebrow="Final CTA" title="Build the campaign around the downtown moment.">
        <div className="max-w-3xl">
          <p className="text-[14px] leading-7 text-[#0B1F33]/68">
            Downtown Perks gives brands a way to show up inside live local behavior instead of sitting beside it. Start with the format that fits the objective, then connect placements, offer logic, and measurement into one downtown campaign system.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="#brand-form">Start a conversation</PrimaryButton>
            <Link to="/partners" className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:border-[#B38F4F]/45">
              Partner overview
            </Link>
            <Link to="/partners/pricing" className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:border-[#B38F4F]/45">
              Pricing matrix
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-[#0B1F33]/52">
            Questions? <a href="mailto:partners@downtownperks.com" className="font-semibold text-[#0B1F33] underline decoration-[#B38F4F]/50 underline-offset-4">partners@downtownperks.com</a>
          </p>
        </div>
      </Section>
    </div>
  );
}
