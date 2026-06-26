import { CreditCard, MapPin, ScanLine, Store, TrendingUp, Utensils } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";

const demoPanel = (
  <div className="space-y-4">
    <figure className="overflow-hidden rounded-lg border border-[#C8A96A]/20 bg-white">
      <img
        src="/images/partner/drop-in-images/inkind-table-spread.jpg"
        alt=""
        className="h-64 w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </figure>
    <div className="rounded-lg border border-[#C8A96A]/20 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Map moment</p>
      <h3 className="mt-2 text-[18px] font-medium text-[#0B1F33]">Dinner value, shown when dinner is the plan.</h3>
      <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/65">
        Residents find a nearby restaurant in Downtown Perks, save the place, then open the inKind benefit when they are ready to dine.
      </p>
    </div>
  </div>
);

export default function InKind() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Dining Value Layer · Restaurant Partnerships"
        headline={<>inKind handles the value.<br /><span className="text-primary">Downtown Perks creates the visit.</span></>}
        support="A partner layer for restaurants that want inKind dining benefits to show up inside real downtown decisions: dinner nearby, happy hour after work, date night, hotel guests, and saved local plans."
        ctaLabel="Build an inKind Layer"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demoPanel}
      />

      <BrandSection label="The Fit" title="Downtown Perks and inKind work at different moments.">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.7fr)]">
          <div className="space-y-5">
            <p className="text-[15px] leading-7 text-muted-foreground">
              inKind is strongest around payment-linked dining value. Downtown Perks is strongest before that moment, when someone is choosing where to go.
            </p>
            <p className="text-[15px] leading-7 text-muted-foreground">
              Together, the flow is simple: Downtown Perks helps residents discover and save the restaurant, then inKind supports the active dining benefit when the check becomes real.
            </p>
          </div>
          <div className="space-y-3">
            <SignalCard icon={<MapPin className="h-5 w-5" />} label="Discovery first" sub="Restaurants appear in map search, nearby rails, filters, and recommendations." />
            <SignalCard icon={<CreditCard className="h-5 w-5" />} label="Value at the table" sub="inKind carries the payment-linked benefit where the restaurant offer is active." delay={0.1} />
          </div>
        </div>
      </BrandSection>

      <BrandSection label="How It Works" title="How inKind works with Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Restaurant appears in context" desc="The inKind venue is pinned inside Downtown Perks with dining category, nearby buildings, hotels, events, and resident search terms." />
          <FlowCard step="02" title="Resident saves or opens the place" desc="The panel explains why to go, what the applied benefit is, and when to check the active offer." delay={0.1} />
          <FlowCard step="03" title="Benefit opens through inKind" desc="When the resident is ready, the action routes to the inKind benefit or menu flow where the restaurant value is managed." delay={0.2} />
          <FlowCard step="04" title="Partner sees useful signals" desc="Restaurants can review views, saves, direction taps, benefit opens, and nearby intent around each location." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Applied Panels" title="What every inKind restaurant panel includes.">
        <div className="grid gap-4 md:grid-cols-3">
          <UseCaseCard tag="Resident" title="How to use it" detail="Save the restaurant, check the current inKind benefit, and redeem when the active window fits the plan." />
          <UseCaseCard tag="Partner" title="Why it matters" detail="Downtown Perks creates the visit intent before the transaction happens, then routes the value to inKind." delay={0.1} />
          <UseCaseCard tag="Map" title="Where it appears" detail="inKind restaurants show in dining, perks, nearby recommendations, saved places, and Ask the Map prompts." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Best Fits" title="Where inKind performs well downtown." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SignalCard icon={<Utensils className="h-5 w-5" />} label="Dinner nearby" sub="Residents deciding between walkable restaurants." />
          <SignalCard icon={<Store className="h-5 w-5" />} label="Hotel guests" sub="Visitors looking for a polished local dining move." delay={0.1} />
          <SignalCard icon={<ScanLine className="h-5 w-5" />} label="Happy hour" sub="Time-sensitive benefits tied to nearby plans." delay={0.2} />
          <SignalCard icon={<TrendingUp className="h-5 w-5" />} label="Repeat intent" sub="Saved restaurants and return visits around useful offers." delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Turn inKind value into a downtown reason to go."
        sub="Downtown Perks helps restaurants show up before the check exists: when people are choosing, saving, asking, and walking nearby."
        ctaLabel="Build the inKind Layer"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
