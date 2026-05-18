import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, QrCode, Route, Sparkles } from "lucide-react";

const DEFAULT_KEYWORDS = [
  ["Connect", "Entry points"],
  ["Access", "Invite or QR"],
  ["Map", "Live nearby layer"],
  ["Results", "What people use"],
];

const DEFAULT_ICONS = [QrCode, Sparkles, Route, CheckCircle2];

function getKeywordSet(step, index) {
  const preset = DEFAULT_KEYWORDS[index] ?? ["Step", `0${index + 1}`];
  const text = String(step || "").toLowerCase();

  if (text.includes("resident")) return ["Residents", "Open and use"];
  if (text.includes("guest")) return ["Guests", "Open and go"];
  if (text.includes("brand")) return ["Campaign", "Launch live"];
  if (text.includes("dashboard")) return ["Dashboard", "See what worked"];
  if (text.includes("event")) return ["Events", "Show up on time"];
  if (text.includes("offer")) return ["Offers", "Ready to use"];
  if (text.includes("map")) return ["Map", "Nearby and live"];
  return preset;
}

export default function WorkflowVisualizer({
  steps = [],
  title = "How it works",
  className = "",
  compact = false,
}) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [steps]);

  useEffect(() => {
    if (steps.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [steps]);

  const activeCopy = useMemo(() => steps[activeStep] ?? "", [steps, activeStep]);

  if (!steps.length) return null;

  return (
    <div className={className}>
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/48">
        {title}
      </div>

      <div className={`mt-4 overflow-hidden rounded-[22px] border border-[rgba(11,31,51,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] ${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const Icon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];
            const isActive = index === activeStep;
            const [keyword, subkeyword] = getKeywordSet(step, index);

            return (
              <button
                key={`${index}-${step}`}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`group relative flex min-w-[96px] shrink-0 flex-col items-start rounded-[18px] border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-[rgba(207,175,90,0.34)] bg-[rgba(207,175,90,0.1)] shadow-[0_10px_22px_rgba(11,31,51,0.06)]"
                    : "border-[rgba(11,31,51,0.06)] bg-white hover:border-[rgba(11,31,51,0.12)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-[rgba(207,175,90,0.16)] text-[var(--dp-navy)]" : "bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]"}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/44">
                    {index + 1}
                  </div>
                </div>
                <div className="mt-3 text-[12px] font-semibold text-foreground">{keyword}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{subkeyword}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[rgba(11,31,51,0.08)]">
          <motion.div
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="h-full rounded-full bg-[var(--dp-gold-muted)]"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeStep}-${activeCopy}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-4 rounded-[18px] bg-[rgba(248,250,252,0.82)] px-4 py-3"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
              Step {activeStep + 1}
            </div>
            <div className={`mt-2 text-muted-foreground ${compact ? "text-[12px] leading-6" : "text-[13px] leading-6"}`}>
              {activeCopy}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
