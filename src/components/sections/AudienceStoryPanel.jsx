import { useState } from "react";

export default function AudienceStoryPanel({ items = [] }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="max-w-[420px]">
            <p className="dp-eyebrow">How it unfolds</p>
            <h2 className="mt-2 dp-heading-modern text-3xl md:text-4xl">Less scrolling. More story.</h2>
            <p className="mt-4 text-[14px] leading-7 text-[rgba(11,31,51,0.64)]">
              The partner story should move quickly: one system, clear roles, and a better read on how downtown actually gets used.
            </p>
          </div>

          <div className="border-t border-[rgba(11,31,51,0.08)]">
            {items.map((item, index) => {
              const isOpen = open === index;

              return (
                <div key={item.title} className="border-b border-[rgba(11,31,51,0.08)]">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    className="flex w-full items-start justify-between gap-4 py-4 text-left md:py-5"
                  >
                    <span className="pr-4 text-[1rem] font-semibold leading-6 text-[var(--dp-navy)] md:text-[1.06rem]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 text-[1.1rem] font-medium leading-none text-[rgba(11,31,51,0.52)]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="max-w-[680px] pb-5 text-[14px] leading-7 text-[var(--dp-text-soft)]">
                      {item.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
