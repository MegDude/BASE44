import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { ROUTES } from "@/lib/routes";

export default function PartnerEventsPreview({ copy, events }) {
  return (
    <SectionShell id="events" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            Live map agent
          </div>
          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
            {copy.agentTitle}
          </h3>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.agentBody}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {copy.prompts.map((prompt) => (
              <Link
                key={prompt}
                to={`${ROUTES.events}?mode=ask&query=${encodeURIComponent(prompt)}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.9)] px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy,#111827)]"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.title} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  {event.date}
                </div>
                <div className="rounded-full bg-[rgba(247,247,251,0.9)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  {event.category}
                </div>
              </div>
              <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
                {event.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{event.location}</p>
              <p className="mt-1 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{event.going}</p>
              <p className="mt-1 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{event.time}</p>
              <div className="mt-4">
                <Link
                  to={ROUTES.events}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-[var(--dp-navy,#111827)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {event.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
