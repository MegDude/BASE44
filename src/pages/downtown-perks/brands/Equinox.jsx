import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, QrCode, Dumbbell, Crown } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <QRDemoPanel
      headline="Resident class pass."
      sub="Downtown Perks members at The Waterline receive a complimentary Equinox class credit — valid this week."
      action="Activate Class Pass"
    />
    <NotificationDemoPanel
      items={[
        { title: "Equinox — 6am cycling now open", sub: "0.4 miles · 3 spots left · Members priority" },
        { title: "New class: Sunday recovery flow", sub: "Equinox Austin · 9am · Complimentary guest pass" },
        { title: "Equinox x The Waterline partner week", sub: "Residents get first access this week" },
      ]}
    />
  </div>
);

export default function Equinox() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Premium Fitness · Downtown Partnership"
        headline={<>Equinox and downtown residents<br /><span className="text-primary">belong in the same room.</span></>}
        support="Class passes, building-linked partnerships, and member-first access — connecting Austin's premium fitness brand to the residents already living blocks away."
        ctaLabel="Start the Partnership"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      <BrandSection label="The Fit" title="Premium fitness needs premium proximity.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Equinox's members and Downtown Perks members are the same people. Active, high-income, routine-driven. The difference is that Downtown Perks members are already in the district, blocks away from the studio — and looking for a reason to commit.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Trial classes, building-linked discounts, and event tie-ins are how Equinox converts proximity into membership. Downtown Perks is the distribution channel that makes that frictionless.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Walk-distance audience", desc: "Residents at The Waterline and The Paseo are within a 5-minute walk of Equinox Austin." },
              { label: "Trial-to-membership pipeline", desc: "Complimentary class credits for Downtown Perks members convert into paid memberships." },
              { label: "Building-linked campaigns", desc: "Partner buildings receive co-branded Equinox offers for their residents." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
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

      <BrandSection label="Activation" title="How Equinox runs with Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Map placement" desc="Equinox studio pinned on the downtown map. Visible to all members in the walkable radius every day." delay={0} />
          <FlowCard step="02" title="Building-linked class credits" desc="Residents at partner buildings receive a complimentary class pass on move-in and quarterly thereafter." delay={0.1} />
          <FlowCard step="03" title="Event integration" desc="Class events — specialty sessions, wellness weeks, partner activations — appear in the member event feed." delay={0.2} />
          <FlowCard step="04" title="Member-first class access" desc="Specific class slots reserved for Downtown Perks members. Priority booking via perks card." delay={0.3} />
          <FlowCard step="05" title="QR-activated trial" desc="QR at building lobbies and partner venues unlocks an Equinox trial class for first-time members." delay={0.4} />
          <FlowCard step="06" title="Retention campaign surface" desc="Members who engage with fitness content in the feed get targeted Equinox offers — timed to behavior." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What Equinox earns.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Crown className="w-5 h-5" />} label="Premium peer placement" sub="Positioned alongside The Waterline, YETI, and Rivian in the same system." delay={0} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Trial-to-member pipeline" sub="Qualified, local, high-intent leads delivered via class credits." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Always-on visibility" sub="Map placement keeps Equinox top-of-mind for every nearby resident." delay={0.2} />
          <SignalCard icon={<Dumbbell className="w-5 h-5" />} label="Event distribution" sub="Specialty classes and activation weeks distributed to 3,400+ members." delay={0.3} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Frictionless trial flow" sub="QR-to-class in under 60 seconds. No forms, no friction." delay={0.4} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Measurable conversion" sub="Class credit redemptions and trial-to-membership rates tracked per campaign." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="How this looks in practice." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Move-In" title="Welcome class credit" detail="Every new resident at The Waterline receives an Equinox complimentary class in their move-in package. First use rate is the first conversion event." delay={0} />
          <UseCaseCard tag="Specialty Class" title="Members-first booking window" detail="Sunday recovery flow or specialty cycling event listed in the member feed with a 24-hour priority booking window before general release." delay={0.1} />
          <UseCaseCard tag="Partner Week" title="Building x Equinox activation" detail="One week per quarter, Equinox and a partner building co-activate. Residents get extended trial access. Equinox gains proximity-qualified leads." delay={0.2} />
          <UseCaseCard tag="Seasonal" title="New year fitness push" detail="January campaign. Equinox trial offers distributed to all members in the fitness category. Timed to behavior — post-holiday, intention-high window." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="Performance benchmarks.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="0.4mi" label="Walk from The Waterline" sub="Average distance to Equinox Austin" delay={0} />
          <SignalCard value="29%" label="Trial-to-member rate" sub="Members who use a class credit and convert" delay={0.1} />
          <SignalCard value="Weekly" label="Event distribution" sub="Classes and activations surfaced automatically" delay={0.2} />
          <SignalCard value="3,400+" label="Reachable audience" sub="Downtown residents in the fitness-active segment" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Put Equinox in front of the people who live for this."
        sub="Trial credits, building partnerships, and event distribution — connected."
        ctaLabel="Start the Partnership"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}