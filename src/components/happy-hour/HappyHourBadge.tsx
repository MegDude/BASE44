type HappyHourBadgeProps = {
  state?: "Live Now" | "Starting Soon" | "Tonight" | "Featured" | "Needs Review";
};

export default function HappyHourBadge({ state = "Tonight" }: HappyHourBadgeProps) {
  return (
    <span className="inline-flex h-6 items-center rounded-[6px] border border-[#0B1F33]/[0.08] bg-white px-2 text-[10px] uppercase text-[#0B1F33]/64 text-[11px] font-bold uppercase tracking-normal">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-[2px] bg-[#BFA46A]" />
      {state}
    </span>
  );
}
