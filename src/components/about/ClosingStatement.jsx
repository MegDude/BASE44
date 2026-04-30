import SectionContainer from "@/components/SectionContainer";
import { Link } from "react-router-dom";

export default function ClosingStatement({ title, lines = [], actions = [] }) {
  return (
    <SectionContainer width="wide" className="pb-6">
      <section className="border-t border-[rgba(11,31,51,0.08)] pt-10">
        <h2 className="max-w-[12ch] font-heading text-[2.4rem] font-semibold leading-[0.96] tracking-[-0.045em] text-[var(--dp-navy,#0B1F33)] md:text-[3.4rem]">
          {title}
        </h2>
        <div className="mt-5 space-y-3 text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {actions.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
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
      </section>
    </SectionContainer>
  );
}
