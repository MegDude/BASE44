import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

function toDateFromLabel(label) {
  return new Date(`${label} 2026 12:00:00`);
}

function sameMonthDay(left, right) {
  return left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export default function HomeEventsPreview({ copy, events }) {
  const [selectedDate, setSelectedDate] = useState(toDateFromLabel(events[0]?.date || "Apr 13"));
  const matchingEvents = useMemo(
    () => events.filter((event) => sameMonthDay(toDateFromLabel(event.date), selectedDate)),
    [events, selectedDate]
  );
  const featuredEvent = matchingEvents[0] || events[0];
  const listEvents = events.filter((event) => event.id !== featuredEvent.id);
  const openEvents = getSharedCta("openEvents");
  const happyHour = getSharedCta("happyHourMap");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            {copy.calendarTitle}
          </div>
          <p className="mt-2 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.calendarBody}</p>
          <div className="mt-4 rounded-[20px] bg-[rgba(247,247,251,0.9)] p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to={happyHour.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {copy.secondaryCta || happyHour.label}
            </Link>
            <Link to={openEvents.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-4 py-3 text-sm font-semibold text-white">
              {copy.primaryCta || openEvents.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="overflow-hidden rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white">
            <img src={featuredEvent.image} alt={featuredEvent.title} className="h-56 w-full object-cover" />
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
              <div className="mt-5">
                <Link to={openEvents.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-4 py-3 text-sm font-semibold text-white">
                  Open events
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
                <div className="mt-4">
                  <Link to={openEvents.href} className="inline-flex min-h-[40px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 py-2 text-sm font-semibold text-[var(--dp-navy,#111827)]">
                    Open event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
