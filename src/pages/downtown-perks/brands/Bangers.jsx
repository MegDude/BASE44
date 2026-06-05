import { Beer, CalendarDays, Music, Ticket, Users, Utensils } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.bangersPoster}
    eyebrow="Campaign Poster"
    title="Events people can join"
    body="Live music, brunch, happy hour, and community gatherings become reasons to show up and stay longer."
  />
);

export default function Bangers() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Restaurant / Venue · Rainey Street"
        headline={<>Where downtown<br /><span className="text-primary">comes together.</span></>}
        support="Live music. Local events. Community gatherings. Good reasons to stay a little longer."
        ctaLabel="Put Banger's on Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Do not make people discover Banger's. Give them a reason to participate.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Music className="w-5 h-5" />} label="Live music" sub="Tonight's lineup and recurring music nights can be saved and shared." delay={0} />
          <SignalCard icon={<Beer className="w-5 h-5" />} label="Happy hour" sub="Timed offers give nearby people a practical reason to visit now." delay={0.1} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Community gatherings" sub="Brunch, watch parties, and special events invite people to come together." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Campaign moments that meet people while plans are forming." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Campaign poster" desc="A clear event poster gives people an immediate reason to RSVP, save, or visit." delay={0} />
          <FlowCard step="02" title="Nearby residents and hotel guests" desc="People already downtown see events and offers when they are choosing where to go." delay={0.1} />
          <FlowCard step="03" title="In-venue QR" desc="Guests can join Downtown Perks, save future events, and come back for recurring nights." delay={0.2} />
          <FlowCard step="04" title="What people responded to" desc="The team can see which events, offers, and time windows drove saves, RSVPs, and visits." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="The map supports the poster, not the other way around.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Live Music" title="Tonight's reason to go" detail="Someone nearby sees a music night, saves it, and heads over with friends." delay={0} />
          <UseCaseCard tag="Brunch" title="A weekend ritual" detail="Brunch offers and recurring events keep Banger's in people's weekly plans." delay={0.1} />
          <UseCaseCard tag="After Event" title="Stay a little longer" detail="People leaving nearby events see Banger's as a place to continue the night." delay={0.2} />
          <UseCaseCard tag="Local Perks" title="Offers that bring people back" detail="Perks can reward repeat visits without making the venue feel generic." delay={0.3} />
          <UseCaseCard tag="Groups" title="Gatherings with a clear next step" detail="RSVPs and saves help turn interest into actual participation." delay={0.4} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="What Banger's can learn." className="bg-card/30 border-y border-border">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Event saves" sub="Which events people planned around" delay={0} />
          <SignalCard icon={<Ticket className="w-5 h-5" />} label="RSVPs" sub="Which gatherings people joined" delay={0.1} />
          <SignalCard icon={<Utensils className="w-5 h-5" />} label="Visits" sub="When nearby people came in" delay={0.2} />
          <SignalCard value="Come back" label="Repeat moments" sub="Offers and events that built a habit" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give downtown a reason to gather."
        sub="Events, offers, happy hours, and recurring nights that people can save, RSVP to, visit, and come back for."
        ctaLabel="Get on the Map"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
