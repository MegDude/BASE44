import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck2, Map, QrCode } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const STAGES = [
  {
    id: "nearby",
    label: "Nearby",
    title: "Open the map.",
    body: "See what is actually close without jumping between five different apps.",
    icon: Map,
  },
  {
    id: "useful",
    label: "Useful",
    title: "Tap something that looks good.",
    body: "See why it matters, how close it is, and whether it is worth opening now.",
    icon: CalendarCheck2,
  },
  {
    id: "ready",
    label: "Ready",
    title: "Walk there. Show your card if there is a perk.",
    body: "Save, RSVP, or redeem only when the next step actually matters.",
    icon: QrCode,
  },
];

export default function WhySection() {
  const [activeStage, setActiveStage] = useState(STAGES[0].id);
  const stage = STAGES.find((item) => item.id === activeStage) || STAGES[0];
  const StageIcon = stage.icon;

  useEffect(() => {
    const currentIndex = STAGES.findIndex((item) => item.id === activeStage);
    const timer = window.setTimeout(() => {
      const nextStage = STAGES[(currentIndex + 1) % STAGES.length];
      setActiveStage(nextStage.id);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [activeStage]);

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell border-t border-[rgba(11,31,51,0.08)] pt-8">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="max-w-[540px]">
            <div className="dp-micro-label">How it works</div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="dp-display-section mt-3 text-[2rem] text-foreground md:text-[2.8rem]"
            >
              Open. Decide. Go.
            </motion.h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
              One simple flow for what is close, what is useful, and what you can do next.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(247,249,252,0.94))] p-5 shadow-[0_16px_36px_rgba(11,31,51,0.05)] md:p-6">
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max gap-5">
                {STAGES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveStage(item.id)}
                    aria-pressed={activeStage === item.id}
                    className={`rounded-full px-0 py-2 text-left transition ${
                      activeStage === item.id
                        ? "text-[var(--dp-navy,#0B1F33)]"
                        : "text-[rgba(11,31,51,0.42)] hover:text-[var(--dp-navy,#0B1F33)]"
                    }`}
                  >
                    <span className="text-[14px] font-semibold">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1} {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="mt-4 min-h-[182px] px-1 py-2"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(207,175,90,0.16)] text-[var(--dp-gold-deep,#A97816)]">
                  <StageIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                    {stage.label}
                  </div>
                  <h3 className="mt-2 text-[1.35rem] font-semibold leading-tight text-foreground md:text-[1.6rem]">
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                    {stage.body}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mt-2 flex items-center gap-2">
              {STAGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveStage(item.id)}
                  aria-label={`Show ${item.label.toLowerCase()} stage`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeStage === item.id
                      ? "w-10 bg-[var(--dp-navy,#0B1F33)]"
                      : "w-5 bg-[rgba(11,31,51,0.14)] hover:bg-[rgba(11,31,51,0.24)]"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to={ROUTES.explore} className="dp-cta-primary">
                Open Map
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
