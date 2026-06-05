import { CalendarDays, Glasses, MapPin, Sparkles, Ticket, Users } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.fineEyewear}
    eyebrow="Retail Campaign"
    title="Independent eyewear, nearby"
    body="A campaign image gives downtown residents a reason to discover, save, book, and revisit."
  />
);

export default function FineEyewear() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Retail Partner · Local Favorite"
        headline={<>See downtown<br /><span className="text-primary">differently.</span></>}
        support="Independent eyewear. Personal service. A local favorite worth discovering."
        ctaLabel="Create a Retail Campaign"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Become part of someone's routine.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SignalCard icon={<Sparkles className="w-5 h-5" />} label="New arrivals" sub="Feature frames and seasonal collections to nearby residents." delay={0} />
          <SignalCard icon={<Ticket className="w-5 h-5" />} label="Local perks" sub="Give people a reason to save, visit, and come back." delay={0.1} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Events nearby" sub="Trunk shows and styling appointments can be promoted locally." delay={0.2} />
          <SignalCard icon={<Glasses className="w-5 h-5" />} label="Book an appointment" sub="Make personal service the natural next step." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Campaign moments for repeat local visits." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Campaign poster" desc="Use Fine Eyewear campaign imagery in nearby buildings, partner emails, and the local guide." delay={0} />
          <FlowCard step="02" title="Save a local favorite" desc="Residents can save the shop when they need frames, repairs, gifts, or a styling appointment." delay={0.1} />
          <FlowCard step="03" title="Visit or book" desc="Clear next steps turn local awareness into an appointment or store visit." delay={0.2} />
          <FlowCard step="04" title="Come back" desc="Offers, new arrivals, and events help the relationship continue after the first visit." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="Retail visibility that feels useful.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Routine" title="A nearby errand with taste" detail="Residents see an independent eyewear shop close enough to visit during lunch or after work." delay={0} />
          <UseCaseCard tag="Appointment" title="Book personal service" detail="The campaign can guide people toward a fitting, consultation, or repair visit." delay={0.1} />
          <UseCaseCard tag="Event" title="Trunk shows and new arrivals" detail="Limited-time moments give people a reason to stop by this week." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Help nearby residents discover, save, and revisit Fine Eyewear."
        sub="Campaign imagery, local perks, appointments, events, and a clear path back."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
