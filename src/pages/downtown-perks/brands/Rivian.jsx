import { CalendarDays, Car, MapPin, Navigation, Ticket, Users } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.rivian}
    eyebrow="Rivian-style campaign"
    title="Adventure starts downtown"
    body="A campaign poster and event highlights replace non-interactive map animation."
  />
);

export default function Rivian() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Brand Experience · Downtown Austin"
        headline={<>Adventure starts<br /><span className="text-primary">downtown.</span></>}
        support="Bring people together through experiences, events, and moments worth showing up for."
        ctaLabel="Design the Campaign"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Be present when people are already downtown and ready to do something.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Car className="w-5 h-5" />} label="Test drive moments" sub="Invite nearby residents to reserve a spot and experience Rivian in context." delay={0} />
          <SignalCard icon={<Navigation className="w-5 h-5" />} label="Outdoor tie-ins" sub="Connect with trail events, fitness partners, and downtown weekends." delay={0.1} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="People who show up" sub="Campaigns are built around RSVPs, attendance, saves, and follow-up." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="A campaign poster first, then event highlights." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Poster in partner buildings" desc="Residents see the Rivian experience in lobbies, elevators, and resident communications." delay={0} />
          <FlowCard step="02" title="RSVP for the event" desc="People reserve a test drive, pop-up visit, or outdoor experience with a simple next step." delay={0.1} />
          <FlowCard step="03" title="Show up downtown" desc="The event meets people near where they live, work, walk, and spend weekends." delay={0.2} />
          <FlowCard step="04" title="See what happened" desc="Rivian can review saves, RSVPs, attendance, visits, and what people responded to." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Activation Highlights" title="Campaigns that feel local, not generic.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Test Drive" title="Building-adjacent weekend" detail="Residents RSVP for time slots near partner properties, making the experience easy to attend." delay={0} />
          <UseCaseCard tag="Trail" title="Morning event tie-in" detail="Rivian joins a trail or run club moment where the brand already feels relevant." delay={0.1} />
          <UseCaseCard tag="Pop-Up" title="Downtown showcase" detail="A temporary experience gives people a reason to visit, explore, and ask questions." delay={0.2} />
          <UseCaseCard tag="Offer" title="RSVP-linked perk" detail="People who RSVP can unlock a follow-up, appointment, or exclusive event benefit." delay={0.3} />
          <UseCaseCard tag="Follow-Up" title="Useful next step" detail="After attending, people can save, book, or come back to a future event." delay={0.4} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="What Rivian can learn." className="bg-card/30 border-y border-border">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<Ticket className="w-5 h-5" />} label="RSVPs" sub="Who reserved a spot" delay={0} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Attendance" sub="Who showed up" delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Visits" sub="Where events performed best" delay={0.2} />
          <SignalCard value="Follow-up" label="Next steps" sub="Who wanted more after the event" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Build a Rivian experience people can actually attend."
        sub="Campaign poster, RSVP flow, event highlights, and clear reporting on what people responded to."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
