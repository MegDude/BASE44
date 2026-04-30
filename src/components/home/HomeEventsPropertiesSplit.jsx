import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomeEventsPropertiesSplit({ copy, events, property }) {
  const openEvents = getSharedCta("openEvents");
  const openBuildings = getSharedCta("openBuildings");
  const featuredEvent = events[0];

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/88 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
            Live tonight
          </div>
          <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
            {featuredEvent.title}
          </h3>
          <p className="mt-2 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">
            {featuredEvent.date} · {featuredEvent.time} · {featuredEvent.location}
          </p>
          <p className="mt-4 text-[15px] leading-8 text-[rgba(71,85,105,0.94)]">{featuredEvent.body}</p>
          <div className="mt-5">
            <Link to={openEvents.href} className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              Open Events
            </Link>
          </div>
        </article>

        <article className="rounded-[28px] bg-[var(--dp-navy,#111827)] p-6 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
            Live here
          </div>
          <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em]">{property.title}</h3>
          <p className="mt-2 text-[14px] leading-7 text-white/70">{property.location}</p>
          <p className="mt-4 text-[15px] leading-8 text-white/76">{property.body}</p>
          <div className="mt-5">
            <Link to={openBuildings.href} className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {property.ctaLabel}
            </Link>
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
