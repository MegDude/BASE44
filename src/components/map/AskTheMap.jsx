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

  function handlePromptClick(prompt) {
    const query = typeof prompt === "string" ? prompt : prompt.query || prompt.label || "";
    if (!query) return;
    if (onChange) onChange(query);
    if (onSubmit) onSubmit(query);
  }

  return (
    <div className={`rounded-[24px] border border-[rgba(255,255,255,0.62)] bg-[rgba(255,255,255,0.58)] shadow-[var(--dp-shadow-glow)] backdrop-blur-xl ${compact ? "p-3" : "p-4 md:p-5"} ${className}`}>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">Ask the Map</div>

      <form onSubmit={submit} className={`flex gap-2 ${compact ? "flex-col sm:flex-row" : "flex-col lg:flex-row"}`}>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange && onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[48px] flex-1 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.86)] px-4 text-[14px] font-medium text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.34)]"
        />
        <button type="submit" className="dp-cta-primary min-h-[48px] px-5 text-sm normal-case tracking-normal">{primaryActionLabel}</button>
        {secondaryAction?.href ? <Link to={secondaryAction.href} className="dp-cta-secondary min-h-[48px] px-5 text-sm normal-case tracking-normal">{secondaryAction.label}</Link> : null}
      </form>

      {quickPrompts.length ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 dp-no-scrollbar">
          {quickPrompts.map((prompt) => {
            const label = typeof prompt === "string" ? prompt : prompt.label || prompt.title || prompt.query;
            return <button key={label} type="button" onClick={() => handlePromptClick(prompt)} className="dp-chip whitespace-nowrap text-[11px]">{label}</button>;
          })}
        </div>
      ) : null}

      {filters.length ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 dp-no-scrollbar">
          {filters.map((filter) => {
            const id = filter.id || filter.label;
            return <button key={id} type="button" onClick={() => onFilterChange && onFilterChange(id)} className={`dp-chip whitespace-nowrap text-[12px] ${activeFilter === id ? "dp-chip-active" : ""}`}>{filter.label}</button>;
          })}
        </div>
      ) : null}
    </div>
  );
}
