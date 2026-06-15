import { useState } from "react";

const faqByMode = {
  resident: [
    ["What can I find?", "Nearby perks, events, places, listings, and useful downtown recommendations."],
    ["Do I need a card?", "Some offers use the Resident Pass. Others can be saved or opened directly on the map."],
    ["Can I save places?", "Yes. Save a place, event, offer, or listing and come back later."],
  ],
  partner: [
    ["What can I publish?", "Offers, events, visibility placements, surveys, and local recommendations."],
    ["What can I see?", "What people opened, saved, scanned, redeemed, and asked directions to."],
    ["Can I start small?", "Yes. Start with one clear offer or event, then build from what people use."],
  ],
};

export default function TwoSidedFAQHub() {
  const [mode, setMode] = useState<"resident" | "partner">("partner");
  const [open, setOpen] = useState(0);
  return (
    <section className="dp-two-sided-faq">
      <div className="dp-faq-mode-row" role="tablist" aria-label="FAQ audience">
        {(["partner", "resident"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => {
              setMode(item);
              setOpen(0);
            }}
          >
            {item === "partner" ? "Partner" : "Resident"}
          </button>
        ))}
      </div>
      {faqByMode[mode].map(([question, answer], index) => (
        <div key={question} className="dp-faq-item">
          <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>
            <span>{question}</span>
            <span>{open === index ? "Close" : "Open"}</span>
          </button>
          {open === index && <p>{answer}</p>}
        </div>
      ))}
    </section>
  );
}

