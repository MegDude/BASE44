import { useState } from "react";
import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";
import { Link } from "react-router-dom";

export default function SegmentSwitcher({ segments = [], eyebrow, title, description }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSegment = segments[activeIndex];

  function renderSegment(segment) {
    return (
      <div className="border-t border-[rgba(11,31,51,0.08)] pt-5 md:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
            {segment.eyebrow || segment.label}
          </div>
          {segment.linkLabel && segment.href ? (
            <Link
              to={segment.href}
              className="text-[12px] font-medium text-[rgba(11,31,51,0.64)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              {segment.linkLabel}
            </Link>
          ) : null}
        </div>
        <h3 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.4rem]">
          {segment.headline || segment.label}
        </h3>
        <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
          {segment.content || segment.body}
        </p>

        {segment.practice ? (
          <div className="mt-7 border-t border-[rgba(11,31,51,0.08)] pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
              Value in practice
            </div>
            <p className="mt-2 text-[14px] leading-7 text-[rgba(11,31,51,0.72)]">{segment.practice}</p>
          </div>
        ) : null}

        {segment.detailsTitle && Array.isArray(segment.details) && segment.details.length ? (
          <div className="mt-7 border-t border-[rgba(11,31,51,0.08)] pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
              {segment.detailsTitle}
            </div>
            <div className="mt-3 grid gap-2">
              {segment.details.map((item) => (
                <div key={item} className="text-[14px] leading-7 text-[rgba(11,31,51,0.72)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <SectionContainer width="wide">
      <section>
        <SectionHeader
          eyebrow={eyebrow || "Who it serves"}
          title={title || "One system, shared across roles."}
          description={description}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden overflow-x-auto pb-2 lg:block lg:overflow-visible">
            <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
              {segments.map((segment, index) => (
                <button
                  key={segment.label}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={activeIndex === index}
                  className={`rounded-full px-4 py-2 text-left text-[12px] font-medium transition-all lg:rounded-full lg:px-0 lg:py-3 ${
                    activeIndex === index
                      ? "bg-[#10233b] text-white shadow-[0_10px_24px_rgba(16,35,59,0.12)] lg:bg-transparent lg:text-[var(--dp-navy,#0B1F33)] lg:shadow-none"
                      : "bg-white/55 text-[rgba(11,31,51,0.68)] hover:text-[var(--dp-navy,#0B1F33)] lg:bg-transparent"
                  }`}
                >
                  {segment.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            {renderSegment(activeSegment)}
          </div>

          <div className="lg:hidden">
            <div className="divide-y divide-[rgba(11,31,51,0.08)] border-t border-[rgba(11,31,51,0.08)]">
              {segments.map((segment, index) => {
                const isOpen = activeIndex === index;

                return (
                  <div key={segment.label}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span className="text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">{segment.label}</span>
                      <span className="text-[18px] leading-none text-[rgba(11,31,51,0.46)]">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen ? renderSegment(segment) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </SectionContainer>
  );
}
