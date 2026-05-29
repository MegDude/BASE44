import { motion } from "framer-motion";
import { MapPin, Users, Zap, TrendingUp, CalendarDays, BarChart2 } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <NotificationDemoPanel
      items={[
        { title: "Bangers — Brunch starts now", sub: "0.3 miles · Open · Member discount active" },
        { title: "Live music tonight at 9pm", sub: "Bangers · 6th Street · Members get priority entry" },
        { title: "New perk: free beer with any entrée", sub: "Bangers · Active for Downtown Perks members" },
      ]}
    />
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">This Week at Bangers</div>
      <div className="space-y-4">
        {[
          { day: "FRI", event: "Live Band — Doors 9pm", tag: "Members Priority Entry" },
          { day: "SAT", event: "Bottomless Brunch 11am–3pm", tag: "10% Member Discount" },
          { day: "SUN", event: "Acoustic Happy Hour 4pm", tag: "Free First Drink" },
        ].map((e, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-heading font-bold text-xs">{e.day}</span>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{e.event}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{e.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Bangers() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Venue & Hospitality · 6th Street Austin"
        headline={<>Bangers is already downtown.<br /><span className="text-primary">Now it's on every resident's radar.</span></>}
        support="Map discovery, recurring event distribution, and member perks that drive consistent foot traffic from Austin's highest-density residential blocks."
        ctaLabel="Put Bangers on the Map"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      {/* Why they fit */}
      <BrandSection label="The Fit" title="The best venue in the district still needs discovery.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Bangers thrives on energy, regulars, and the kind of word-of-mouth that only happens when people actually show up. Downtown Perks brings the pre-aware crowd — residents who are already within walking distance and looking for a reason to leave their building.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Map placement. Real-time event distribution. Member perks. Every touchpoint is designed to convert proximity into a visit.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "District-native foot traffic", desc: "Residents don't need convincing — they just need a reason and a reminder." },
              { label: "Recurring activation surface", desc: "Every event creates a new moment in the feed. Brunch. Nightlife. Live music." },
              { label: "Member perk engine", desc: "Offers are tied to card holders — redeemable, trackable, and brand-building." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <div className="font-semibold text-[13px] mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      {/* How they show up */}
      <BrandSection label="Activation" title="How Bangers shows up across the system." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Live map anchor" desc="Bangers is pinned on the downtown map — visible to every member within the district, every day." delay={0} />
          <FlowCard step="02" title="Event distribution" desc="Every event — brunch, live music, happy hour — appears in the member event feed. No paid boosting needed." delay={0.1} />
          <FlowCard step="03" title="Timed perk activation" desc="Member perks go live at the right moment: brunch offers on Saturday morning, nightlife perks on Friday afternoon." delay={0.2} />
          <FlowCard step="04" title="Building-linked reach" desc="Bangers surfaces inside the feeds of residents from The Waterline, The Paseo, and surrounding buildings." delay={0.3} />
          <FlowCard step="05" title="QR at the venue" desc="In-venue QR connects walk-in guests to the Downtown Perks membership — growing the audience with every visit." delay={0.4} />
          <FlowCard step="06" title="Redemption tracking" desc="Every perk redemption is logged. Bangers sees exactly how many Downtown Perks members walked in and what they redeemed." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What Bangers gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Always-on map presence" sub="Visible to 3,400+ downtown residents every day of the week." delay={0} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Event amplification" sub="Events distributed to members automatically — no social media spend required." delay={0.1} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Pre-qualified foot traffic" sub="Residents within half a mile with high walk-in intent." delay={0.2} />
          <SignalCard icon={<BarChart2 className="w-5 h-5" />} label="Redemption data" sub="Perk usage, peak visit windows, and member conversion rates." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Real-time activation" sub="Push a perk or promote an event in minutes." delay={0.4} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Local trust" sub="Endorsed by buildings residents already live in." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Use Cases" title="How Bangers actually uses this." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Brunch" title="Saturday morning discovery" detail="Members within 0.5 miles see a brunch perk go live at 10am. By 11:30, the room fills. Perk activates a 10% discount on their card." delay={0} />
          <UseCaseCard tag="Nightlife" title="Friday night RSVP flow" detail="A live music event goes on the district feed. Members RSVP through the card. Priority entry at the door — no line." delay={0.1} />
          <UseCaseCard tag="Regulars" title="Recurring member recognition" detail="Bangers flags members who've redeemed 3+ times. Custom perk — free first beer — surprises the regulars." delay={0.2} />
          <UseCaseCard tag="New Residents" title="Move-in week introduction" detail="New residents at The Waterline receive Bangers as a featured local venue on day one. First visit perk included." delay={0.3} />
          <UseCaseCard tag="Off-Peak" title="Slow Tuesday push" detail="Staff sends a real-time perk push at 5pm on a slow Tuesday. Happy hour offer, visible to members near 6th Street." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Proof" title="What the numbers look like.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="3,400+" label="Reachable members" sub="Downtown residents within walking distance" delay={0} />
          <SignalCard value="0.4mi" label="Average walk" sub="From residential buildings to Bangers" delay={0.1} />
          <SignalCard value="22%" label="Perk redemption rate" sub="Members who see an offer and act on it" delay={0.2} />
          <SignalCard value="Weekly" label="Event distribution" sub="Automatic, no effort required from the venue" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Bangers belongs on every resident's radar."
        sub="Map placement, event distribution, and member perks — all connected."
        ctaLabel="Get on the Map"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}