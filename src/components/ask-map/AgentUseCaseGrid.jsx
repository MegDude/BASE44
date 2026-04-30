const useCases = [
  {
    label: "Resident answer",
    title: "Best low-key dinner within 5 minutes",
    summary: "A short list of quieter dinner spots that are easy to walk to right now.",
    status: "Live now",
  },
  {
    label: "Partner answer",
    title: "Which venues are converting tonight?",
    summary: "Shows where scans, saves, and redemptions are clustering across the district.",
    status: "Tonight",
  },
  {
    label: "Property answer",
    title: "What perks should we send residents this weekend?",
    summary: "Pulls together nearby events, partner offers, and easy weekend options.",
    status: "Weekend plan",
  },
  {
    label: "Civic answer",
    title: "Where is event activity concentrated downtown?",
    summary: "Highlights districts where programming is already creating movement.",
    status: "District view",
  },
];

export default function AgentUseCaseGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {useCases.map((item) => (
        <div
          key={item.title}
          className="rounded-[22px] border border-[rgba(17,24,39,0.08)] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(17,24,39,0.05)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-muted,#6b7280)]">
            {item.label}
          </div>
          <h3 className="mt-3 text-[1.2rem] font-semibold tracking-[-0.02em] text-[var(--dp-navy,#111827)]">
            {item.title}
          </h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--dp-muted,#6b7280)]">{item.summary}</p>
          <div className="mt-4 inline-flex rounded-full bg-[rgba(207,175,90,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-navy,#111827)]">
            {item.status}
          </div>
        </div>
      ))}
    </div>
  );
}

