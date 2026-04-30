export default function AskMapCommand({
  value,
  onChange,
  onSubmit,
  loading = false,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-[rgba(255,255,255,0.72)] p-3 shadow-[0_14px_40px_rgba(17,24,39,0.08)] backdrop-blur-[18px]"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="Ask what you want to know, see, or do downtown..."
          className="h-[52px] flex-1 rounded-full bg-white/70 px-5 text-[15px] text-[var(--dp-text,#182033)] outline-none placeholder:text-[var(--dp-muted,#6b7280)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-[52px] min-w-[140px] items-center justify-center rounded-full bg-[var(--dp-navy,#111827)] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Ask the Map"}
        </button>
      </div>
    </form>
  );
}

