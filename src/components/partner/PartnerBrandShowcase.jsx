import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";

export default function PartnerBrandShowcase({ groups = [] }) {
  const [openGroup, setOpenGroup] = useState(groups[0]?.id || null);

  return (
    <section className="border-t border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
            Brand Showcase
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[var(--dp-navy,#0B1F33)] md:text-5xl">
            Keep proof examples separate from the general partner story.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
            These examples are for pitch context when relevant. They should not be carrying the core partner narrative on every page.
          </p>
        </div>

        <div className="space-y-3">
          {groups.map((group) => {
            const isOpen = openGroup === group.id;
            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white/42 backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
                >
                  <span>
                    <span className="block text-lg font-semibold tracking-[-0.03em] text-[var(--dp-navy,#0B1F33)]">
                      {group.label}
                    </span>
                    <span className="mt-1 block text-[13px] leading-5 text-[rgba(11,31,51,0.58)]">
                      {group.description}
                    </span>
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.58)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div className="grid gap-3 border-t border-[rgba(11,31,51,0.08)] px-5 py-5 md:grid-cols-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.route}
                        to={item.route}
                        className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-4 transition hover:bg-white"
                      >
                        <div className="text-sm font-semibold text-[var(--dp-navy,#0B1F33)]">{item.name}</div>
                        <div className="mt-2 text-[12px] leading-5 text-[rgba(11,31,51,0.58)]">
                          {item.summary}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(40,62%,42%)]">
                          Open example
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
