import SectionShell from "@/components/shared/SectionShell";

export default function HomeIntroSection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body="" className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="max-w-3xl">
          <p className="text-[17px] leading-8 text-[rgba(71,85,105,0.94)]">{copy.body}</p>
          <p className="mt-5 text-[17px] leading-8 text-[var(--dp-navy,#111827)]">{copy.support}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            "Nearby places that actually fit the moment.",
            "Events and perks that stay visible while you decide.",
            "Buildings and local context that keep the map useful.",
          ].map((line) => (
            <div
              key={line}
              className="rounded-[20px] bg-[rgba(255,255,255,0.56)] px-4 py-4 text-[14px] leading-7 text-[var(--dp-navy,#111827)]"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
