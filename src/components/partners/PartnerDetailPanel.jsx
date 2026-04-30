import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PartnerDetailPanel({
  eyebrow,
  title,
  description,
  outcomes = [],
  metrics = [],
  kpis = [],
  route,
}) {
  return (
    <section className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.5))] p-6 shadow-[0_18px_40px_rgba(11,31,51,0.06)] md:p-8">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-[2rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.8rem]">
        {title}
      </h2>
      <p className="mt-4 max-w-[680px] text-[15px] leading-7 text-[rgba(11,31,51,0.7)]">
        {description}
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.42)]">
            What this unlocks
          </div>
          <div className="mt-4 space-y-3">
            {outcomes.map((outcome, index) => (
              <div
                key={outcome}
                className="flex items-start gap-3 border-b border-[rgba(11,31,51,0.08)] pb-3 last:border-b-0 last:pb-0"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(207,175,90,0.18)] text-[11px] font-semibold text-[var(--dp-gold-deep,#A97816)]">
                  {index + 1}
                </span>
                <span className="text-[14px] leading-6 text-[rgba(11,31,51,0.72)]">{outcome}</span>
              </div>
            ))}
          </div>

          {kpis.length > 0 ? (
            <div className="mt-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.42)]">
                What this proves
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {kpis.map((kpi) => (
                  <span
                    key={kpi}
                    className="inline-flex items-center rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.6)]"
                  >
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.42)]">
            Live indicators
          </div>
          <div className="mt-4 space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="border-b border-[rgba(11,31,51,0.08)] pb-3 last:border-b-0 last:pb-0"
              >
                <div className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)]">
                  {metric.value}
                </div>
                <div className="text-[12px] text-[rgba(11,31,51,0.56)]">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={route} className="dp-cta-primary">
              Open page
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/partners/apply" className="dp-cta-secondary">
              Apply
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
