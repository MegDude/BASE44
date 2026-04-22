export default function MapFilterBars({
  primaryOptions = [],
  secondaryOptions = [],
  activePrimary = "all",
  activeSecondary = [],
  onPrimarySelect,
  onSecondaryToggle,
  className = "",
}) {
  const activeSecondarySet = new Set(activeSecondary);

  return (
    <div className={className}>
      <div className="px-3 py-2.5 flex gap-2 overflow-x-auto border-b border-[rgba(11,31,51,0.08)] scrollbar-hide bg-white">
        {primaryOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activePrimary === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPrimarySelect?.(option.id)}
              className={`flex items-center gap-2 h-8 px-3 text-xs whitespace-nowrap font-medium rounded-[9px] transition-all border ${
                isActive
                  ? "bg-[#0B1F33] text-white border-[#0B1F33]"
                  : "bg-white text-[#0B1F33] border-[rgba(11,31,51,0.10)]"
              }`}
              style={{
                boxShadow: isActive
                  ? "0px 2px 6px rgba(11, 31, 51, 0.10)"
                  : "0px 1px 3px rgba(11, 31, 51, 0.05)",
              }}
            >
              {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>

      {secondaryOptions.length ? (
        <div className="px-3 py-2.5 flex gap-2 border-b border-[rgba(11,31,51,0.08)] bg-white flex-wrap">
          {secondaryOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeSecondarySet.has(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSecondaryToggle?.(option.id)}
                className={`flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-[9px] transition-all border ${
                  isActive
                    ? "bg-[#0B1F33] text-white border-[#0B1F33]"
                    : "bg-white text-[#0B1F33] border-[rgba(11,31,51,0.10)]"
                }`}
                style={{
                  boxShadow: isActive
                    ? "0px 2px 6px rgba(11, 31, 51, 0.10)"
                    : "0px 1px 3px rgba(11, 31, 51, 0.05)",
                }}
              >
                {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
