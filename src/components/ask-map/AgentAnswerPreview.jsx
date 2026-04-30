export default function AgentAnswerPreview({ response }) {
  if (!response) return null;

  return (
    <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-[var(--dp-navy,#111827)] p-5 text-white shadow-[0_18px_44px_rgba(17,24,39,0.12)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
        Agent answer
      </div>
      <p className="mt-3 text-[15px] leading-7 text-white/84">
        {response.summary || response.intent?.explanation || "The map has been updated with a better downtown view."}
      </p>
      {response.recommendedAction ? (
        <div className="mt-4 inline-flex rounded-full bg-[rgba(207,175,90,0.18)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#cfaf5a)]">
          {response.recommendedAction}
        </div>
      ) : null}
    </div>
  );
}

