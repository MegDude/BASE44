import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, Sparkles, Target, Waves } from "lucide-react";

const pillars = [
  {
    title: "The map is the product",
    body: "People do not need another feed. They need one live surface that makes nearby decisions easier.",
    icon: MapPinned,
  },
  {
    title: "Timing matters more than volume",
    body: "Downtown Perks works when proximity, time of day, and intent line up in one system.",
    icon: Target,
  },
  {
    title: "Community is repeated context",
    body: "The product should help people see the same places, people, and moments more often without forcing social behavior.",
    icon: Waves,
  },
];

const proofPoints = [
  { value: "1 map", label: "for places, events, perks, and properties" },
  { value: "5 lenses", label: "resident, property, hotel, venue, and brand context" },
  { value: "Real time", label: "trending, pulses, and intent-based visibility" },
  { value: "1 decision", label: "what to do next, without switching apps" },
];

const storyBands = [
  {
    eyebrow: "The shift",
    title: "Density without connection is still friction.",
    body: "Downtown already has the density. The missing layer is a live operating surface that turns density into clarity.",
  },
  {
    eyebrow: "The human layer",
    title: "Repeated context creates actual neighborhood behavior.",
    body: "The goal is not to invent another social network. The goal is to make daily movement feel connected, familiar, and easier to step into.",
  },
  {
    eyebrow: "The category",
    title: "This is the neighborhood layer for vertical downtown life.",
    body: "Not Yelp. Not Eventbrite. Not a loyalty card. Downtown Perks combines timing, place, and membership in one decision system.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[84px] pb-12">
      <div className="dp-page-shell dp-page-stack">
        <section className="relative overflow-hidden rounded-[34px] bg-[#0b1730] text-white shadow-[0_28px_70px_rgba(11,26,43,0.18)]">
          <img
            src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
            alt="Downtown Austin skyline"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,34,0.7)_0%,rgba(11,23,48,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,168,90,0.22),transparent_30%)]" />

          <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="dp-kicker">About Downtown Perks</span>
              <h1 className="dp-display-hero mt-5 max-w-3xl text-[2.7rem] md:text-[4.5rem]">
                Where downtown meets you.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/76 md:text-[16px]">
                Downtown Perks is the live neighborhood layer for people who live downtown and the partners trying to meet them there.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/downtown-perks/explore" className="dp-cta-primary">
                  Open Map
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/perks/card" className="dp-cta-secondary border-white/16 bg-white/12 text-white">
                  Get the Perks Card
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-3 self-end"
            >
              {proofPoints.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-xl"
                >
                  <div className="font-heading text-[1.7rem] font-semibold tracking-[-0.04em] text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-white/68">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="dp-band dp-band-muted p-6 md:p-8 lg:p-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-[24px] bg-white/78 p-5 shadow-[0_14px_30px_rgba(11,26,43,0.05)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,26,43,0.06)] text-[var(--dp-navy)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 font-heading text-[1.5rem] font-semibold tracking-[-0.03em] text-foreground">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-[14px] leading-7 text-foreground/66">{pillar.body}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="dp-band p-6 md:p-8">
            <div className="dp-eyebrow">Product truth</div>
            <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">
              Search less. Do more.
            </h2>
            <p className="dp-body-copy mt-4">
              People do not want more options. They want confidence in what to do next. That is the role of the map, the card, and the live context layer.
            </p>
            <div className="mt-6 rounded-[24px] bg-[rgba(11,26,43,0.04)] p-5">
              <div className="flex items-center gap-2 text-[var(--dp-gold-muted)]">
                <Sparkles className="h-4 w-4" />
                <span className="dp-eyebrow">Decision-first behavior</span>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-foreground/74">
                Places, events, perks, and properties should always resolve back into one next action: go now, save, RSVP, redeem, or open the map.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {storyBands.map((band) => (
              <div key={band.title} className="dp-band p-5 md:p-6">
                <div className="dp-eyebrow">{band.eyebrow}</div>
                <h3 className="mt-3 font-heading text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                  {band.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-foreground/66">{band.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dp-band dp-band-dark p-6 md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="dp-eyebrow text-[hsl(40,62%,62%)]">Bottom line</div>
              <h2 className="dp-display-section mt-4 text-[2rem] text-white md:text-[2.8rem]">
                The map is the interface. The system is the product.
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/72">
                Downtown Perks should feel like one premium city layer with multiple lenses, not a set of disconnected landing pages and admin screens.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/downtown-perks/explore" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                Explore Downtown
              </Link>
              <Link to="/partners" className="dp-cta-secondary border-white/16 bg-white/10 text-white">
                View Partner Types
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
