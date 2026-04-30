import AskMapCommand from "@/components/ask-map/AskMapCommand";
import PromptChips from "@/components/ask-map/PromptChips";
import AgentAnswerPreview from "@/components/ask-map/AgentAnswerPreview";

export default function AskMapHero({
  value,
  onChange,
  onSubmit,
  onPromptSelect,
  loading,
  response,
  prompts,
}) {
  return (
    <section className="px-4 pt-24 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(17,24,39,0.56)]">
            Ask the Map
          </div>
          <h1 className="mt-4 font-heading text-[clamp(2.6rem,6vw,4.6rem)] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#111827)]">
            Ask the map. Know where to go.
          </h1>
          <p className="mt-4 max-w-2xl text-[18px] leading-8 text-[var(--dp-muted,#6b7280)]">
            Downtown Perks turns live neighborhood data into simple answers. Ask what is happening nearby, where residents are moving, which offers are active, or what is converting right now.
          </p>
          <div className="mt-6">
            <AskMapCommand value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} />
          </div>
          <div className="mt-4">
            <PromptChips prompts={prompts} onSelect={onPromptSelect} />
          </div>
        </div>
        <div className="rounded-[32px] border border-[rgba(17,24,39,0.08)] bg-[linear-gradient(180deg,#172033,#111827)] p-6 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/56">
            Live downtown intelligence
          </div>
          <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.03em] text-white">
            A live downtown intelligence layer for residents, properties, venues, brands, and civic partners.
          </h2>
          <div className="mt-5">
            <AgentAnswerPreview response={response} />
          </div>
        </div>
      </div>
    </section>
  );
}

