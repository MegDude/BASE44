import type { WaterlooParkPin } from "@/data/waterlooParkInventory";

export default function WaterlooParkCard({ pin }: { pin: WaterlooParkPin }) {
  return (
    <article className="rounded-[8px] border border-[#0B1F33]/[0.08] bg-white p-4">
      <p className="text-[#BFA46A] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{pin.category}</p>
      <h3 className="mt-2 text-[16px] font-semibold text-[#0B1F33]">{pin.name}</h3>
      <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/66">{pin.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pin.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-[5px] border border-[#0B1F33]/[0.08] px-2 py-1 text-[10px] font-medium text-[#0B1F33]/58">{tag}</span>
        ))}
      </div>
    </article>
  );
}
