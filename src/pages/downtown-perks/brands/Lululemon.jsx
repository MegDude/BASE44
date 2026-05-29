import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, Heart, QrCode, Dumbbell } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <NotificationDemoPanel
      items={[
        { title: "lululemon Run Club — departs 6am", sub: "Congress Ave · Saturday · Free for members" },
        { title: "New arrivals: member preview in-store", sub: "Domain / 2nd Street · Today 12–3pm" },
        { title: "Rooftop yoga with lululemon ambassador", sub: "The Waterline Rooftop · Sunday 8am" },
      ]}
    />
    <QRDemoPanel
      headline="Member yoga pass."
      sub="Scan to claim your complimentary class credit — exclusive for Downtown Perks members this week."
      action="Claim Class Credit"
    />
  </div>
);

export default function Lululemon() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Premium Retail & Wellness · Austin"
        headline={<>lululemon runs downtown.<br /><span className="text-primary">Downtown Perks gets residents there.</span></>}
        support="Run clubs, studio tie-ins, QR-activated product moments, and building partnerships that connect lululemon to the people who are already moving every morning."
        ctaLabel="Build the Partnership"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      <BrandSection label="The Fit" title="Their customer is our member.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              lululemon doesn't just sell activewear. It sells a lifestyle that happens to start at 6am, run along Lady Bird Lake, and finish with a cold brew. That lifestyle is exactly what Downtown Perks is built around.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The overlap is total. Downtown residents who activate on the map are the people already wearing lululemon to the gym, the studio, and Sunday brunch. Downtown Perks is the moment before the purchase.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Run club infrastructure", desc: "lululemon run clubs slot naturally into the morning fitness layer of the member event feed." },
              { label: "In-store activation", desc: "Member-exclusive previews and product moments drive qualified retail visits." },
              { label: "Studio tie-ins", desc: "lululemon ambassador classes in partner buildings or nearby studios get distributed to the full member network." },
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

      <BrandSection label="Activation" title="How lululemon shows up." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Run club distribution" desc="Saturday morning run club appears in the member event feed. lululemon branding, gear giveaway, hydration station." delay={0} />
          <FlowCard step="02" title="Studio co-activation" desc="Ambassador-led classes in The Waterline gym or a partner studio. RSVP-gated. Members-first access." delay={0.1} />
          <FlowCard step="03" title="In-store member moments" desc="Exclusive access windows for members — new arrivals preview, private styling session, class credit redemption." delay={0.2} />
          <FlowCard step="04" title="Building placement" desc="lululemon appears as a featured partner in resident feeds near their nearest retail location." delay={0.3} />
          <FlowCard step="05" title="QR-activated product moments" desc="In-store or at events, QR unlocks a member-exclusive offer. Tracked to the Downtown Perks layer." delay={0.4} />
          <FlowCard step="06" title="Seasonal campaign surfaces" desc="Fall gear drops, spring run series, and studio launch events all get distributed through the member feed." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What lululemon gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Dumbbell className="w-5 h-5" />} label="Fitness-native reach" sub="Members who are already moving — the people lululemon is for." delay={0} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Community presence" sub="Run clubs build brand loyalty. Downtown Perks distributes them." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District map placement" sub="Nearest retail location surfaced to every member within walking distance." delay={0.2} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Product conversion" sub="QR-activated moments drive in-store visits from high-intent members." delay={0.3} />
          <SignalCard icon={<Heart className="w-5 h-5" />} label="Brand alignment" sub="Placed inside the same system as YETI, Hotel Van Zandt, and Rivian." delay={0.4} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Measurable engagement" sub="Every class RSVP, perk redemption, and event attendance tracked." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="How this plays out." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Run Club" title="Saturday morning ownership" detail="lululemon-branded run club appears in the member feed every Friday afternoon. 6am Saturday departure from The Waterline lobby. Members RSVP. Brand shows up in the most authentic moment possible." delay={0} />
          <UseCaseCard tag="In-Store" title="Member preview window" detail="New arrivals preview is live for Downtown Perks members 24 hours before general public. QR at the door unlocks member pricing." delay={0.1} />
          <UseCaseCard tag="Studio" title="Rooftop yoga co-activation" detail="Ambassador-led yoga at The Waterline rooftop. 8am Sunday. Members-only RSVP. Product gifting at close. Brand in the resident's home environment." delay={0.2} />
          <UseCaseCard tag="Seasonal" title="Fall run series launch" detail="3-week downtown run series tied to a new product drop. Each run event surfaced in the member feed. QR at finish line unlocks gear discount." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="The numbers.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="3,400+" label="Fitness-active members" sub="Downtown residents already in the lululemon demo" delay={0} />
          <SignalCard value="44%" label="Event RSVP rate" sub="For fitness events in the member feed" delay={0.1} />
          <SignalCard value="Weekly" label="Run club distribution" sub="Automatic, no paid media required" delay={0.2} />
          <SignalCard value="0.3mi" label="Average walk" sub="From residential buildings to nearest retail" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="lululemon belongs in every morning run."
        sub="Map placement, event distribution, and class credits — all connected."
        ctaLabel="Build the Partnership"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}