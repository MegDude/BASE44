import { motion } from "framer-motion";
import { MapPin, Zap, BarChart3, Star, Clock, Music, TrendingUp } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
    <div className="p-5 border-b border-border/40">
      <div className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.14em] mb-1">Local Venue</div>
      <div className="font-heading font-semibold text-lg text-foreground">Stay Put</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">Local bar + downtown hangout</div>
      <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
        See what's happening now — drinks, events, live moments, and what's nearby.
      </p>
      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-medium">
        <Zap className="w-3 h-3" /> View Tonight's Lineup
      </div>
    </div>
    <NotificationDemoPanel
      items={[
        { title: "Happy hour live now", sub: "House cocktails until 6:30pm" },
        { title: "DJ set tonight · 9pm", sub: "Walk in or save for later" },
        { title: "Trivia night Thursday", sub: "Starts at 7pm · team sign-up open" },
        { title: "Pre-show stop nearby", sub: "A good place to start the night" },
      ]}
    />
  </div>
);

export default function TheStayPut() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Local Venue Partner · Real-Time Downtown Discovery"
        headline={<>Be the place people choose<br /><span className="text-primary">when they're already nearby.</span></>}
        support="Downtown Perks helps Stay Put show up at the right moment — when someone downtown is deciding on drinks, music, dinner, or where to go next. Timed visibility, live programming, event tie-ins, and measurable actions all work together in one local layer."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      {/* Why it fits */}
      <BrandSection label="Why It Fits" title="Great venues don't need more noise. They need better timing.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              People are already downtown making decisions in real time. Where to meet. Where to grab a drink. Where to go before the show. Where to keep the night going.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks helps Stay Put show up in those moments with the right context, the right timing, and the right reason to choose it. That creates stronger local discovery, better-timed traffic, and a clearer line between visibility and real visits.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: MapPin, label: "Real-time discovery", desc: "Stay Put appears when people nearby are actively deciding where to go next." },
              { icon: Clock, label: "Timed traffic moments", desc: "Happy hour, pre-event, post-event, and late-night moments can surface automatically." },
              { icon: Star, label: "Curated local visibility", desc: "The venue appears inside a high-intent downtown layer, not buried in generic search clutter." },
              { icon: BarChart3, label: "Measurable proof", desc: "Views, saves, RSVPs, offer opens, and redemptions create a clear proof layer." },
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
      <BrandSection label="How It Works" title="From discovery to arrival — connected in one downtown flow." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Stay Put goes live" desc="The venue is added to the downtown map with profile, programming, offers, and real-time venue details." delay={0} />
          <FlowCard step="02" title="Someone nearby is choosing" desc="Someone downtown opens the map while deciding where to go — after work, before a show, later in the night." delay={0.1} />
          <FlowCard step="03" title="Stay Put surfaces" desc="The venue appears based on proximity, timing, category, and what is happening nearby." delay={0.2} />
          <FlowCard step="04" title="Timed moment is shown" desc="Happy hour, tonight's set, trivia night, or a live reason to visit appears when it matters most." delay={0.3} />
          <FlowCard step="05" title="Person takes action" desc="They save it, tap in, RSVP, or head there directly from the map." delay={0.4} />
          <FlowCard step="06" title="You see what worked" desc="Downtown Perks shows the actions that matter: views, saves, and redemptions from people actually downtown." delay={0.5} />
        </div>
      </BrandSection>

      {/* Value */}
      <BrandSection label="Value" title="What Stay Put gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Stronger downtown visibility" sub="Stay Put shows up inside real local decision-making, not just passive browsing." delay={0} />
          <SignalCard icon={<Clock className="w-5 h-5" />} label="Better-timed traffic" sub="Offers and programming appear when people are most likely to act." delay={0.1} />
          <SignalCard icon={<Music className="w-5 h-5" />} label="Event adjacency" sub="Nearby events can naturally feed pre- and post-event traffic into the venue." delay={0.2} />
          <SignalCard icon={<BarChart3 className="w-5 h-5" />} label="Clearer proof" sub="The team can see what people viewed, saved, tapped, and redeemed." delay={0.3} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="More repeat discovery" sub="Stay Put stays part of the downtown rhythm, not just a one-time find." delay={0.4} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Lightweight setup" sub="No heavy systems, no operational burden, no complicated onboarding." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use Cases */}
      <BrandSection label="Use Cases" title="When it works best." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Happy Hour" title="After-work decision moment" detail="Someone nearby opens the map at 5:12pm looking for drinks within walking distance. Stay Put appears with a live happy hour offer and gets the visit." delay={0} />
          <UseCaseCard tag="Pre-Event" title="Before the crowd moves" detail="A person heading to a concert or district event sees Stay Put as a nearby pre-show stop with a timely reason to go now." delay={0.1} />
          <UseCaseCard tag="Programming" title="Recurring nights that stay visible" detail="Trivia, live music, DJ nights, themed events, and social programming surface directly in the downtown feed." delay={0.2} />
          <UseCaseCard tag="Late Night" title="Where to go next" detail="After dinner or another stop, someone nearby sees Stay Put in the right moment — one more place worth visiting." delay={0.3} />
          <UseCaseCard tag="Repeat Traffic" title="Saved and revisited" detail="A person saves the venue one week and returns through the same downtown layer later, building a regular habit." delay={0.4} />
        </div>
      </BrandSection>

      {/* Proof */}
      <BrandSection label="Proof" title="Numbers that matter to venue partners.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="38%" label="Offer view rate" sub="Among people who opened the venue profile" delay={0} />
          <SignalCard value="22%" label="Save or tap-through rate" sub="From nearby discovery moments" delay={0.1} />
          <SignalCard value="2.1×" label="Higher engagement" sub="During event-linked windows vs. non-programmed blocks" delay={0.2} />
          <SignalCard value="0" label="Extra platforms" sub="Lightweight setup inside the Downtown Perks layer" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give people a reason to choose Stay Put right now."
        sub="One downtown map. Better timing. Real local visibility. A clearer path from nearby interest to actual visits."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
