export default function PartnerSelectorRail({ options = [], active, onChange }) {
  return (
    <div className="overflow-x-auto pb-2 lg:overflow-visible">
      <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
        {options.map((option) => {
          const isActive = active === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
              className={`rounded-full px-4 py-2 text-left text-[12px] font-medium transition-all lg:rounded-[18px] lg:px-4 lg:py-3 ${
                isActive
                  ? "bg-[#10233b] text-white shadow-[0_10px_24px_rgba(16,35,59,0.12)]"
                  : "bg-white/70 text-[rgba(11,31,51,0.66)] hover:text-[var(--dp-navy,#0B1F33)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
