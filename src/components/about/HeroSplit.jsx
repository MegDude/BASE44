import SectionContainer from "@/components/SectionContainer";
import { Link } from "react-router-dom";

export default function HeroSplit({
  eyebrow,
  title,
  subtitle,
  body = [],
  side = null,
  actions = [],
}) {
  return (
    <SectionContainer width="wide" className="pt-6 md:pt-10">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
        <header className="max-w-[820px]">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-[12ch] font-heading text-[2.9rem] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--dp-navy,#0B1F33)] md:text-[5rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-[680px] text-[1.05rem] font-medium leading-7 text-[rgba(11,31,51,0.8)] md:text-[1.18rem]">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-6 max-w-[720px] space-y-4 text-[16px] leading-8 text-[rgba(11,31,51,0.7)]">
            {body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {actions.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={
                    action.variant === "secondary"
                      ? "inline-flex min-h-11 items-center rounded-full border border-[rgba(11,31,51,0.08)] px-5 text-[13px] font-medium text-[rgba(11,31,51,0.72)] transition hover:border-[rgba(11,31,51,0.14)] hover:text-[var(--dp-navy,#0B1F33)]"
                      : "inline-flex min-h-11 items-center rounded-full bg-[var(--dp-navy,#0B1F33)] px-5 text-[13px] font-semibold text-white transition hover:opacity-92"
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </header>
        {side ? <div>{side}</div> : null}
      </section>
    </SectionContainer>
  );
}
