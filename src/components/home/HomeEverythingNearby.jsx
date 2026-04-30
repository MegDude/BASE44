import SectionShell from "@/components/shared/SectionShell";

export default function HomeEverythingNearby({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="pt-0">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-6 shadow-[0_24px_80px_rgba(7,27,47,0.08)] md:p-8">
        <div className="grid gap-4 md:grid-cols-4">
          {["Places", "Events", "Perks", "Buildings"].map((item) => (
            <div key={item} className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white/88 px-4 py-4 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
