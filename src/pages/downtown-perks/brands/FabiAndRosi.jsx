import { motion } from "framer-motion";
import { MapPin, Zap, TrendingUp, Utensils, Heart, CalendarDays } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <NotificationDemoPanel
      items={[
        { title: "Fabi & Rosi — table available at 8pm", sub: "0.5 miles · Tonight · Member rate active" },
        { title: "Sunday brunch: member seating priority", sub: "11am–2pm · Complimentary first course" },
        { title: "New menu — tasting event this Thursday", sub: "Members-only preview · 12 seats" },
      ]}
    />
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">Resident Dining Card</div>
      <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 mb-4">
        <div className="font-heading text-lg font-bold mb-1">Fabi & Rosi</div>
        <div className="text-xs text-muted-foreground mb-3">Neighborhood table — Downtown Austin</div>
        <div className="text-[13px] text-foreground font-medium">Members: complimentary first course on weeknights</div>
      </div>
      <div className="text-xs text-muted-foreground">Perk active for Downtown Perks members · Valid through end of month</div>
    </div>
  </div>
);

export default function FabiAndRosi() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Local Dining · Neighborhood Table · Austin"
        headline={<>Every great neighborhood<br /><span className="text-primary">has its restaurant.</span></>}
        support="Fabi & Rosi becomes the go-to resident dining destination — through timed offers, priority seating, member-exclusive moments, and a consistent presence on every resident's map."
        ctaLabel="Connect With Residents"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/6"
      />

      <BrandSection label="The Fit" title="Proximity dining is a relationship business.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Fabi & Rosi is the kind of restaurant that earns regulars. Downtown residents who live within walking distance are the highest-value customers in the city — they come back, they bring people, and they talk.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks is the layer that converts proximity into habit. Fabi & Rosi appears at the right moment — Sunday morning brunch inspiration, a Tuesday evening offer, a tasting event invite — and earns its place as the neighborhood table.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Walk-in regulars", desc: "Downtown residents don't need Uber — they need a reason. Fabi & Rosi becomes that reason." },
              { label: "Timed offer precision", desc: "Brunch offers go live Sunday morning. Dinner offers surface at 5pm. Always in context." },
              { label: "Exclusive member moments", desc: "Tasting dinners, new menu previews, and chef's table experiences — members-only." },
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

      <BrandSection label="Activation" title="How Fabi & Rosi shows up." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Map placement" desc="Fabi & Rosi pinned on the downtown map. Featured in the dining category with member perk badge." delay={0} />
          <FlowCard step="02" title="Timed offer engine" desc="Offers surface at meal-relevant windows — Sunday brunch, weekday dinner, Friday happy hour." delay={0.1} />
          <FlowCard step="03" title="Priority seating for members" desc="Members get a reservation window before the general public for popular nights and events." delay={0.2} />
          <FlowCard step="04" title="Tasting and event distribution" desc="New menu previews and chef's table evenings distributed exclusively to Downtown Perks members." delay={0.3} />
          <FlowCard step="05" title="Building tie-ins" desc="Fabi & Rosi appears as a featured dining recommendation in the resident feeds of nearby buildings." delay={0.4} />
          <FlowCard step="06" title="Perk redemption tracking" desc="Every member visit and perk use tracked. Fabi & Rosi sees which buildings drive the most traffic." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What Fabi & Rosi gains.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Utensils className="w-5 h-5" />} label="Regular-building pipeline" sub="Nearby residents become the highest-LTV customers in the dining business." delay={0} />
          <SignalCard icon={<Heart className="w-5 h-5" />} label="Local trust signal" sub="Endorsed inside the resident community layer — not an ad." delay={0.1} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Event reach" sub="Tasting events and private dinners distributed to qualified, local audiences." delay={0.2} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Always-on discovery" sub="Residents see Fabi & Rosi every time they open the map — before they've decided where to go." delay={0.3} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Measurable traffic" sub="Perk redemptions tied to building of origin and visit frequency." delay={0.4} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Timed relevance" sub="Brunch perks at 10am. Dinner offers at 5pm. Right offer, right moment." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="How this becomes habit." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Regulars" title="The neighborhood table perk" detail="Members receive a standing weeknight perk — complimentary first course. Enough to choose Fabi & Rosi over a delivery app on a quiet Tuesday." delay={0} />
          <UseCaseCard tag="Brunch" title="Sunday priority seating" detail="Friday afternoon: members see Sunday brunch seating open for priority booking. Most popular times go to members first." delay={0.1} />
          <UseCaseCard tag="Events" title="New menu tasting — members only" detail="Chef launches a seasonal menu. 12-seat preview dinner, invitation-only for Downtown Perks members. Sells out. Creates a story." delay={0.2} />
          <UseCaseCard tag="Discovery" title="Move-in recommendation" detail="New residents at The Waterline receive Fabi & Rosi as a featured neighborhood dining recommendation on day one — with a first-visit perk." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="What proximity dining data shows.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="3.1×" label="Repeat visit rate" sub="Members who use a perk return within 30 days" delay={0} />
          <SignalCard value="0.5mi" label="Walk distance" sub="Average distance from partner buildings" delay={0.1} />
          <SignalCard value="5pm" label="Peak discovery" sub="When dinner perks surface to members in the feed" delay={0.2} />
          <SignalCard value="0" label="Commission" sub="No platform fee. No delivery cut. Direct to the table." delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Fabi & Rosi is the neighborhood table. Let's make it feel that way."
        sub="Map placement, timed offers, and event distribution — connected."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}