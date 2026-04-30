const routes = {
  explore: "/explore",
  card: "/resident-app/card",
  partners: "/partners",
  workspace: "/partner-workspace",
  events: "/events",
  happyHour: "/happy-hour-walking-map",
};

const intentChips = ["Coffee right now", "Dinner tonight", "Happy hour nearby", "Events this week"];

const flow = [
  ["Open", "Start with the live downtown map. No download. No login wall."],
  ["Decide", "Filter by distance, mood, category, event, or perk."],
  ["Go", "Save, RSVP, show your card, or head there now."],
];

const proofMetrics = [
  ["Saves", "Resident intent before the visit"],
  ["RSVPs", "Event demand by day and district"],
  ["Scans", "Proof that access became action"],
  ["Redemptions", "Partner value after discovery"],
];

const partnerTabs = [
  ["Buildings", "Turn the neighborhood into a measurable resident amenity.", "/partners/properties"],
  ["Hotels", "Give guests one live downtown layer beyond the lobby.", "/partners/hotels"],
  ["Venues", "Show up when nearby intent is already forming.", "/partners/venues"],
  ["Brands", "Activate the right corridor at the right time.", "/partners/brands"],
  ["Civic", "Make district participation easier to see and measure.", "/partners/civic"],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pin({ className = "" }) {
  return <span className={`absolute h-3 w-3 rounded-full bg-[#cfaf5a] shadow-[0_0_0_8px_rgba(207,175,90,0.16)] ${className}`} />;
}

function ButtonLink({ href, children, variant = "primary" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#cfaf5a]/50";
  const styles = variant === "primary"
    ? "bg-[#071b2f] text-white shadow-[0_18px_40px_rgba(7,27,47,0.20)] hover:bg-[#0b1f33]"
    : "border border-[#071b2f]/15 bg-white/70 text-[#071b2f] hover:bg-white";
  return <a href={href} className={`${base} ${styles}`}>{children}<ArrowIcon /></a>;
}

function MapPreview() {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-[#071b2f]/10 bg-[#071b2f] p-5 shadow-[0_30px_90px_rgba(7,27,47,0.24)]">
      <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 20% 20%, rgba(207,175,90,.28), transparent 24%), radial-gradient(circle at 70% 30%, rgba(255,255,255,.20), transparent 18%), linear-gradient(135deg, #071b2f, #0b1f33)" }} />
      <div className="absolute inset-8 rounded-[1.5rem] border border-white/10" />
      <div className="absolute left-12 right-12 top-1/3 h-px rotate-[-18deg] bg-white/20" />
      <div className="absolute left-20 right-10 top-1/2 h-px rotate-[10deg] bg-white/20" />
      <div className="absolute bottom-24 left-8 right-16 h-px rotate-[-7deg] bg-white/20" />
      <Pin className="left-[18%] top-[24%]" />
      <Pin className="left-[62%] top-[31%]" />
      <Pin className="left-[42%] top-[53%]" />
      <Pin className="left-[75%] top-[68%]" />

      <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-white/60">Ask the Map</p>
        <p className="mt-2 text-lg font-semibold">Happy hour within a 10-minute walk</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80">
          <span className="rounded-full bg-white/10 px-3 py-2">Rainey</span>
          <span className="rounded-full bg-white/10 px-3 py-2">Open now</span>
          <span className="rounded-full bg-white/10 px-3 py-2">Perks</span>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 rounded-2xl border border-white/15 bg-white/95 p-4 text-[#071b2f] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748b]">Nearby result</p>
            <h3 className="mt-1 text-xl font-semibold">Stay Put</h3>
            <p className="mt-1 text-sm text-[#64748b]">0.4 mi · drinks · live tonight · resident perk</p>
          </div>
          <span className="rounded-full bg-[#cfaf5a]/15 px-3 py-1 text-xs font-semibold text-[#071b2f]">Live</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeV2() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#142033]">
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(circle at 18% 15%, rgba(207,175,90,.16), transparent 25%), radial-gradient(circle at 78% 12%, rgba(7,27,47,.10), transparent 22%), linear-gradient(180deg, #fbfcff, #f7f8fb)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#64748b]">Downtown Austin, live now</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#071b2f] sm:text-6xl lg:text-7xl">
              Where downtown meets you.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475569]">
              A live neighborhood layer for places, events, perks, and resident access — built around the way people actually decide where to go.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={routes.explore}>Explore Downtown</ButtonLink>
              <ButtonLink href={routes.card} variant="secondary">Get Your Card</ButtonLink>
            </div>
          </div>
          <MapPreview />
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#071b2f]/10 bg-white/80 p-5 shadow-[0_24px_70px_rgba(7,27,47,0.08)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">Signature interaction</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071b2f] sm:text-5xl">Ask Downtown. Go anywhere.</h2>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#071b2f]/10 bg-[#f7f8fb] p-3 sm:flex-row sm:items-center">
            <input aria-label="Ask the map" className="min-h-12 flex-1 bg-transparent px-3 text-base outline-none" placeholder="Coffee near me, dinner tonight, events nearby..." />
            <ButtonLink href={routes.explore}>Ask the Map</ButtonLink>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {intentChips.map((chip) => <a key={chip} href={routes.explore} className="rounded-full border border-[#071b2f]/10 bg-white px-4 py-2 text-sm text-[#071b2f] hover:border-[#cfaf5a]">{chip}</a>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">Resident flow</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#071b2f] sm:text-6xl">Open. Decide. Go.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {flow.map(([title, copy], index) => (
              <div key={title} className="rounded-[1.5rem] bg-white/70 p-6 shadow-[0_18px_50px_rgba(7,27,47,0.07)]">
                <span className="text-sm font-semibold text-[#cfaf5a]">0{index + 1}</span>
                <h3 className="mt-5 text-2xl font-semibold text-[#071b2f]">{title}</h3>
                <p className="mt-3 leading-7 text-[#64748b]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] bg-[#071b2f] p-8 text-white lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Perks Card</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Your downtown access layer.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">Save places, RSVP to events, unlock local perks, and prove what happened next.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={routes.card}>Get Your Card</ButtonLink>
              <ButtonLink href={routes.explore} variant="secondary">Open Map</ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-[#cfaf5a]/30 bg-[#0b1f33] p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#cfaf5a]">Downtown Perks</p>
              <h3 className="mt-8 text-3xl font-semibold">Resident Card</h3>
              <p className="mt-3 text-white/60">Show your card. Get the perk.</p>
              <div className="mt-12 grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => <span key={i} className="h-10 rounded-lg bg-white/10" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">Live tonight</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#071b2f] sm:text-6xl">What’s worth stepping out for tonight.</h2>
            <p className="mt-5 text-lg leading-8 text-[#64748b]">Pick a day, see what is happening nearby, then open the events map when you want the full downtown view.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={routes.events}>Open Events</ButtonLink>
              <ButtonLink href={routes.happyHour} variant="secondary">Happy Hour Map</ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/80 p-6 shadow-[0_20px_60px_rgba(7,27,47,0.08)]">
            <p className="text-sm font-semibold text-[#cfaf5a]">Apr 30 · 6:00 PM</p>
            <h3 className="mt-3 text-3xl font-semibold text-[#071b2f]">Downtown social hour</h3>
            <p className="mt-3 leading-7 text-[#64748b]">A cleaner featured-event surface for tonight, tied directly to the map, RSVP flow, and resident card.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">Partner proof</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-[#071b2f] sm:text-6xl">Turn nearby intent into measurable action.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proofMetrics.map(([title, copy]) => (
              <div key={title} className="rounded-[1.5rem] border border-[#071b2f]/10 bg-white/70 p-5">
                <h3 className="text-2xl font-semibold text-[#071b2f]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748b]">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-5">
            {partnerTabs.map(([title, copy, href]) => (
              <a key={title} href={href} className="rounded-2xl bg-[#071b2f] p-5 text-white transition hover:-translate-y-1 hover:bg-[#0b1f33]">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{copy}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,27,47,0.10)] lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">Ready when you are</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071b2f] sm:text-6xl">Downtown, made easier to use.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#64748b]">People do not choose the best option. They choose the one they notice, understand, and can act on quickly.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={routes.explore}>Open the Map</ButtonLink>
            <ButtonLink href={routes.workspace} variant="secondary">Start Partner Pilot</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
