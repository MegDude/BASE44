import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Hotel, MapPin, Star, Users, LayoutDashboard } from "lucide-react";

const PARTNER_TYPES = [
  {
    slug: "properties",
    label: "Properties",
    eyebrow: "Property partner layer",
    headline: "Give residents a better way to use downtown.",
    body: "Your building becomes part of the map people already use to see what is nearby, what is worth doing, and what they can unlock around them.",
    stat: "6 buildings live",
    icon: Building2,
    color: "#C8973A",
    proof: ["1,284 resident interactions", "186 card activations", "412 perks unlocked"],
    cta: "Activate your building",
  },
  {
    slug: "hotels",
    label: "Hotels",
    eyebrow: "Hotel partner layer",
    headline: "Give guests a better way to explore downtown.",
    body: "Events, nearby places, local perks, and walkable suggestions all show up in one map your guests can actually use.",
    stat: "9 hotels active",
    icon: Hotel,
    color: "#7B9EC8",
    proof: ["2,104 guest interactions", "18 QR access points", "93 perk unlocks"],
    cta: "Connect your hotel",
  },
  {
    slug: "venues",
    label: "Venues",
    eyebrow: "Venue partner layer",
    headline: "Show up when people nearby are deciding where to go.",
    body: "Your venue appears on the map when someone nearby is looking for food, drinks, coffee, wellness, or something to do.",
    stat: "24 venues active",
    icon: MapPin,
    color: "#5B9E6E",
    proof: ["3,182 map views", "289 visits", "96 redemptions"],
    cta: "Add your venue",
  },
  {
    slug: "brands",
    label: "Brands",
    eyebrow: "Brand partner layer",
    headline: "Run campaigns that live in the city, not beside it.",
    body: "Your brand shows up through real downtown places, resident access points, venues, events, and walkable decision moments.",
    stat: "3 campaigns live",
    icon: Star,
    color: "#8B78C8",
    proof: ["1,204 scans", "412 visits", "34% scan-to-visit rate"],
    cta: "Launch a campaign",
  },
  {
    slug: "civic",
    label: "Civic",
    eyebrow: "Civic layer",
    headline: "Put your civic activity where people already look.",
    body: "If it matters downtown, it should show up here. Give civic organizations, district groups, and community programs a live presence on the map.",
    stat: "4 districts live",
    icon: Users,
    color: "#C85858",
    proof: ["10,880 map views", "327 RSVPs", "8 programs this week"],
    cta: "Integrate your organization",
  },
];

const SYSTEM_STATS = [
  { label: "Active partners", value: "47" },
  { label: "Map views this week", value: "24.8k" },
  { label: "Interactions", value: "6,100+" },
  { label: "Districts covered", value: "4" },
];

export default function PartnersIndex() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section ref={heroRef} className="pt-36 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px,transparent 1px),linear-gradient(90deg,hsl(222 18% 40%) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-5">
              Partner Platform · Downtown Austin · 78701
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5">
                  One downtown system.<br />
                  <em className="text-primary">Five ways in.</em>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                  Whether you run a building, hotel, venue, brand campaign, or civic program — Downtown Perks gives you a live presence on the map where people already decide what to do next.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {SYSTEM_STATS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                      className="p-4 rounded-xl border border-border/50 bg-card/60 text-center">
                      <div className="font-heading text-xl font-medium text-foreground">{s.value}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/40 bg-card/30 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 2 min ago · Live data</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-3">
            <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
              <LayoutDashboard className="w-4 h-4" /> Access partner workspace
            </Link>
            <a href="#partner-types" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
              Explore partner types
            </a>
          </motion.div>
        </div>
      </section>

      {/* PARTNER TYPE GRID */}
      <section id="partner-types" className="py-16 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Partner types</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              Find the right entry point for your organization.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTNER_TYPES.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.slug}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/partners/${p.slug}`}
                    className="block p-6 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all group h-full">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center"
                          style={{ background: `${p.color}15` }}>
                          <Icon className="w-4 h-4" style={{ color: p.color }} />
                        </div>
                        <span className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: p.color }}>
                          {p.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground/60 border border-border/40 px-2.5 py-1 rounded-full">
                        {p.stat}
                      </span>
                    </div>

                    <h3 className="font-heading font-medium text-lg leading-snug tracking-tight text-foreground mb-3 group-hover:text-foreground transition-colors">
                      {p.headline}
                    </h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">{p.body}</p>

                    <div className="space-y-1.5 mb-5">
                      {p.proof.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                          <div className="w-1 h-1 rounded-full shrink-0" style={{ background: p.color }} />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-[12px] font-medium group-hover:text-primary transition-colors"
                      style={{ color: p.color }}>
                      {p.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Workspace CTA card */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: 0.35 }}>
              <Link to="/partner-workspace"
                className="block p-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/8 hover:border-primary/50 transition-all group h-full flex flex-col justify-between min-h-[280px]">
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-primary uppercase tracking-[0.14em]">Partner workspace</span>
                  </div>
                  <h3 className="font-heading font-medium text-lg leading-snug tracking-tight text-foreground mb-3">
                    Already a partner? Manage everything from one place.
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Add perks, publish events, launch campaigns, and track performance across all your downtown touchpoints.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-primary mt-5">
                  Open workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW THE SYSTEM WORKS */}
      <HowSystemWorks />

      {/* CLOSING CTA */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Get started</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-3">
                Not sure where to start?
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Every partner type connects into the same downtown system. Tell us what you have and we will help you find the right setup.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                47 partners are already active across the downtown map. Each one adds visibility, context, and activity to the same live layer.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                  Access partner workspace <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="mailto:partners@downtownperks.com" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
                  Email the team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HowSystemWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const steps = [
    { n: "1", label: "Choose your entry point", detail: "Building, hotel, venue, brand, or civic organization." },
    { n: "2", label: "Connect to the map", detail: "Your activity, offers, or location goes live in the right context." },
    { n: "3", label: "Reach people nearby", detail: "Residents, guests, and visitors see your presence when they look." },
    { n: "4", label: "Track what happens", detail: "Views, saves, visits, and redemptions measured in one place." },
    { n: "5", label: "Grow from there", detail: "Add more touchpoints, connect to events, and deepen district reach." },
  ];
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 items-end">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How it works</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              One platform. Every type of downtown presence.
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
            className="text-muted-foreground text-[13px] leading-relaxed">
            The same underlying system connects buildings, hotels, venues, brands, and civic groups into a single live downtown layer — visible to the people already looking.
          </motion.p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-10 h-10 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-4 z-10">
                  <span className="text-primary font-heading font-medium text-sm">{s.n}</span>
                </div>
                <div className="font-medium text-sm text-foreground mb-1.5">{s.label}</div>
                <div className="text-[12px] text-muted-foreground leading-relaxed">{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}