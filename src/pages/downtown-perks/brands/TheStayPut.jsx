import { motion } from "framer-motion";
import { MapPin, Users, Zap, Star, QrCode, CalendarDays, Heart, Coffee, Navigation } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { QRDemoPanel, NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <QRDemoPanel
      headline="Welcome to Austin."
      sub="Scan to unlock your guest neighborhood guide — dining, fitness, events, and member perks, all within walking distance of The Stay Put."
      action="Activate Guest Pass"
    />
    <NotificationDemoPanel
      items={[
        { title: "Rooftop yoga — tomorrow 7am", sub: "0.2 miles · Free for guests" },
        { title: "Dinner reservation available", sub: "Fabi & Rosi · Tonight 8pm · Guest rate" },
        { title: "Run club departs at 6am Saturday", sub: "Hotel lobby · 3.2 mile route" },
      ]}
    />
  </div>
);

export default function TheStayPut() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Boutique Hotel · Austin Experience Layer"
        headline={<>Guests don't want a concierge.<br /><span className="text-primary">They want a live neighborhood.</span></>}
        support="The Stay Put becomes a local guide the moment guests check in — delivering curated discovery, timed offers, and event access without any friction."
        ctaLabel="Build the Guest Experience"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/6"
      />

      {/* Why they fit */}
      <BrandSection label="The Fit" title="Great hotels amplify great neighborhoods.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Guests choose The Stay Put because of Austin. Not just the room. They want to move through the city with confidence — to discover the right dinner, the right morning workout, the right moment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks gives The Stay Put a live local layer. Curated, proximity-aware, and continuously updated — so every guest feels like a local from the moment they arrive.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Navigation, label: "Frictionless local discovery", desc: "Guests get the neighborhood guide at check-in via a single QR scan." },
              { icon: Coffee, label: "Morning-to-night itinerary", desc: "Fitness at 6am, coffee at 8am, dinner at 8pm — all surfaced automatically." },
              { icon: Heart, label: "Curated, not crowdsourced", desc: "No Yelp star ratings. Just places that belong in the Downtown Perks system." },
              { icon: Star, label: "Exclusive guest perks", desc: "Partner venues offer stay-guest-only rates and experiences." },
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
                  <div className="font-semibold text-sm mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      {/* How they show up */}
      <BrandSection label="Guest Journey" title="From check-in to checkout — connected." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="QR at check-in" desc="A single QR on the room key, lobby card, or welcome booklet. Guests activate a neighborhood guide in under 30 seconds." delay={0} />
          <FlowCard step="02" title="Curated local list" desc="Guests see a tight, walking-distance set of recommendations — dining, wellness, fitness, nightlife — all vetted and live." delay={0.1} />
          <FlowCard step="03" title="Timed offers surface automatically" desc="Morning wellness, afternoon dining, evening social — perks appear at the right moment without the guest searching." delay={0.2} />
          <FlowCard step="04" title="Event access" desc="Guests see upcoming district events — run clubs, live music, pop-ups — and can RSVP directly from their guide." delay={0.3} />
          <FlowCard step="05" title="Partner venue tie-ins" desc="The Stay Put's recommended dining and wellness partners are pinned on the map with guest-specific rates." delay={0.4} />
          <FlowCard step="06" title="Mobile follow-up" desc="Guests who opt in receive a curated itinerary for the next 24 hours — delivered the morning after check-in." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What The Stay Put gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Heart className="w-5 h-5" />} label="Guest satisfaction" sub="Guests who discover the neighborhood leave better reviews." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Local credibility" sub="The Stay Put is seen as a neighborhood insider, not a transient stop." delay={0.1} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Zero-friction onboarding" sub="No app download. No registration form. Just a scan." delay={0.2} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Event awareness" sub="Guests discover and attend local events — boosting their experience and district engagement." delay={0.3} />
          <SignalCard icon={<Star className="w-5 h-5" />} label="Review quality" sub="Guests who feel well-connected to Austin leave higher-quality reviews." delay={0.4} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Return signal" sub="Guests who had a rich local experience are more likely to rebook." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Use Cases" title="What the guest experience looks like." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Arrival" title="Check-in neighborhood guide" detail="Room key includes a QR. Guest scans. Instantly sees top 8 curated spots within walking distance, plus what's happening this week." delay={0} />
          <UseCaseCard tag="Morning" title="Fitness and coffee flow" detail="6am: run club direction via the map. 7:30am: cold brew offer at a nearby café goes live. Guest moves through Austin like a local." delay={0.1} />
          <UseCaseCard tag="Dining" title="Reservation-linked offer" detail="The Stay Put guest rate at partner restaurants appears in the guide. Guest books. Venue gets a high-intent, warm referral." delay={0.2} />
          <UseCaseCard tag="Events" title="District event discovery" detail="Guest sees a live music event Saturday night 4 blocks away. RSVPs through the guide. Shows up. Tells three friends about Austin." delay={0.3} />
          <UseCaseCard tag="Checkout" title="Local keepsake list" detail="At checkout, the guide optionally emails the guest their saved spots — turning The Stay Put into a lasting memory anchor." detail="At checkout, the guide optionally emails the guest their saved spots — turning The Stay Put into a lasting memory anchor." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Proof" title="Numbers that hospitality teams care about.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="61%" label="Guide activation" sub="Guests who scan on day of arrival" delay={0} />
          <SignalCard value="4.1★" label="Review quality lift" sub="Among guests who used the neighborhood guide" delay={0.1} />
          <SignalCard value="2.4×" label="Event attendance" sub="vs. guests without a curated local layer" delay={0.2} />
          <SignalCard value="0" label="Concierge effort" sub="The guide runs automatically — no staff overhead" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give your guests a neighborhood, not just a room."
        sub="A single QR. A live local guide. A better Austin experience."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}