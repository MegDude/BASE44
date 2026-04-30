import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function HomePricingSection({ copy, cards }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-white/88 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {card.label}
            </div>
            <h3 className="mt-3 text-[1rem] font-semibold text-[var(--dp-navy,#111827)]">{card.price}</h3>
            <p className="mt-3 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{card.audience}</p>
            <p className="mt-3 text-[14px] leading-7 text-[var(--dp-navy,#111827)]">{card.value}</p>
            <div className="mt-5">
              <Link to={card.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
                Learn more
              </Link>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.note}</p>
    </SectionShell>
  );
}
