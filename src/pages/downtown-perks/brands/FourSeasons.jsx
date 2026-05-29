import { motion } from "framer-motion";
import { MapPin, QrCode, Star, Heart, Layers, Compass, Zap, CalendarDays } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
    <div className="p-5 border-b border-border/40">
      <div className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.14em] mb-1">Premium Guest Experience</div>
      <div className="font-heading font-semibold text-lg text-foreground">Downtown Austin Guide</div>
      <div className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
        Curated nearby experiences for today, tonight, and tomorrow morning.
      </div>
      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-medium">
        <Zap className="w-3 h-3" /> Open Guest Guide
      </div>
    </div>
    <NotificationDemoPanel
      items={[
        { title: "Dinner nearby tonight", sub: "Curated dining · 0.3 miles" },
        { title: "Wellness tomorrow morning", sub: "Movement + recovery options nearby" },
        { title: "Walkable local experiences", sub: "Culture, dining, and district moments" },
        { title: "Live music this weekend", sub: "Nearby district event · Saturday" },
      ]}
    />
  </div>
);

export default function FourSeasons() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Hospitality Partner · Premium Guest Experience Layer"
        headline={<>Help guests experience downtown<br /><span className="text-primary">with the same ease they expect from their stay.</span></>}
        support="Downtown Perks gives Four Seasons a live local layer that extends beyond the property. Guests can instantly access curated dining, wellness, events, and nearby experiences through one simple downtown guide — designed to feel effortless, useful, and aligned with the quality of the stay itself."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      {/* Why it fits */}
      <BrandSection label="Why It Fits" title="A great stay doesn't stop at the property line.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Guests want to experience the city around them with the same confidence and ease they feel inside the hotel itself. Downtown Perks helps Four Seasons deliver that by extending the stay into a curated downtown layer — one that makes local dining, wellness, events, and nearby moments easier to discover and easier to act on.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The result is a guest experience that feels more connected, more considered, and more complete.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Compass, label: "Seamless neighborhood access", desc: "Guests move from hotel to downtown discovery without friction or extra effort." },
              { icon: Layers, label: "Curated local quality", desc: "Only relevant, useful nearby places and experiences are surfaced — nothing generic." },
              { icon: Star, label: "Elevated guest experience", desc: "The city feels easier to navigate and more rewarding to explore throughout the stay." },
              { icon: Heart, label: "Quiet operational fit", desc: "The system adds meaningful guest value without adding staff complexity." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-[13px] mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      {/* How it works */}
      <BrandSection label="How It Works" title="A simple layer that extends the stay into the city around it." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Guest receives access" desc="A QR touchpoint introduces the guide during arrival or in-room — quiet and simple." delay={0} />
          <FlowCard step="02" title="Guest opens the experience" desc="No separate app. No complicated onboarding. The guide works immediately and intuitively." delay={0.1} />
          <FlowCard step="03" title="Curated downtown options appear" desc="Dining, wellness, cultural moments, and local events surface nearby in a refined, useful format." delay={0.2} />
          <FlowCard step="04" title="Timed suggestions help guide the stay" desc="Recommendations shift naturally across morning, afternoon, and evening without requiring anything from the guest." delay={0.3} />
          <FlowCard step="05" title="Guest engages naturally" desc="They save places, make plans, and move through downtown more confidently for the rest of their stay." delay={0.4} />
          <FlowCard step="06" title="The stay feels more complete" desc="Four Seasons becomes associated with a more connected, better-navigated city experience." delay={0.5} />
        </div>
      </BrandSection>

      {/* Value */}
      <BrandSection label="Value" title="What Four Seasons gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="A more complete guest experience" sub="The stay extends naturally into the city, making every day feel more considered." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Better local extension" sub="The hotel's quality carries into the neighborhood experience around it." delay={0.1} />
          <SignalCard icon={<Layers className="w-5 h-5" />} label="Curated discovery without clutter" sub="Only useful, relevant moments surface — no generic noise." delay={0.2} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="A refined digital utility" sub="Clean, simple, and aligned with the quality guests already expect." delay={0.3} />
          <SignalCard icon={<Compass className="w-5 h-5" />} label="Low-friction rollout" sub="Easy to deploy, easy for guests to use, and light on operational overhead." delay={0.4} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="No heavy operational lift" sub="The system runs in the background with no staff workflow changes required." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use Cases */}
      <BrandSection label="Use Cases" title="What the experience looks like in practice." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Arrival" title="Immediate downtown orientation" detail="Guests receive access on arrival and open a curated guide to nearby dining, wellness, and events — before they've unpacked." delay={0} />
          <UseCaseCard tag="Dining" title="Confident restaurant decisions" detail="Curated nearby options are easy to explore and easy to act on. Guests feel settled and local rather than searching from scratch." delay={0.1} />
          <UseCaseCard tag="Wellness" title="Morning routines surface naturally" detail="Movement, recovery, and wellness options nearby appear at the right time — so morning plans form without friction." delay={0.2} />
          <UseCaseCard tag="Events" title="Local culture becomes accessible" detail="District events, live music, and cultural moments are easy to discover and attend — making the stay feel richer." delay={0.3} />
          <UseCaseCard tag="Memory" title="The city stays with them" detail="Guests leave with saved places and a stronger sense of Austin tied to the Four Seasons experience." delay={0.4} />
        </div>
      </BrandSection>

      {/* Proof */}
      <BrandSection label="Proof" title="Simple, credible numbers.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="58%" label="Guide activation" sub="Among guests who received access at arrival" delay={0} />
          <SignalCard value="4.0★" label="Review quality lift" sub="Among guests who used the downtown guide" delay={0.1} />
          <SignalCard value="2.1×" label="Local event engagement" sub="vs. guests without a curated nearby layer" delay={0.2} />
          <SignalCard value="0" label="Added staff burden" sub="Fully automated — no workflow changes required" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Extend the quality of the stay into the city around it."
        sub="A live local guide that helps guests discover downtown with more ease, more relevance, and less friction."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}