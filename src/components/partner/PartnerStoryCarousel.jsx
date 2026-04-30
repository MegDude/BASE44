import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function PartnerStoryCarousel({
  eyebrow = "In practice",
  title = "How this actually lands.",
  intro = "",
  items = [],
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [items]);

  if (!items.length) return null;

  const activeItem = items[activeIndex];

  function jumpTo(nextIndex) {
    const total = items.length;
    if (!total) return;
    setActiveIndex((nextIndex + total) % total);
  }

  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <div className="dp-micro-label">{eyebrow}</div>
            <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.8rem]">
              {title}
            </h2>
            {intro ? (
              <p className="mt-4 max-w-xl text-[14px] leading-7 text-muted-foreground">
                {intro}
              </p>
            ) : null}

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => jumpTo(activeIndex - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white text-[var(--dp-navy,#0B1F33)] shadow-[0_8px_18px_rgba(11,31,51,0.05)]"
                aria-label="Previous detail"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => jumpTo(activeIndex + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white text-[var(--dp-navy,#0B1F33)] shadow-[0_8px_18px_rgba(11,31,51,0.05)]"
                aria-label="Next detail"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.96))] p-5 shadow-[0_18px_44px_rgba(11,31,51,0.06)] md:p-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {items.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={`${item.title}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
                      active
                        ? "border-[rgba(207,175,90,0.32)] bg-[rgba(207,175,90,0.10)] text-[var(--dp-navy)]"
                        : "border-[rgba(11,31,51,0.08)] bg-white text-[rgba(11,31,51,0.56)] hover:text-[var(--dp-navy)]"
                    }`}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)] text-[10px] font-semibold text-[var(--dp-navy)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={`${activeIndex}-${activeItem.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="mt-5 rounded-[22px] bg-white/88 p-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] px-3 py-1.5 text-[11px] font-semibold text-[var(--dp-navy)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-muted)]" />
                {activeItem.note || "Partner detail"}
              </div>

              <h3 className="mt-4 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                {activeItem.title}
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
                {activeItem.body}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
