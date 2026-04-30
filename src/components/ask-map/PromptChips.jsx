export default function PromptChips({ prompts = [], onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect?.(prompt)}
          className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--dp-navy,#111827)] transition hover:bg-white"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

