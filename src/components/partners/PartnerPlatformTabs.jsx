import SectionShell from "@/components/shared/SectionShell";

export default function PartnerPlatformTabs({ copy, roles, activeRole, onChange }) {
  return (
    <SectionShell id="partner-platform" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div role="tablist" aria-label="Partner roles" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              id={`tab-${role.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${role.id}`}
              onClick={() => onChange(role.id)}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                  : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)] hover:text-[var(--dp-navy,#111827)]"
              }`}
            >
              {role.label}
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}
