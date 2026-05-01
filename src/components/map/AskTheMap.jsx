import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

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
      className={`min-w-0 rounded-[18px] bg-[rgba(255,255,255,0.78)] p-2.5 shadow-[0_18px_60px_rgba(11,31,51,0.10)] ring-1 ring-[rgba(11,31,51,0.06)] backdrop-blur-xl transition-all duration-300 md:rounded-[20px] ${
        compact ? "md:p-3" : "md:p-4"
      } ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[rgba(11,31,51,0.46)] md:text-[11px]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold,#cfaf5a)]" />
        Ask the Map
      </div>

      <form onSubmit={submit} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-h-[42px] min-w-0 items-center gap-2 rounded-[12px] bg-[rgba(255,255,255,0.92)] px-3 ring-1 ring-[rgba(11,31,51,0.07)] transition focus-within:ring-[rgba(207,175,90,0.45)] md:min-h-[44px]">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--dp-gold,#cfaf5a)]" />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange && onChange(event.target.value)}
            placeholder={placeholder}
            inputMode="search"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.34)] md:text-[14px]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[42px] w-full items-center justify-center rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_34px_rgba(11,31,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--dp-gold,#cfaf5a)] hover:text-[var(--dp-navy,#0B1F33)] active:translate-y-0 sm:w-auto md:min-h-[44px] md:px-5"
        >
          {primaryActionLabel}
        </button>
        {secondaryAction?.href ? (
          <Link
            to={secondaryAction.href}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[12px] bg-[rgba(11,31,51,0.06)] px-4 text-[12px] font-semibold text-[var(--dp-navy)] transition hover:bg-[rgba(207,175,90,0.16)] sm:col-span-2"
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
                className="shrink-0 whitespace-nowrap rounded-[11px] bg-[rgba(11,31,51,0.05)] px-3 py-2 text-[11px] font-semibold text-[rgba(11,31,51,0.72)] transition hover:bg-[rgba(207,175,90,0.16)] hover:text-[var(--dp-navy)]"
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
                className={`shrink-0 whitespace-nowrap rounded-[11px] px-3 py-2 text-[11px] font-semibold transition ${
                  activeFilter === id
                    ? "bg-[var(--dp-navy,#0B1F33)] text-white shadow-[0_10px_28px_rgba(11,31,51,0.14)]"
                    : "bg-white/70 text-[rgba(11,31,51,0.62)] ring-1 ring-[rgba(11,31,51,0.06)] hover:bg-[rgba(207,175,90,0.12)] hover:text-[var(--dp-navy)]"
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
