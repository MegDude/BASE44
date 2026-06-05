import { CalendarDays, Megaphone, MessageCircle } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.daa}
    eyebrow="DAA Campaign"
    title="Connect people to place"
    body="Residents, businesses, and visitors can find initiatives, events, and ways to participate."
  />
);

export default function Daa() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Civic Partner · Downtown Austin"
        headline={<>Help shape<br /><span className="text-primary">downtown.</span></>}
        support="Explore initiatives, events, neighborhood updates, and ways to participate."
        ctaLabel="Plan a Civic Campaign"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Connect people, businesses, and local initiatives through participation.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Megaphone className="w-5 h-5" />} label="Neighborhood updates" sub="Share what is happening downtown in a place people already check." delay={0} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Local events" sub="Invite people to join public events, volunteer moments, and community programs." delay={0.1} />
          <SignalCard icon={<MessageCircle className="w-5 h-5" />} label="Participation" sub="Make surveys, feedback, and sign-ups easier to find and complete." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Where civic messages become visible." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Campaign poster" desc="DAA campaign imagery can appear in buildings, venues, newsletters, and local guide moments." delay={0} />
          <FlowCard step="02" title="Neighborhood context" desc="Updates are tied to the places, events, and districts people already recognize." delay={0.1} />
          <FlowCard step="03" title="Clear ways to participate" desc="People can RSVP, save, submit feedback, or learn more from one local entry point." delay={0.2} />
          <FlowCard step="04" title="What people responded to" desc="DAA can see which updates, events, and initiatives drew attention or action." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="A more connected downtown story.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Initiative" title="Public updates people can find" detail="A downtown initiative appears with context, timing, and a clear next step." delay={0} />
          <UseCaseCard tag="Event" title="Community events people can join" detail="Residents and visitors can RSVP, save, and show up to local programming." delay={0.1} />
          <UseCaseCard tag="Feedback" title="Participation made easier" detail="Surveys and community input requests become part of the downtown experience." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Help downtown feel easier to understand and join."
        sub="Initiatives, events, updates, and participation prompts in one local system."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
