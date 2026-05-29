import { motion } from "framer-motion";
import { MapPin, QrCode, Users, Star, Heart, CalendarDays, Zap, Coffee } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
    <div className="p-5 border-b border-border/40">
      <div className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.14em] mb-1">Hospitality Partner</div>
      <div className="font-heading font-semibold text-lg text-foreground">Welcome to downtown Austin.</div>
      <div className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Your nearby guide is ready.</div>
      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-medium">
        <Zap className="w-3 h-3" /> Open Guest Guide
      </div>
    </div>
    <NotificationDemoPanel
      items={[
        { title: "Coffee within a short walk", sub: "Opens at 7am · 0.2 miles" },
        { title: "Dinner spots for tonight", sub: "Fabi & Rosi · Available at 8pm" },
        { title: "Fitness tomorrow morning", sub: "Rooftop yoga · 7am · 0.3 miles" },
        { title: "Live music nearby this weekend", sub: "District event · Friday night" },
      ]}
    />
  </div>
);

export default function HotelVanZandt() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Hospitality Partner · Guest Experience Layer"
        headline={<>Give guests a better way to<br /><span className="text-primary">experience downtown the moment they arrive.</span></>}
        support="Downtown Perks gives Hotel Van Zandt a live neighborhood layer guests can access instantly. Dining, wellness, events, and local perks appear in one curated downtown guide, helping guests move through Austin with more confidence and less friction."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      {/* Why it fits */}
      <BrandSection label="Why It Fits" title="Great hotels do more than provide a room. They help people feel connected to where they are.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Hotel Van Zandt already sits inside one of the most active parts of downtown. Downtown Perks turns that advantage into something guests can actually use — a live, curated neighborhood layer that helps them find the right dinner, the right event, the right morning plan, and the right local moment without extra effort.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The result is a stronger guest experience, better neighborhood discovery, and a more memorable stay.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: QrCode, label: "Frictionless guest access", desc: "Guests can open their neighborhood guide instantly with a simple QR flow — no app download, no registration." },
              { icon: MapPin, label: "Curated local discovery", desc: "Dining, fitness, events, and nearby perks are easy to find in one downtown map." },
              { icon: Heart, label: "Better guest experience", desc: "Guests feel more connected to Austin from the start of their stay." },
              { icon: Users, label: "No staff burden", desc: "The experience runs automatically without creating extra operational work." },
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
      <BrandSection label="How It Works" title="From check-in to checkout — connected in one simple flow." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Guest receives access" desc="A QR is placed in-room, at check-in, or in welcome materials — one touchpoint, instant access." delay={0} />
          <FlowCard step="02" title="Guest opens the guide" desc="No app download. No complex setup. Just a simple mobile experience that works immediately." delay={0.1} />
          <FlowCard step="03" title="Curated neighborhood appears" desc="Dining, wellness, events, and local perks are shown within walking distance of the hotel." delay={0.2} />
          <FlowCard step="04" title="Timed moments surface" desc="Morning, afternoon, and evening recommendations appear when they're most relevant to the stay." delay={0.3} />
          <FlowCard step="05" title="Guest takes action" desc="They save places, visit venues, and discover downtown with less friction and more confidence." delay={0.4} />
          <FlowCard step="06" title="Experience value is reinforced" desc="Hotel Van Zandt becomes associated with a more connected, locally grounded Austin experience." delay={0.5} />
        </div>
      </BrandSection>

      {/* Value */}
      <BrandSection label="Value" title="What Hotel Van Zandt gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="Better guest satisfaction" sub="Guests who explore the neighborhood leave stronger reviews and more complete impressions." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Stronger neighborhood credibility" sub="Hotel Van Zandt is seen as a genuine part of Austin, not just a place to sleep." delay={0.1} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Low-friction activation" sub="One QR. One tap. The entire neighborhood becomes accessible to every guest." delay={0.2} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Improved event and local discovery" sub="Guests find and attend district events they would otherwise miss entirely." delay={0.3} />
          <SignalCard icon={<Coffee className="w-5 h-5" />} label="A more connected stay" sub="Mornings, evenings, and in-between moments all feel more useful and local." delay={0.4} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="No added app fatigue" sub="Guests use the guide without downloading anything new or learning a new system." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use Cases */}
      <BrandSection label="Use Cases" title="What the guest experience looks like." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Arrival" title="Neighborhood guide at check-in" detail="A guest arrives and scans a QR to instantly see curated nearby dining, wellness, and events without asking the front desk anything." delay={0} />
          <UseCaseCard tag="Morning" title="Fitness and coffee, easy to find" detail="Walkable morning plans — coffee, movement, and wellness options — surface automatically so guests start the day without guesswork." delay={0.1} />
          <UseCaseCard tag="Dining" title="Dinner is easy to decide" detail="Curated nearby restaurants appear with context and direct access. Guests feel like locals making a confident choice, not tourists searching Yelp." delay={0.2} />
          <UseCaseCard tag="Events" title="Local moments become easy to reach" detail="A guest sees a live music event Saturday night nearby. They RSVP and go. The hotel is associated with that experience." delay={0.3} />
          <UseCaseCard tag="Checkout" title="The stay stays with them" detail="Guests leave with saved spots and a stronger sense of place. Hotel Van Zandt becomes a memory anchor for their Austin experience." delay={0.4} />
        </div>
      </BrandSection>

      {/* Proof */}
      <BrandSection label="Proof" title="Numbers that matter.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="61%" label="Guide activation" sub="Among guests who received access on arrival" delay={0} />
          <SignalCard value="4.1★" label="Review quality lift" sub="Among guests who used the neighborhood guide" delay={0.1} />
          <SignalCard value="2.4×" label="Local event attendance" sub="vs. guests without a curated nearby layer" delay={0.2} />
          <SignalCard value="0" label="Extra staff effort" sub="The guide runs automatically with no operational overhead" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give guests a neighborhood, not just a room."
        sub="A single QR. A live local guide. A more connected downtown Austin stay."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
