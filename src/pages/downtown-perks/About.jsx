import { Link } from "react-router-dom";
import { Building2, Megaphone, Users } from "lucide-react";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { createExploreLink } from "@/lib/routeHelpers";
import { trackEvent } from "@/lib/analytics";

const FAQ_ITEMS = [
  { question: "Do I need to download an app?", answer: "No. Scan a QR code and open the map instantly. No download or login required." },
  { question: "What gets tracked?", answer: "Only meaningful actions — saves, visits, and redemptions — to improve the experience and provide partner insights." },
  { question: "How much does it cost?", answer: "The map is free to use. The card activates when perks or access points are used." },
  { question: "Why is this better than a static list?", answer: "Because it’s live. What’s open, nearby, and relevant updates in real time." },
  { question: "What kinds of organizations can join?", answer: "Properties, venues, hospitality groups, brands, and civic organizations operating downtown." },
  { question: "What can we measure?", answer: "Engagement, visits, redemptions, and movement across downtown." },
];

const ENTRY_CARDS = [
  { icon: Users, title: "Residents", copy: "Find places, events, and perks nearby — and use your card when it matters.", href: "/residents", cta: "Go to Resident View" },
  { icon: Building2, title: "Properties", copy: "Turn the surrounding neighborhood into a real resident amenity — and measure what drives engagement.", href: "/partners/properties", cta: "View Property Solution" },
  { icon: Megaphone, title: "Partners", copy: "Show up where nearby intent is already forming — and measure real outcomes.", href: "/partners", cta: "Explore Partner Types" },
];

const USE_CASES = [
  { title: "Resident utility", body: "Find somewhere to go, see what’s happening tonight, save it, and use it when you get there.", href: createExploreLink({ intent: "nearby" }) },
  { title: "Property amenity", body: "Turn the neighborhood into something residents actually use — and track what’s working.", href: "/partners/properties" },
  { title: "Events and nightlife", body: "Surface what’s happening in one place so people can choose faster — and partners can measure what worked.", href: createExploreLink({ type: "event", time: "now" }) },
];

function TrackedLink({ to, eventName, children, className }) {
  return (
    <Link to={to} onClick={() => trackEvent(eventName)} className={className}>
      {children}
    </Link>
  );
}

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--dp-surface-base)] pb-14 pt-[84px]">
      <div className="dp-page-shell space-y-4">
        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="max-w-4xl">
            <div className="dp-micro-label">About</div>
            <h1 className="dp-display-section mt-4 text-[2.6rem] text-foreground md:text-[4.2rem]">
              Downtown, in one map.
            </h1>
            <p className="mt-4 max-w-3xl text-[16px] leading-7 text-foreground/80">
              Find what’s nearby, what’s happening, and what you can use right now.
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-muted-foreground">
              One map. One card. One working layer for downtown Austin.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink to="/explore" eventName="about_open_map_clicked" className="dp-cta-primary">Open the Map</TrackedLink>
              <TrackedLink to="/partners" eventName="about_partner_type_clicked" className="dp-cta-secondary">View Partner Types</TrackedLink>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="dp-band p-6">
            <div className="dp-micro-label">Section 1</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
              Not another feed. A working layer.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              Downtown Perks brings places, events, perks, buildings, and local context into one live map.
            </p>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              The goal is simple: help people decide what to do based on what’s nearby, relevant, and usable right now.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/explore" className="dp-link-action">Open Map</Link>
              <Link to="/events" className="dp-link-action">Browse Events</Link>
              <Link to="/perks" className="dp-link-action">View Perks</Link>
            </div>
          </div>

          <div className="dp-band p-6">
            <div className="dp-micro-label">Section 2</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
              Downtown already works. Finding it doesn’t.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              The places, events, and people are already here. What’s missing is the layer that connects them without switching between apps, tabs, or feeds.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="dp-band p-6">
            <div className="dp-micro-label">Section 3</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
              Browse first. Unlock when it matters.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">The map is the product. The card is access.</p>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              People can explore freely. When they save something, RSVP, or use a perk, the card becomes the access layer.
            </p>
            <div className="mt-5">
              <Link to="/card" className="dp-cta-secondary">Get the Card</Link>
            </div>
          </div>

          <div className="dp-band dp-band-muted p-6">
            <div className="dp-micro-label">Section 4</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
              Ask the map. Get a real answer.
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">1. Open the map</div>
                <p className="mt-1 text-[14px] leading-7 text-muted-foreground">See restaurants, bars, coffee, services, buildings, perks, and events in one place.</p>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">2. See what’s relevant</div>
                <p className="mt-1 text-[14px] leading-7 text-muted-foreground">Nearby options, walk time, open-now context, and event timing resolve into one clear view.</p>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">3. Take the next action</div>
                <p className="mt-1 text-[14px] leading-7 text-muted-foreground">Save a place, RSVP to an event, use a perk, or show your card.</p>
              </div>
            </div>
            <div className="mt-5">
              <Link to="/explore" className="dp-cta-primary">Open the Map</Link>
            </div>
          </div>
        </section>

        <section className="dp-band p-6 md:p-8">
          <div className="dp-micro-label">Section 5</div>
          <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
            What this looks like
          </h2>
          <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
            Real activity, not assumptions.
          </div>
          <p className="mt-4 text-[1.2rem] font-semibold text-foreground">1,284 property views · 342 resident actions</p>
          <p className="mt-4 max-w-3xl text-[14px] leading-7 text-muted-foreground">
            People nearby open the map. They see your building, place, brand, or district in context. They take action based on what’s relevant right now.
          </p>
          <p className="mt-3 text-[14px] leading-7 text-foreground/74">You see what got attention — and what to do next.</p>
          <div className="mt-5">
            <Link to={createExploreLink({ type: "property", intent: "residential" })} className="dp-cta-secondary">Open Residential View</Link>
          </div>
        </section>

        <section className="dp-band p-6 md:p-8">
          <div className="dp-micro-label">Section 6</div>
          <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
            One system. Three ways in.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {ENTRY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/86 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-[1.2rem] font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{card.copy}</p>
                  <Link to={card.href} className="mt-4 inline-flex text-[13px] font-semibold text-[var(--dp-navy)]">{card.cta}</Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="dp-band dp-band-dark p-6 text-white">
            <div className="dp-micro-label text-[var(--dp-gold-muted)]">Section 7</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
              Built as one system.
            </h2>
            <div className="mt-4 space-y-3">
              {["The map is the interface", "The card is access", "The dashboard measures what happens next"].map((line) => (
                <div key={line} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white/78">
                  {line}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] leading-7 text-white/72">
              Everything runs on one shared layer. Not disconnected pages. Not separate tools.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/explore" className="dp-cta-secondary">Map</Link>
              <Link to="/card" className="dp-cta-secondary">Card</Link>
              <Link to="/partners/dashboard" className="dp-cta-secondary">Dashboard</Link>
            </div>
          </div>

          <div className="dp-band p-6">
            <div className="dp-micro-label">Section 8</div>
            <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
              What this looks like in use.
            </h2>
            <div className="mt-5 space-y-4">
              {USE_CASES.map((item) => (
                <Link key={item.title} to={item.href} className="block rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/86 p-4 transition hover:bg-white">
                  <div className="text-[15px] font-semibold text-foreground">{item.title}</div>
                  <div className="mt-2 text-[14px] leading-7 text-muted-foreground">{item.body}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FAQAccordionBlock
          sectionEyebrow="FAQ"
          sectionTitle="Questions, answered clearly."
          sectionIntro="One item open at a time."
          items={FAQ_ITEMS}
          styleVariant="default"
          defaultOpenIndex={0}
          allowMultipleOpen={false}
          pageType="about"
          ctaLabel="Apply to Be a Partner"
          ctaHref="/partners/apply"
        />

        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="dp-micro-label">Final CTA</div>
            <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.04em] text-foreground">
              One working layer for downtown.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              Use the map first. Use the card when it matters. Measure what happens next.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/explore" className="dp-cta-primary">Open Map</Link>
              <Link to="/card" className="dp-cta-secondary">Get Your Card</Link>
              <Link to="/partners/apply" className="dp-cta-secondary">Apply to Be a Partner</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
