import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

export default function DowntownPerksHero({
  eyebrow,
  title,
  titleAccent,
  lead,
  support,
  primary,
  primaryHref,
  secondary,
  secondaryHref,
  image,
  imageAlt,
  imageLabel,
  before,
  className = "",
}) {
  return (
    <section className={cn("relative overflow-hidden bg-white px-5 py-16 text-[#0B1F33] md:px-8 md:py-24", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179,143,79,0.16),transparent)]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[8%] top-[18%] h-48 w-48 bg-[#B38F4F]/10 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease }}
          className="max-w-[820px]"
        >
          {before}
          {eyebrow && (
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-[#B38F4F] md:text-[12px]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 max-w-[1100px] font-heading text-[42px] font-semibold leading-[0.98] tracking-[-0.03em] text-[#0B1F33] max-[420px]:text-[38px] md:text-[58px] md:leading-[0.96] lg:text-[64px]">
            <span>{title}</span>
            {titleAccent && <span className="text-[#B38F4F]"> {titleAccent}</span>}
          </h1>
          {lead && (
            <p className="mt-6 max-w-[680px] font-body text-[20px] font-light leading-[1.55] tracking-[-0.005em] text-[#5F6B7A] md:text-[26px] md:leading-[1.55]">
              {lead}
            </p>
          )}
          {support && (
            <div className="mt-9 max-w-[790px] space-y-6">
              {Array.isArray(support)
                ? support.map((item) => (
                    <p key={item} className="font-body text-[17px] font-light leading-[1.68] tracking-[-0.005em] text-[#6D7886] md:text-[22px] md:leading-[1.62]">
                      {item}
                    </p>
                  ))
                : (
                    <p className="font-body text-[17px] font-light leading-[1.68] tracking-[-0.005em] text-[#6D7886] md:text-[22px] md:leading-[1.62]">
                      {support}
                    </p>
                  )}
            </div>
          )}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primary && (
                <Link
                  to={primaryHref}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-5 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(11,31,51,0.10)] transition hover:-translate-y-px hover:shadow-[0_14px_32px_rgba(11,31,51,0.12),0_0_28px_rgba(179,143,79,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  {primary}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 text-[#B38F4F]" />
                </Link>
              )}
              {secondary && (
                <Link
                  to={secondaryHref}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-white/72 px-5 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B1F33] shadow-[0_10px_26px_rgba(11,31,51,0.045),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md transition hover:-translate-y-px hover:bg-white/88 hover:shadow-[0_12px_28px_rgba(11,31,51,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  {secondary}
                </Link>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-white/82 shadow-[0_24px_70px_rgba(11,31,51,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md md:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src={image}
              alt={imageAlt}
              className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
              style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
            />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,51,0.02),rgba(11,31,51,0.12))]" />
            {imageLabel && (
              <div className="absolute bottom-4 left-4 bg-white/76 px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B1F33] shadow-[0_12px_34px_rgba(11,31,51,0.08),inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-md">
                {imageLabel}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
