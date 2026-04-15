import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown, TrendingUp, Home, Utensils, Calendar, Zap } from "lucide-react";
import { PARTNER_SPACING, PARTNER_GRIDS } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_BRANDS } from '@/lib/faq-partner-data';

const CAMPAIGN_FORMATS = [
  {
    id: "founding",
    title: "Founding downtown partner",
    bestFor: "Always-on visibility",
    icon: Home,
    placements: "Map presence, recurring perks, partner placement, building adjacency.",
    offerModel: "Always-on downtown offer or utility-driven campaign.",
    kpiEmphasis: "Reach, repeat engagement, attributed visits.",
    body: "Use this format when the goal is to build steady, credible downtown presence over time.",
  },
  {
    id: "launch",
    title: "Launch campaign",
    bestFor: "Openings & seasonal",
    icon: TrendingUp,
    placements: "Map feature, QR moments, SMS follow-up, timed event tie-in.",
    offerModel: "Launch unlock, opening offer, timed push.",
    kpiEmphasis: "Scans, unlocks, launch-week visits, conversion pace.",
    body: "Use this format when timing matters. Built for brands introducing something new.",
  },
  {
    id: "resident",
    title: "Resident activation",
    bestFor: "Buildings & move-ins",
    icon: Utensils,
    placements: "Lobby QR, welcome insert, building signage, resident perks flow.",
    offerModel: "Resident-only unlock or consultation CTA.",
    kpiEmphasis: "Building response, scans, opt-ins, resident redemptions.",
    body: "Use this format when the opportunity starts with where people live.",
  },
  {
    id: "event",
    title: "Event-led campaign",
    bestFor: "Sponsorship & RSVPs",
    icon: Calendar,
    placements: "Live event marker, RSVP layer, timed offer, post-event follow-up.",
    offerModel: "Event-linked perk or sponsored moment unlock.",
    kpiEmphasis: "Event opens, RSVPs, attendance, downstream redemptions.",
    body: "Use this format when the brand needs a live moment people can respond to.",
  },
  {
    id: "utility",
    title: "Utility-led campaign",
    bestFor: "Service & helpful",
    icon: Zap,
    placements: "Map utility placement, building QR, service-led CTA, follow-up.",
    offerModel: "Service, booking, consult, or resident utility CTA.",
    kpiEmphasis: "Saves, scans, visit intent, repeat follow-up pool.",
    body: "Use this format when the best brand experience is one that feels genuinely helpful.",
  },
];

const PROOF_PRIMARY = [
  { value: "2,400+", label: "Scans", color: "text-primary" },
  { value: "840+", label: "Visits", color: "text-emerald-600" },
  { value: "340+", label: "Redemptions", color: "text-violet-600" },
  { value: "68%", label: "Scan-to-visit", color: "text-amber-600" },
];

const PROOF_SECONDARY = [
  { value: "12", label: "Campaigns live", color: "text-foreground/70" },
  { value: "4", label: "Districts active", color: "text-foreground/70" },
  { value: "28", label: "Venue partners", color: "text-foreground/70" },
  { value: "9", label: "Building access", color: "text-foreground/70" },
];

const LIVE_ACTIVITY = [
  { activity: "Resident scanned at The Quincy", campaign: "Downtown Welcome", time: "2 min ago", badge: "Trending" },
  { activity: "Guest opened campaign from Hotel Van Zandt", campaign: "Hotel Welcome", time: "5 min ago" },
  { activity: "Visit recorded near Congress Avenue", campaign: "Launch Campaign", time: "8 min ago" },
  { activity: "Redemption completed in-store", campaign: "Resident Activation", time: "12 min ago" },
  { activity: "QR scanned at The Paseo building", campaign: "Founding Partner", time: "15 min ago", badge: "Top venue" },
  { activity: "Event RSVP from downtown location", campaign: "Event-led Campaign", time: "18 min ago" },
];

const CAMPAIGN_EXAMPLES = [
  {
    name: "Fine Eyewear × Downtown Perks",
    placement: "The Paseo + Map",
    description: "Launch campaign for new location with QR integration.",
    scans: 340,
    visits: 210,
    redemptions: 58,
    trend: "+12%",
  },
  {
    name: "Hotel Welcome Campaign",
    placement: "Hotel Van Zandt + Resident Buildings",
    description: "Building-led resident activation with exclusive offer.",
    scans: 620,
    visits: 410,
    redemptions: 180,
    trend: "+24%",
  },
  {
    name: "Downtown Weekend Activation",
    placement: "Multi-venue + District",
    description: "Event-tied campaign across venues and outdoor spaces.",
    scans: 890,
    visits: 520,
    redemptions: 245,
    trend: "+18%",
  },
];

function CampaignFormatCard({ format, isExpanded, onToggle }) {
  const Icon = format.icon;
  return (
    <motion.button
      onClick={() => onToggle(format.id)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`w-full text-left transition-all rounded-xl border ${
        isExpanded
          ? "border-primary bg-white shadow-md"
          : "border-border/40 bg-white/50 hover:border-border/60 hover:bg-white/70"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-3">
          <div className={`p-2.5 rounded-lg ${isExpanded ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`w-5 h-5 ${isExpanded ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{format.title}</h3>
            <p className="text-xs text-muted-foreground/80 mt-0.5">{format.bestFor}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5 pt-5 border-t border-border/30 space-y-4"
          >
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                Placements
              </h4>
              <p className="text-sm text-foreground/70">{format.placements}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                Offer model
              </h4>
              <p className="text-sm text-foreground/70">{format.offerModel}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                KPI emphasis
              </h4>
              <p className="text-sm text-foreground/70">{format.kpiEmphasis}</p>
            </div>

            <div className="bg-primary/5 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">{format.body}</p>
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

function ProofTile({ metric, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06 }}
      className="p-6 rounded-lg border border-border/40 bg-white"
    >
      <div className={`font-heading text-3xl font-medium mb-2 tracking-tight ${metric.color}`}>
        {metric.value}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
    </motion.div>
  );
}

function CampaignExampleCard({ example, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="p-6 rounded-lg border border-border/40 bg-white hover:shadow-md transition-all"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-base mb-1">{example.name}</h3>
        <p className="text-xs text-muted-foreground">{example.placement}</p>
      </div>
      <p className="text-sm text-foreground/70 mb-5">{example.description}</p>
      <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-t border-border/30">
        <div className="pt-4">
          <div className="font-semibold text-lg text-primary">{example.scans}</div>
          <div className="text-xs text-muted-foreground">Scans</div>
        </div>
        <div className="pt-4">
          <div className="font-semibold text-lg text-emerald-600">{example.visits}</div>
          <div className="text-xs text-muted-foreground">Visits</div>
        </div>
        <div className="pt-4">
          <div className="font-semibold text-lg text-violet-600">{example.redemptions}</div>
          <div className="text-xs text-muted-foreground">Redemptions</div>
        </div>
      </div>
      <div className="text-xs font-medium text-emerald-600">{example.trend} this week</div>
    </motion.div>
  );
}

export default function BrandsPartner() {
  const [expandedFormat, setExpandedFormat] = useState(null);

  const handleFormatSelect = (formatId) => {
    setExpandedFormat(expandedFormat === formatId ? null : formatId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ──── HERO ──────────────────────────────────────────────────────── */}
      <section className={`relative ${PARTNER_SPACING.heroVertical} px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] block mb-4">
                Brand Partner Layer
              </span>
              <h1 className="font-heading text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight mb-6">
                Put your brand where people are already moving.
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Downtown Perks helps brands show up inside real downtown behavior — through buildings, venues, map context, district activity, and timed campaign moments that lead to measurable response.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                  Plan a campaign <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-colors">
                  See placement map
                </button>
              </div>

              {/* Live stat strip */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg border border-border/30 bg-white/50">
                  <div className="font-semibold text-lg text-primary">12</div>
                  <div className="text-xs text-muted-foreground">Campaigns live</div>
                </div>
                <div className="p-3 rounded-lg border border-border/30 bg-white/50">
                  <div className="font-semibold text-lg text-emerald-600">2.4K</div>
                  <div className="text-xs text-muted-foreground">Total scans</div>
                </div>
                <div className="p-3 rounded-lg border border-border/30 bg-white/50">
                  <div className="font-semibold text-lg text-violet-600">840</div>
                  <div className="text-xs text-muted-foreground">Visits</div>
                </div>
                <div className="p-3 rounded-lg border border-border/30 bg-white/50">
                  <div className="font-semibold text-lg text-amber-600">340</div>
                  <div className="text-xs text-muted-foreground">Redemptions</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">4 districts • Updated 2 min ago</div>
            </motion.div>

            {/* Campaign preview module */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-xl border border-border/40 bg-white"
            >
              <div className="mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Campaign preview</span>
              </div>
              <div className="aspect-video rounded-lg bg-muted/30 flex items-center justify-center mb-6">
                <MapPin className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-3 mb-6 pb-6 border-t border-border/30">
                <div>
                  <div className="text-xs text-muted-foreground/70 mb-1">Campaign</div>
                  <div className="font-medium text-sm">Fine Eyewear Launch</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground/70 mb-1">Best placement</div>
                  <div className="text-sm text-primary font-medium">The Paseo</div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">District: Downtown</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-semibold text-primary">340</div>
                  <div className="text-xs text-muted-foreground">Scans</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-600">210</div>
                  <div className="text-xs text-muted-foreground">Visits</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-violet-600">58</div>
                  <div className="text-xs text-muted-foreground">Redeemed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── CAMPAIGN FORMAT SELECTOR ──────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] block mb-3">
              Campaign formats
            </span>
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              Choose the campaign format that fits the objective.
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Some campaigns need steady downtown presence. Some need a launch window. Some work best through buildings, events, or useful local behavior. Start with the format that matches what needs to happen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* ──── PLACEMENT EXPLORER ────────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              See where campaigns actually run.
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Every touchpoint is tied to a real place — a building lobby, a venue, a live map pin, a district moment, or a QR-triggered entry point.
            </p>
          </motion.div>

          {/* Map layer explanation chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-medium text-foreground/70">Live campaigns</span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-medium text-foreground/70">Building QR</span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-medium text-foreground/70">Venue placement</span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-medium text-foreground/70">District activation</span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-medium text-foreground/70">Redemption point</span>
          </div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video rounded-xl border border-border/40 bg-card/40 flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <MapPin className="w-16 h-16 text-muted-foreground/20" />
          </motion.div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              How a downtown campaign turns into action.
            </h2>
          </motion.div>

          {/* Timeline steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {[
              { num: "01", title: "Define the placement", desc: "Pick the districts, buildings, venues, and timing that shape the campaign." },
              { num: "02", title: "Launch the touchpoints", desc: "QR codes, map placements, venue surfaces, and district ties go live together." },
              { num: "03", title: "Show up in context", desc: "The campaign appears when someone nearby is already deciding what to do." },
              { num: "04", title: "People scan, save, and go", desc: "The interaction starts from a useful local moment, not a passive impression." },
              { num: "05", title: "See what converted", desc: "Scans, visits, saves, and redemptions are tracked by placement." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg border border-border/40 bg-white"
              >
                <div className="text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{step.num}</div>
                <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Campaign path strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-4 rounded-lg border border-border/40 bg-white text-center"
          >
            <div className="text-sm font-medium text-foreground/70">
              Building QR <span className="text-muted-foreground mx-3">→</span>
              Map open <span className="text-muted-foreground mx-3">→</span>
              Save / tap <span className="text-muted-foreground mx-3">→</span>
              Visit <span className="text-muted-foreground mx-3">→</span>
              Redemption
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── CAMPAIGN EXAMPLES ─────────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              See how campaigns come to life.
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              A strong campaign should feel grounded in place, useful in the moment, and measurable after launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {CAMPAIGN_EXAMPLES.map((example, i) => (
              <CampaignExampleCard key={example.name} example={example} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ──── PROOF AND ANALYTICS ───────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              Proof that goes beyond impressions.
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Brand campaigns inside Downtown Perks should be measured by what people actually do — scans, visits, saves, redemptions, building response, and event-linked activity.
            </p>
          </motion.div>

          {/* Primary metrics */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Primary metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROOF_PRIMARY.map((metric, i) => (
                <ProofTile key={metric.label} metric={metric} index={i} />
              ))}
            </div>
          </div>

          {/* Secondary metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Campaign activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROOF_SECONDARY.map((metric, i) => (
                <ProofTile key={metric.label} metric={metric} index={i + 4} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── LIVE ACTIVITY ────────────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl font-medium mb-8 tracking-tight"
          >
            Live campaign activity
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border/40 bg-white overflow-hidden"
          >
            <div className="divide-y divide-border/30">
              {LIVE_ACTIVITY.map((item, i) => (
                <div key={i} className={`px-6 py-4 flex items-start justify-between gap-4 ${i % 2 === 0 ? "bg-white/50" : "bg-white"}`}>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.activity}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.campaign}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.badge && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{item.badge}</span>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── CAMPAIGN PLANNING FORM ────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-heading text-4xl font-medium mb-4 tracking-tight">
              Plan the campaign around the downtown moment.
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Tell us what you want to achieve, where you want to show up, and what kind of response matters most. We will help map the right format, placements, and measurement plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Campaign type selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">Campaign type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "brand", label: "Brand" },
                    { id: "property", label: "Property" },
                    { id: "venue", label: "Venue" },
                    { id: "hotel", label: "Hotel" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className="px-4 py-3 rounded-lg border border-border/40 text-sm font-medium hover:border-primary/40 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basics */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization name</label>
                  <input type="text" placeholder="Your brand or organization" className="w-full px-4 py-2.5 rounded-lg border border-border/40 focus:border-primary/40 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your name and role</label>
                  <input type="text" placeholder="e.g. Jane Smith, Marketing Director" className="w-full px-4 py-2.5 rounded-lg border border-border/40 focus:border-primary/40 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-lg border border-border/40 focus:border-primary/40 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input type="tel" placeholder="(555) 000-0000" className="w-full px-4 py-2.5 rounded-lg border border-border/40 focus:border-primary/40 outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Campaign intent */}
              <div>
                <label className="block text-sm font-semibold mb-3">What do you want this campaign to do?</label>
                <textarea placeholder="Describe your campaign goal..." className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-primary/40 outline-none transition-colors resize-none" rows="4" />
              </div>

              {/* Smart prompts */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">Or select a common scenario:</label>
                <div className="space-y-2">
                  {[
                    "We want placement across real downtown locations",
                    "Help us set up a QR-to-map flow",
                    "Show us how a campaign connects to buildings and venues",
                    "We want to track visits and redemptions by placement",
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full px-4 py-2.5 text-left text-sm rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Submit campaign plan
              </button>
            </motion.form>

            {/* Side panel */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-lg border border-border/40 bg-white h-fit"
            >
              <h3 className="font-semibold text-base mb-6">Based on your input</h3>
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Recommended format</div>
                  <div className="text-sm font-medium text-primary">Launch campaign</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Likely placements</div>
                  <div className="text-sm text-foreground/70">Map feature, QR moments, venue surfaces</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Tracked metrics</div>
                  <div className="text-sm text-foreground/70">Scans, unlocks, visit pace, conversion</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── FAQ ────────────────────────────────────────────────────── */}
      <FAQAccordionBlock
        sectionEyebrow="Brand FAQs"
        sectionTitle="Questions about downtown campaigns"
        sectionIntro="Brands use Downtown Perks to show up inside real downtown movement, not beside it."
        items={FAQ_BRANDS}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="brands"
        backgroundVariant="light"
      />

      {/* ──── CLOSING CTA ────────────────────────────────────────────── */}
      <section className={`${PARTNER_SPACING.sectionVertical} px-6 border-t border-border/40`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-5xl md:text-6xl font-medium mb-6 tracking-tight leading-[1.05]"
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
            Downtown Perks gives brands a way to show up inside live local behavior instead of sitting beside it. Start with the format that fits the objective, then connect placements, offer logic, and measurement into one downtown campaign system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3 justify-center mb-6"
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
          <p className="text-xs text-muted-foreground">
            Questions? <a href="mailto:partners@downtownperks.com" className="font-medium text-primary hover:text-primary/90">partners@downtownperks.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}