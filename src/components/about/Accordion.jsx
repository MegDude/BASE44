import { useState } from "react";
import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";
import { Plus } from "lucide-react";

export default function Accordion({
  items = [],
  eyebrow,
  title,
  description,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <SectionContainer width="wide">
      <section>
        <SectionHeader
          eyebrow={eyebrow || "FAQ"}
          title={title || "Common questions"}
          description={description}
        />
        <div className="mt-6 divide-y divide-[rgba(11,31,51,0.08)]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `about-accordion-panel-${index}`;
            const buttonId = `about-accordion-button-${index}`;

            return (
              <div key={item.q}>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">{item.q}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)] transition-transform ${isOpen ? "rotate-45" : ""}`}>
                    <Plus className="h-4 w-4 text-[var(--dp-navy,#0B1F33)]" />
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={isOpen ? "pb-5" : "hidden"}
                >
                  <p className="max-w-[680px] text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SectionContainer>
  );
}
