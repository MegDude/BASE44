import { MapPin, ScanLine, TrendingUp, Utensils } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";

export default function InKind() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Dining Value Layer · Restaurant Partnerships"
        headline={<>inKind handles the value.<br /><span className="text-primary">Downtown Perks creates the visit.</span></>}
        support="A partner layer for restaurants that want dining benefits to appear when people are already choosing where to go: dinner nearby, happy hour after work, hotel guests, date nights, and saved local plans."
        ctaLabel="Build an inKind Layer"
        ctaHref="mailto:partners@downtownperks.com"
      />

      <BrandSection label="The Fit" title="Two moments, one cleaner dining journey.">
        <div className="dp-editorial-stack">
          <p className="dp-editorial-meaning">
            inKind is strongest when the dining benefit becomes active. Downtown Perks is strongest earlier, when someone is still deciding what is nearby, worth saving, and easy to reach.
          </p>
          <p className="dp-editorial-meaning">
            Together, the experience stays simple: Downtown Perks helps residents discover and save the restaurant, then routes the active dining value through inKind when the plan turns into a real visit.
          </p>
        </div>
      </BrandSection>

      <BrandSection label="How It Works" title="How inKind works with Downtown Perks.">
        <div className="dp-editorial-flow">
          <FlowCard step="01" title="The restaurant appears in context" desc="The venue is pinned on the map with dining category, nearby buildings, hotels, events, and resident search terms." />
          <FlowCard step="02" title="The resident opens the panel" desc="The drawer explains why to go, what benefit may apply, and when to check the active offer." delay={0.1} />
          <FlowCard step="03" title="The benefit opens through inKind" desc="When the resident is ready, the action routes to the inKind benefit, menu, or payment-linked flow." delay={0.2} />
          <FlowCard step="04" title="The partner sees useful signals" desc="Restaurants can review views, saves, direction taps, benefit opens, and nearby dining intent." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Applied Panels" title="What every inKind restaurant panel includes.">
        <div className="dp-editorial-grid">
          <UseCaseCard tag="Resident" title="How to use it" detail="Save the restaurant, check the current inKind benefit, and redeem when the active window fits the plan." />
          <UseCaseCard tag="Partner" title="Why it matters" detail="Downtown Perks creates the visit intent before the transaction happens, then routes the value to inKind." delay={0.1} />
          <UseCaseCard tag="Map" title="Where it appears" detail="inKind restaurants show in dining, perks, nearby recommendations, saved places, and Ask the Map prompts." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Best Fits" title="Where inKind performs well downtown.">
        <div className="dp-editorial-grid">
          <SignalCard icon={<Utensils className="h-5 w-5" />} label="Dinner nearby" sub="Residents deciding between walkable restaurants." />
          <SignalCard icon={<MapPin className="h-5 w-5" />} label="Hotel guests" sub="Visitors looking for a polished local dining move." delay={0.1} />
          <SignalCard icon={<ScanLine className="h-5 w-5" />} label="Happy hour" sub="Time-sensitive benefits tied to nearby plans." delay={0.2} />
          <SignalCard icon={<TrendingUp className="h-5 w-5" />} label="Return intent" sub="Saved restaurants and repeat visits around useful offers." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Layer" title="What gets tracked without making the page feel like an ad.">
        <div className="dp-editorial-flow">
          <FlowCard step="A" title="Map opens" desc="How often the restaurant is opened from search, nearby rails, or Ask the Map." />
          <FlowCard step="B" title="Saves and directions" desc="Quiet signals that someone is comparing, planning, or heading there soon." delay={0.1} />
          <FlowCard step="C" title="Benefit opens" desc="How often people move from discovery into the active inKind value flow." delay={0.2} />
          <FlowCard step="D" title="Nearby dining patterns" desc="Which buildings, hotels, events, and districts are creating useful demand." delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Turn inKind value into a reason to go."
        sub="Downtown Perks helps restaurants show up before the check exists: when people are choosing, saving, asking, and walking nearby."
        ctaLabel="Build the inKind Layer"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
