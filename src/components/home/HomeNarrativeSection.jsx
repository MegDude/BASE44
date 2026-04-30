import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export default function HomeNarrativeSection() {
  return (
    <section className="border-t border-[hsl(218,20%,88%)] bg-white px-6 py-14 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
              Downtown, in one place
            </span>
            <h2 className="font-heading text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-[38px]">
              You live downtown. Finding what is nearby should not take five tabs, three group texts, and a lucky guess.
            </h2>
            <p className="mb-5 mt-5 text-[13px] leading-relaxed text-foreground/60">
              Downtown already has the places, events, and people. The missing piece is a simple way to see what is close, useful, and worth doing right now.
            </p>
            <p className="text-[13px] italic leading-relaxed text-foreground/50">
              Find what is nearby. See what is worth doing. Use your card when there is a perk.
            </p>
            <div className="my-6 h-px bg-[hsl(218,20%,90%)]" />
            <p className="text-sm leading-relaxed text-foreground/80">
              Downtown Perks fixes that. The problem is not what to do next. It is the effort it takes to decide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-6 md:pt-6"
          >
            <div>
              <h3 className="mb-3 font-heading text-2xl font-medium leading-[1.1] tracking-tight text-foreground">
                Search less. Do more.
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/60">
                Downtown Perks brings places, events, and perks together so it is easier to decide what to do next. A simple live map for people who live downtown and the places that want to show up at the right moment.
              </p>
            </div>

            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                What you can do
              </div>
              <ul className="space-y-2 text-[13px] leading-relaxed text-foreground/68">
                <li>Restaurants, bars, coffee shops, and services nearby</li>
                <li>Events happening tonight, ready to RSVP</li>
                <li>Local perks from places you'd go anyway</li>
                <li>Places worth coming back to</li>
                <li>People around you, when you want to be social</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={ROUTES.explore} className="dp-cta-primary">
                  Explore Downtown
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={ROUTES.residentAppCard} className="dp-cta-secondary">
                  Get Your Card
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-heading text-xl font-medium leading-[1.1] tracking-tight text-foreground">
                One map. Everything nearby.
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/60">
                Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-[#fbfcfe] p-6"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">How it works</div>
            <h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground">Tap. Learn. Decide.</h3>
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-[14px] font-semibold text-foreground">See what it is, why it matters, and how close you are.</div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">Save it or go now.</div>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">Plan ahead — or decide in the moment.</p>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">Show your card. Use the perk.</div>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">They scan. You save. Done.</p>
              </div>
              <div className="rounded-[18px] bg-white px-4 py-4 text-[13px] leading-6 text-foreground/76">
                <strong className="text-foreground">That's how friction dies.</strong> No extra steps. No guesswork. Just the shortest distance between "maybe" and "I'm going."
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-4"
          >
            <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">Places nearby</div>
              <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">Tap. Learn. Go.</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Every location shows what it is, what it offers, and how far you are from the door.
              </p>
              <div className="mt-4 rounded-[18px] bg-[#f7f9fc] p-4">
                <div className="text-[14px] font-semibold text-foreground">Jo's Coffee</div>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">Coffee. Quick stops. Daily rituals.</p>
                <div className="mt-3 text-[12px] font-medium text-foreground/72">Nearby perk · 5-minute walk</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[rgba(10,20,40,0.08)] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
                    Show card
                  </span>
                  <span className="rounded-full border border-[rgba(10,20,40,0.08)] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
                    Open
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">What's around the corner</div>
                <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">Everything you need, within walking distance.</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">See what's close, decide quickly, and go.</p>
                <Link to={ROUTES.explore} className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">
                  Explore nearby
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">Events happening now</div>
                <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">See what is on. RSVP in one tap.</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">From happy hours to local programming — RSVP without leaving the map.</p>
                <Link to={ROUTES.events} className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">
                  See events
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">Want to live here?</div>
              <h3 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">Browse what's available — and what comes with it.</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                See properties nearby, not just listings online. Filter the map to Properties to view participating buildings, rentals, and homes for sale.
              </p>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Tap any building for availability, pricing, and what's walkable from the door.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={ROUTES.partnerProperties} className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">
                  View properties
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to={ROUTES.residentAppCard} className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">
                  Get Your Perks Card Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
