import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";

const CAMPAIGN_FORMATS = [
  {
    id: "founding",
    title: "Founding downtown partner",
    bestFor: "Always-on visibility across the downtown layer.",
    placements: "Map presence, recurring perks, partner placement, building adjacency.",
    offerModel: "Always-on downtown offer or utility-driven campaign.",
    kpiEmphasis: "Reach, repeat engagement, attributed visits.",
    body: "Use this format when the goal is to build steady, credible downtown presence over time. This works best for brands that want to stay visible inside the everyday resident and visitor flow rather than run a one-off burst.",
  },
  {
    id: "launch",
    title: "Launch campaign",
    bestFor: "Openings, seasonal drops, and timed announcements.",
    placements: "Map feature, QR moments, SMS follow-up, timed event tie-in.",
    offerModel: "Launch unlock, opening offer, timed push.",
    kpiEmphasis: "Scans, unlocks, launch-week visits, conversion pace.",
    body: "Use this format when timing matters. A launch campaign is built for brands introducing something new and wanting a clear downtown push tied to action, urgency, and measurable response.",
  },
  {
    id: "resident",
    title: "Resident activation campaign",
    bestFor: "Buildings, move-ins, welcome flows, and recurring resident discovery.",
    placements: "Lobby QR, welcome insert, building signage, resident perks flow.",
    offerModel: "Resident-only unlock or consultation CTA.",
    kpiEmphasis: "Building response, scans, opt-ins, resident redemptions.",
    body: "Use this format when the opportunity starts with where people live. This is ideal for brands that want to connect with residents through building-led access, welcome journeys, or recurring neighborhood discovery.",
  },
  {
    id: "event",
    title: "Event-led campaign",
    bestFor: "Hosted moments, sponsorship, and RSVP-driven activity.",
    placements: "Live event marker, RSVP layer, timed offer, post-event follow-up.",
    offerModel: "Event-linked perk or sponsored moment unlock.",
    kpiEmphasis: "Event opens, RSVPs, attendance, downstream redemptions.",
    body: "Use this format when the brand needs a live moment people can respond to. It works well for sponsorships, hosted activations, pop-ins, and event-linked downtown presence that continues beyond the event itself.",
  },
  {
    id: "utility",
    title: "Utility-led campaign",
    bestFor: "Campaigns that should feel useful rather than interruptive.",
    placements: "Map utility placement, building QR, service-led CTA, follow-up.",
    offerModel: "Service, booking, consult, or resident utility CTA.",
    kpiEmphasis: "Saves, scans, visit intent, repeat follow-up pool.",
    body: "Use this format when the best brand experience is one that feels genuinely helpful. This is the right approach for brands offering services, bookings, consults, appointments, or everyday value that fits naturally into downtown life.",
  },
];

const PROOF_METRICS = [
  { value: "2,400+", label: "Scans", color: "text-primary" },
  { value: "1,200+", label: "Unlocks", color: "text-emerald-600" },
  { value: "840+", label: "Saves", color: "text-violet-600" },
  { value: "720+", label: "Attributed visits", color: "text-amber-600" },
  { value: "340+", label: "Resident redemptions", color: "text-blue-600" },
  { value: "12", label: "Event response", color: "text-rose-600" },
];

const FORMAT_SELECTORS = [
  { id: "launch", label: "Launch timing" },
  { id: "founding", label: "Always-on downtown presence" },
  { id: "resident", label: "Building-led resident access" },
  { id: "event", label: "Event-tied conversion" },
];

function CampaignFormatCard({ format, isExpanded, onToggle }) {
  return (
    <motion.button
      onClick={() => onToggle(format.id)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`w-full text-left transition-all rounded-xl border ${
        isExpanded
          ? "border-primary bg-primary/3 shadow-sm"
          : "border-border/40 bg-card/40 hover:border-border/60 hover:bg-card/60"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-base capitalize">{format.title}</h3>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
        <p className="text-sm text-muted-foreground/80 font-medium mb-2">{format.bestFor}</p>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5 pt-5 border-t border-border/30 space-y-4"
          >
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                Core placements
              </h4>
              <p className="text-[13px] text-foreground/70">{format.placements}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                Offer model
              </h4>
              <p className="text-[13px] text-foreground/70">{format.offerModel}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                KPI emphasis
              </h4>
              <p className="text-[13px] text-foreground/70">{format.kpiEmphasis}</p>
            </div>

            <div className="bg-primary/5 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <p className="text-[13px] text-foreground/70 leading-relaxed mb-4">{format.body}</p>
              <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Use this format
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

function ProofMetricCard({ metric, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.04 }}
      className="p-5 rounded-lg border border-border/40 bg-card/40"
    >
      <div className={`font-heading text-2xl font-medium mb-1 tracking-tight ${metric.color}`}>
        {metric.value}
      </div>
      <div className="text-[12px] text-muted-foreground">{metric.label}</div>
    </motion.div>
  );
}

export default function BrandsPartner() {
  const [expandedFormat, setExpandedFormat] = useState(null);

  const handleFormatSelect = (formatId) => {
    setExpandedFormat(expandedFormat === formatId ? null : formatId);
  };

  const handleSelectorClick = (formatId) => {
    setExpandedFormat(formatId);
    const element = document.querySelector(`[data-format="${formatId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ──── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] block mb-4">
              Brands
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight mb-6">
              Campaigns built for how downtown actually moves.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              Downtown Perks helps brands show up at the right moment across the downtown layer. Launch a timed campaign,
              stay visible year-round, activate residents through buildings, or tie into live events and useful city
              behavior.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Explore campaign formats <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-colors"
              >
                View analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── INTRO ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-medium mb-4 tracking-tight">
              Campaign formats for downtown brands
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Choose the format that fits your timing, footprint, and downtown objective.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──── CAMPAIGN FORMATS ───────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {CAMPAIGN_FORMATS.map((format) => (
              <div key={format.id} data-format={format.id}>
                <CampaignFormatCard
                  format={format}
                  isExpanded={expandedFormat === format.id}
                  onToggle={handleFormatSelect}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── WHICH FORMAT IS RIGHT ────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl font-medium mb-6 tracking-tight"
          >
            Which format is right?
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FORMAT_SELECTORS.map((selector, i) => (
              <motion.button
                key={selector.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelectorClick(selector.id)}
                className={`p-4 rounded-lg border transition-all text-left font-medium text-sm ${
                  expandedFormat === selector.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/40 bg-card/40 hover:border-border/60 text-foreground/70 hover:text-foreground"
                }`}
              >
                {selector.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ──── EXAMPLE CAMPAIGN ────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-medium mb-4 tracking-tight">
                See how a downtown brand campaign comes to life
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                Every campaign format should feel grounded in the map, useful in the moment, and measurable after
                launch. Use example brand pages to show how a campaign actually appears across placements, messaging,
                and proof.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/brands/fine-eyewear"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  View Fine Eyewear example <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-colors"
                >
                  View analytics
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="aspect-video rounded-xl border border-border/40 bg-card/40 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <MapPin className="w-16 h-16 text-muted-foreground/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── ANALYTICS PROOF ────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-3xl font-medium mb-4 tracking-tight">Proof tied to real action</h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Brand campaigns inside Downtown Perks should be measured by what people actually do. Show scans, unlocks,
              saves, attributed visits, building engagement, event response, and repeat activity in a simple, legible
              format that makes campaign value obvious.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PROOF_METRICS.map((metric, i) => (
              <ProofMetricCard key={metric.label} metric={metric} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ──── CLOSING CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl font-medium mb-6 tracking-tight leading-[1.1]"
          >
            Build the campaign around the downtown moment.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Downtown Perks gives brands a way to show up inside live local behavior instead of sitting beside it.
            Start with the format that fits the objective, then connect placements, offer logic, and measurement into
            one downtown campaign system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              Check availability <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-colors"
            >
              Become a partner
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}