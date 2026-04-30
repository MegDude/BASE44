import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function HomeFeaturedExample({ copy, example }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="pt-0">
      <div className="overflow-hidden rounded-[28px] bg-[var(--dp-navy,#111827)] text-white shadow-[0_30px_90px_rgba(7,27,47,0.18)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-[240px] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 md:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {example.subtitle}
            </div>
            <h3 className="mt-4 font-heading text-[2rem] font-semibold tracking-[-0.04em]">{example.title}</h3>
            <p className="mt-3 text-[15px] leading-8 text-white/76">{example.body}</p>
          </div>
          <div className="flex flex-col justify-between border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/58">
                Nearby answer
              </div>
              <p className="mt-3 text-[15px] leading-8 text-white/76">{example.detail}</p>
            </div>
            <div className="mt-6">
              <Link
                to={example.href}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
              >
                {example.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
