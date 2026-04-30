import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { ROUTES } from "@/lib/routes";

export default function PartnerExamplesGrid({ copy, examples }) {
  const [expanded, setExpanded] = useState(false);
  const visibleExamples = useMemo(
    () => (expanded ? examples : examples.slice(0, 8)),
    [examples, expanded]
  );

  return (
    <SectionShell id="partner-examples" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleExamples.map((example) => (
          <Link
            key={example.name}
            to={example.href}
            className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5 transition hover:-translate-y-[1px]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {example.type}
            </div>
            <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {example.name}
            </h3>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {examples.length > 8 ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
          >
            {expanded ? "Show fewer" : "Show more"}
          </button>
        ) : null}
        <Link
          to={ROUTES.brands}
          className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
        >
          {copy.cta}
        </Link>
      </div>
    </SectionShell>
  );
}
