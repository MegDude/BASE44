import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomeEventsPreview({ copy, events }) {
  const featuredEvent = events[0];
  const listEvents = events.slice(1, 3);
  const openEvents = getSharedCta("openEvents");
  const happyHour = getSharedCta("happyHourMap");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="overflow-hidden rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white">
          <div className="h-48 bg-[linear-gradient(135deg,rgba(11,31,51,0.98),rgba(20,32,51,0.82))]" />
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              <span>{featuredEvent.date}</span>
              <span>{featuredEvent.time}</span>
              <span>{featuredEvent.category}</span>
            </div>
            <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {featuredEvent.title}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">
              {featuredEvent.location} · {featuredEvent.going}
            </p>
            <p className="mt-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{featuredEvent.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={openEvents.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-4 py-3 text-sm font-semibold text-white">
                {copy.primaryCta || openEvents.label}
              </Link>
              <Link to={happyHour.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
                {copy.secondaryCta || happyHour.label}
              </Link>
            </div>
          </div>
        </article>

        <div className="space-y-3">
          {listEvents.map((event) => (
            <article key={event.id} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.78)] p-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                <span>{event.date}</span>
                <span>{event.time}</span>
                <span>{event.category}</span>
              </div>
              <h4 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
                {event.title}
              </h4>
              <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{event.location}</p>
              <p className="mt-1 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{event.going}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
