import SectionShell from "@/components/shared/SectionShell";

export default function HomeProductSection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Nearby", body: "The closest useful answers stay in one downtown surface." },
          { label: "Live", body: "What is open, active, and happening now stays readable." },
          { label: "Ready", body: "Save, RSVP, redeem, or keep moving without starting over." },
        ].map((item) => (
          <div key={item.label} className="border-t border-[rgba(15,23,42,0.08)] pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {item.label}
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">{item.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
