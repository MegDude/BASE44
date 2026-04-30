import SectionShell from "@/components/shared/SectionShell";

export default function NearbySection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.cards.map((card) => (
          <article key={card.title} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.78)] p-5">
            <h3 className="text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{card.title}</h3>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
