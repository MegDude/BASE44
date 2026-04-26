import { useState } from "react";

export default function AudienceStoryPanel({ items = [] }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="dp-section-tight">
      <div className="dp-page-shell">
        <div className="dp-band p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="dp-eyebrow">How it unfolds</p>
              <h2 className="mt-2 dp-heading-modern text-3xl md:text-4xl">Less scrolling. More story.</h2>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => {
                const isOpen = open === index;

                return (
                  <div key={item.title} className="rounded-[20px] border border-[var(--dp-border)] bg-white/70">
                    <button
                      onClick={() => setOpen(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    >
                      <span className="font-semibold text-[var(--dp-navy)]">{item.title}</span>
                      <span>{isOpen ? "×" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm leading-6 text-[var(--dp-text-soft)]">
                        {item.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
