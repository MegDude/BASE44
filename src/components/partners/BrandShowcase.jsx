import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function BrandShowcase({ copy, items }) {
  return (
    <SectionShell id="brand-showcase" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] p-6">
          <h3 className="text-[1.15rem] font-semibold text-[var(--dp-navy,#111827)]">{copy.groups[0].title}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.groups[0].body}</p>
          <div className="mt-5 grid gap-3">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="rounded-[20px] border border-[rgba(15,23,42,0.10)] bg-white p-4 transition hover:-translate-y-[1px]"
              >
                <div className="text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{item.name}</div>
                <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <h3 className="text-[1.15rem] font-semibold text-[var(--dp-navy,#111827)]">{copy.groups[1].title}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.groups[1].body}</p>
          <div className="mt-5 rounded-[24px] bg-[var(--dp-navy,#111827)] p-5 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              District and venue showcase
            </div>
            <p className="mt-3 text-[14px] leading-7 text-white/76">
              Use the district and venue layer when the pitch needs corridor context, live nearby proof, and a clearer view of how buildings, venues, and campaigns overlap.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
