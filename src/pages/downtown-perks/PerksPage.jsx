import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gift, MapPinned, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function formatCategory(value) {
  return String(value || "perk")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PerksPage() {
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Perk.list("-created_date");
      setPerks(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  const active = useMemo(() => perks.filter((p) => p.status === "active"), [perks]);
  const featured = active.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[84px] pb-12">
      <div className="dp-page-shell dp-page-stack">
        <section className="dp-band relative overflow-hidden p-6 md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,139,136,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,168,90,0.16),transparent_30%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="dp-eyebrow">Perks nearby</span>
              <h1 className="dp-display-section mt-4 text-[2.4rem] md:text-[3.4rem]">
                Offers tied to places you would actually go.
              </h1>
              <p className="dp-body-copy mt-4 max-w-2xl">
                One card. One map. Everything nearby. Downtown Perks keeps the offer layer useful by tying it back to live downtown behavior.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/downtown-perks/explore?category=perks" className="dp-cta-primary">
                  Open Map
                </Link>
                <Link to="/card" className="dp-cta-secondary">
                  Get the Perks Card
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {[
                { value: `${active.length || 0}`, label: "active perks" },
                { value: "Live", label: "offer layer synced to map context" },
                { value: "1 tap", label: "from discovery to redeem flow" },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] bg-white/76 p-4 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
                  <div className="font-heading text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[12px] uppercase tracking-[0.12em] text-foreground/48">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="dp-band p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="dp-eyebrow">Featured now</div>
                <h2 className="mt-3 font-heading text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground">
                  Right now, nearby, and worth using.
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {featured.map((perk, i) => (
                <motion.div
                  key={perk.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,238,0.92))] p-5 shadow-[0_18px_34px_rgba(11,26,43,0.05)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-[rgba(198,168,90,0.10)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      {formatCategory(perk.category)}
                    </span>
                    <Gift className="h-5 w-5 text-[var(--dp-navy)]" />
                  </div>
                  <h3 className="mt-5 font-heading text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                    {perk.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-6 text-foreground/58">{perk.venue_name}</p>
                  <div className="mt-5 rounded-[20px] bg-[rgba(11,26,43,0.04)] px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-foreground/42">Offer</div>
                    <div className="mt-1 font-heading text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy)]">
                      {perk.value}
                    </div>
                  </div>
                  {perk.description ? (
                    <p className="mt-4 text-[13px] leading-6 text-foreground/64">{perk.description}</p>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="dp-band dp-band-muted p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgba(11,26,43,0.14)] border-t-[var(--dp-navy)]" />
            </div>
          ) : active.length > 0 ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="dp-eyebrow">All active perks</div>
                  <h2 className="mt-3 font-heading text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground">
                    The live reward layer.
                  </h2>
                </div>
                <Link to="/downtown-perks/explore?category=perks" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--dp-navy)]">
                  <MapPinned className="h-4 w-4" />
                  View on the map
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {active.map((perk, i) => (
                  <motion.div
                    key={perk.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="dp-card p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[rgba(11,26,43,0.05)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/56">
                        {formatCategory(perk.category)}
                      </span>
                      <Sparkles className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                    </div>
                    <h3 className="mt-4 font-heading text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                      {perk.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-foreground/54">{perk.venue_name}</p>
                    <div className="mt-4 text-[1.1rem] font-semibold text-[var(--dp-navy)]">{perk.value}</div>
                    {perk.description ? (
                      <p className="mt-3 text-[13px] leading-6 text-foreground/64">{perk.description}</p>
                    ) : null}
                    {perk.terms ? (
                      <p className="mt-3 text-[12px] italic leading-5 text-foreground/46">{perk.terms}</p>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] bg-white/78 p-8 text-center shadow-[0_16px_36px_rgba(11,26,43,0.05)]">
              <Sparkles className="mx-auto h-12 w-12 text-[var(--dp-gold-muted)]" />
              <h3 className="mt-4 font-heading text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground">
                Perks coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-7 text-foreground/62">
                The perk layer is being seeded with downtown offers now. The interface stays usable even before every partner is live.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
