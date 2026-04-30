import SectionShell from "@/components/shared/SectionShell";

export default function PropertiesPreviewSection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.properties.map((property) => (
          <article key={property} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              Residential
            </div>
            <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{property}</h3>
            <p className="mt-3 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">
              Nearby places, events, and perks tied to the same map people already use.
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
