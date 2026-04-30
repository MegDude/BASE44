import { Filter, Search, Sparkles } from "lucide-react";

export default function MapSearchBar({
  value,
  onChange,
  onSubmit,
  onOpenFilters,
  placeholder = "Search downtown Austin...",
  eyebrow = "Where do you want to go?",
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-[22px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.78)] p-3 shadow-[0_18px_40px_rgba(6,16,34,0.12)] backdrop-blur-[18px] md:flex-row md:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(11,31,51,0.08)] text-[var(--dp-gold,#CFAF5A)]">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <label className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.82)]">
            {eyebrow}
          </span>
          <input
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            aria-label={eyebrow}
            className="mt-1 w-full bg-transparent text-sm text-[var(--dp-navy,#111827)] outline-none placeholder:text-[rgba(71,85,105,0.62)]"
          />
        </label>
      </div>
      <div className="flex gap-2 md:shrink-0">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-label="Open search filters"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white text-[var(--dp-navy,#111827)]"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#111827)] px-4 py-3 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" />
          Ask
        </button>
      </div>
    </form>
  );
}
