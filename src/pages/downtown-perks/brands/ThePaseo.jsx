import { CalendarDays, Dumbbell, Utensils } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, StackedCampaignImages, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <StackedCampaignImages
    items={[
      {
        image: campaignImages.mapUi,
        eyebrow: "Map UI",
        title: "Walkable from home",
        body: "Residents can see local events, restaurants, fitness, and essentials close to The Paseo.",
      },
      {
        image: { src: "/images/map-entities/properties/amli-downtown.jpeg", fallback: "/images/properties/amli-downtown-pool.jpg" },
        eyebrow: "Property context",
        title: "Living nearby, made visible",
        body: "The neighborhood supports the property story during tours, move-in, and daily life.",
      },
    ]}
  />
);

export default function ThePaseo() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Residential Property · Downtown Austin"
        headline={<>Live near<br /><span className="text-primary">what matters.</span></>}
        support="Discover local events, restaurants, fitness, and everyday essentials within walking distance."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Turn walkability into something residents can actually use.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Utensils className="w-5 h-5" />} label="Restaurants nearby" sub="Residents can find places for dinner, coffee, and quick everyday stops." delay={0} />
          <SignalCard icon={<Dumbbell className="w-5 h-5" />} label="Fitness and wellness" sub="Studios, classes, trails, and healthy routines stay easy to find." delay={0.1} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Events worth joining" sub="Local happenings give residents more reasons to participate downtown." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Where The Paseo uses the neighborhood story." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Leasing tours" desc="Prospects can see the restaurants, fitness, events, and essentials around the property." delay={0} />
          <FlowCard step="02" title="Move-in welcome" desc="New residents get a practical guide to what is nearby from day one." delay={0.1} />
          <FlowCard step="03" title="Elevator and lobby prompts" desc="QR placements make the nearby guide part of daily routines." delay={0.2} />
          <FlowCard step="04" title="Resident reporting" desc="Teams can see what residents saved, RSVP'd to, visited, and came back for." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="The living-nearby story, made concrete.">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:items-center">
          <CampaignImagePanel
            image={campaignImages.mapUi}
            eyebrow="Discovery / Lifestyle"
            title="Nearby choices in one place"
            body="Local events, restaurants, fitness, errands, and resident offers are organized around home."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <UseCaseCard tag="Daily Life" title="Walkable essentials" detail="Residents can find coffee, groceries, salons, fitness, and useful stops without scrolling generic listings." delay={0} />
            <UseCaseCard tag="Events" title="A reason to head out" detail="Neighborhood events and happy hours make the area feel active and easy to join." delay={0.1} />
            <UseCaseCard tag="Leasing" title="The neighborhood sells itself" detail="A tour can show what living nearby actually feels like." delay={0.2} />
            <UseCaseCard tag="Retention" title="More reasons to stay" detail="Residents who use the neighborhood more often feel more connected to the property." delay={0.3} />
          </div>
        </div>
      </BrandSection>

      <BrandCTA
        headline="Make The Paseo's location feel alive."
        sub="A resident guide for what is nearby, useful, and happening within walking distance."
        ctaLabel="Talk to the Team"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
