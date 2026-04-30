import SectionShell from "@/components/shared/SectionShell";

export default function HomeNearbyDiscovery({ copy, groups }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-5 md:grid-cols-3">
        {groups.map((group) => (
          <div key={group.label} className="border-t border-[rgba(15,23,42,0.08)] pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {group.label}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-[40px] items-center rounded-[14px] bg-white/82 px-4 py-2 text-[13px] font-semibold text-[var(--dp-navy,#111827)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
