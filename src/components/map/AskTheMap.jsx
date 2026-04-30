import { Link } from "react-router-dom";

export default function AskTheMap({
  value = "",
  onChange,
  onSubmit,
  quickPrompts = [],
  filters = [],
  activeFilter = "all",
  onFilterChange,
  mode = "hero",
  placeholder = "Search places, events, or perks",
  primaryActionLabel = "Ask",
  secondaryAction,
  className = "",
}) {
  const compact = mode === "compact";

  function submit(event) {
    event.preventDefault();
    if (onSubmit) onSubmit(value);
  }

  function handlePrompt(prompt) {
    const query = typeof prompt === "string" ? prompt : prompt.query || prompt.label || "";
    if (!query) return;
    if (onChange) onChange(query);
    if (onSubmit) onSubmit(query);
  }

  return (
    <div
      className={`min-w-0 rounded-[22px] bg-[rgba(255,255,255,0.70)] p-3 shadow-[var(--dp-shadow-glass)] backdrop-blur-xl md:rounded-[24px] ${
        compact ? "md:p-3" : "md:p-5"
      } ${className}`}
    >
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[rgba(11,31,51,0.46)] md:text-[11px]">
        Ask the Map
      </div>

      <form onSubmit={submit} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange && onChange(event.target.value)}
          placeholder={placeholder}
          inputMode="search"
          className="min-h-[46px] min-w-0 rounded-[15px] bg-[rgba(255,255,255,0.9)] px-4 text-[14px] font-medium text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.34)]"
        />
        <button
          type="submit"
          className="dp-cta-primary min-h-[46px] w-full rounded-[15px] px-4 text-sm normal-case tracking-normal sm:w-auto"
        >
          {primaryActionLabel}
        </button>
        {secondaryAction?.href ? (
          <Link
            to={secondaryAction.href}
            className="dp-cta-primary min-h-[46px] rounded-[15px] px-4 text-sm normal-case tracking-normal sm:col-span-2"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </form>

      {quickPrompts.length ? (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 dp-no-scrollbar" aria-label="Suggested map searches">
          {quickPrompts.map((prompt) => {
            const label = typeof prompt === "string" ? prompt : prompt.label || prompt.title || prompt.query;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handlePrompt(prompt)}
                className="dp-chip min-h-[38px] shrink-0 whitespace-nowrap px-3 text-[11px]"
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {filters.length ? (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 dp-no-scrollbar" aria-label="Map filters">
          {filters.map((filter) => {
            const id = filter.id || filter.label;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFilterChange && onFilterChange(id)}
                className={`dp-chip min-h-[38px] shrink-0 whitespace-nowrap px-3 text-[12px] ${
                  activeFilter === id ? "dp-chip-active" : ""
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
