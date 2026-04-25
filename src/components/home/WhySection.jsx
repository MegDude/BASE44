import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck2, Map, QrCode } from "lucide-react";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";
import { ROUTES } from "@/lib/routes";

const STEP_ICONS = [Map, CalendarCheck2, QrCode];

export default function WhySection() {
  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="grid gap-8 border-t border-[rgba(11,31,51,0.08)] pt-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="dp-eyebrow mb-4 block">{APPROVED_HOME_COPY.why.title}</div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="dp-display-section max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]"
            >
              {APPROVED_HOME_COPY.why.problem}
            </motion.h2>
            <p className="dp-body-copy mt-4 max-w-3xl">{APPROVED_HOME_COPY.why.examples}</p>
            <p className="dp-body-copy mt-4 max-w-3xl">{APPROVED_HOME_COPY.why.summary}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="border-t border-[rgba(11,31,51,0.08)] px-1 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                  Nearby
                </div>
                <div className="mt-2 text-[14px] font-semibold text-foreground">
                  See what is actually close.
                </div>
              </div>
              <div className="border-t border-[rgba(11,31,51,0.08)] px-1 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                  Useful
                </div>
                <div className="mt-2 text-[14px] font-semibold text-foreground">
                  Know what is worth opening now.
                </div>
              </div>
              <div className="border-t border-[rgba(11,31,51,0.08)] px-1 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                  Ready
                </div>
                <div className="mt-2 text-[14px] font-semibold text-foreground">
                  Save, RSVP, or redeem when you need to.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,249,252,0.92))] p-1 md:p-2">
            <div className="dp-micro-label">How it works</div>
            <h3 className="dp-heading-modern mt-3 text-[1.55rem] md:text-[1.95rem]">
              Open. Decide. Go.
            </h3>
            <div className="mt-5 space-y-3">
              {APPROVED_HOME_COPY.howItWorks.steps.map((step, index) => {
                const Icon = STEP_ICONS[index] || Map;
                return (
                  <div
                    key={step.title}
                    className="border-t border-[rgba(11,31,51,0.08)] px-1 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[rgba(207,175,90,0.16)] text-[var(--dp-gold-deep,#A97816)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-foreground">{step.title}</div>
                        <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{step.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
                Perks Card
              </div>
              <h4 className="dp-heading-modern-light mt-3 text-[1.25rem]">
                The card is access, not the product.
              </h4>
              <p className="mt-3 text-[13px] leading-6 text-white/86">
                Use the map first. Add the card when you want saves, RSVP, member perks, or redemption.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={ROUTES.residentAppCard} className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Get Your Card
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={ROUTES.explore} className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Open Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
