import { Link } from "react-router-dom";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { createExploreLink } from "@/lib/routeHelpers";

const STATS = [
  { value: "Launch", label: "perk layer being seeded" },
  { value: "Live", label: "offers tied to map context" },
  { value: "1 tap", label: "from discovery to redeem flow" },
];

export default function PerksPage() {
  return (
    <main className="min-h-screen bg-[var(--dp-surface-base)] pb-12 pt-[84px]">
      <div className="dp-page-shell space-y-4">
        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="dp-eyebrow">Perks nearby.</span>
              <h1 className="dp-display-section mt-4 text-[2.5rem] md:text-[4rem]">
                Places, plans, and perks in one simple view.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                Perks live inside the map, tied to real places nearby — restaurants, bars, coffee, events, services, buildings, and partner locations.
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                Open the map, find what is close, and use the card when a perk matters.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={createExploreLink({ type: "perk", radius: 5 })} className="dp-cta-primary">Open Perks on the Map</Link>
                <Link to="/card" className="dp-cta-secondary">Get the Perks Card</Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {STATS.map((item) => (
                <div key={item.label} className="rounded-[22px] bg-white/72 p-4 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
                  <div className="text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">{item.value}</div>
                  <div className="mt-1 text-[12px] uppercase tracking-[0.12em] text-foreground/48">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            { icon: Gift, title: "Perks stay tied to place", body: "No coupon wall. No detached offer feed. If a perk matters, it stays attached to the venue, event, building, or partner context that makes it useful." },
            { icon: Sparkles, title: "Browse first", body: "The map stays useful before every offer is live because it still helps people find nearby places, events, and card-ready access points." },
            { icon: Ticket, title: "Use the card when it matters", body: "The card appears at the action layer: save, RSVP, redeem, or check in. It is access, not the product." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="dp-band p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-[1.2rem] font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{item.body}</p>
              </div>
            );
          })}
        </section>

        <section className="dp-band dp-band-muted p-6 md:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <Sparkles className="mx-auto h-12 w-12 text-[var(--dp-gold-muted)]" />
            <h2 className="mt-4 font-heading text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground">
              Perks are being added now.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              The perk layer is being seeded with downtown offers, partner locations, and launch activations.
            </p>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              The map stays useful before every offer is live because it still helps people find nearby places, events, and card-ready access points.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={createExploreLink({ type: "perk", radius: 5 })} className="dp-cta-primary">Open Perks on the Map</Link>
              <Link to="/card" className="dp-cta-secondary">Get the Perks Card</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
