import { useState } from "react";
import { Plus } from "lucide-react";

export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-[rgba(11,31,51,0.08)]">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `about-faq-panel-${index}`;
        const buttonId = `about-faq-button-${index}`;

        return (
          <div key={item.question}>
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={`flex w-full items-center justify-between gap-4 rounded-[18px] py-4 text-left transition-colors ${
                isOpen ? "text-[var(--dp-navy,#0B1F33)]" : "hover:bg-white/40"
              }`}
            >
              <span className="text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">
                {item.question}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy,#0B1F33)] transition-transform ${
                  isOpen ? "rotate-45" : "rotate-0"
                }`}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={isOpen ? "pb-4" : "hidden"}
            >
              <p className="max-w-[680px] text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
