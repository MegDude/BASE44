import type { WaterlooParkPin } from "@/data/waterlooParkInventory";

export default function WaterlooDrawerSection({ pin, nearby = [] }: { pin: WaterlooParkPin; nearby?: WaterlooParkPin[] }) {
  return (
    <section className="rounded-[8px] border border-[#0B1F33]/[0.08] bg-white p-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56">Waterloo Park</h3>
      <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-[#0B1F33]/68">{pin.drawerCopy}</p>
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">Good for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pin.tags.map((tag) => (
            <span key={tag} className="rounded-[5px] border border-[#0B1F33]/[0.08] px-2 py-1 text-[10px] font-medium text-[#0B1F33]/58">{tag}</span>
          ))}
        </div>
      </div>
      {nearby.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">Nearby</p>
          <div className="mt-2 space-y-1 text-[12px] text-[#0B1F33]/64">
            {nearby.slice(0, 4).map((item) => <p key={item.id}>{item.name}</p>)}
          </div>
        </div>
      )}
    </section>
  );
}
