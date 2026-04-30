export default function StepRow({
  number,
  title,
  body,
  active = false,
  onHover = null,
  onLeave = null,
  onSelect = null,
}) {
  return (
    <button
      type="button"
      onMouseEnter={onHover || undefined}
      onMouseLeave={onLeave || undefined}
      onFocus={onHover || undefined}
      onBlur={onLeave || undefined}
      onClick={onSelect || undefined}
      className={`w-full border-l-2 px-0 py-4 text-left transition-all duration-200 ${
        active
          ? "border-[var(--dp-gold,#CFAF5A)] pl-4"
          : "border-transparent pl-4 hover:border-[rgba(11,31,51,0.12)]"
      }`}
    >
      <div className="pr-1">
        <div className="flex items-baseline gap-3">
          <span className={`text-[0.95rem] font-semibold ${
            active ? "text-[var(--dp-gold-deep,#A97816)]" : "text-[rgba(11,31,51,0.46)]"
          }`}>
            {number}
          </span>
          <h3 className="text-[1.02rem] font-semibold text-[var(--dp-navy,#0B1F33)]">
            {title}
          </h3>
        </div>
        <p className="mt-2 pl-[calc(0.95rem+0.75rem)] text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
          {body}
        </p>
      </div>
    </button>
  );
}
