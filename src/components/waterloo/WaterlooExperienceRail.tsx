import type { WaterlooParkPin } from "@/data/waterlooParkInventory";
import WaterlooParkCard from "./WaterlooParkCard";

export default function WaterlooExperienceRail({ pins }: { pins: WaterlooParkPin[] }) {
  return (
    <div className="dp-chip-row flex gap-3 overflow-x-auto pb-2">
      {pins.map((pin) => (
        <div key={pin.id} className="min-w-[260px] max-w-[320px]">
          <WaterlooParkCard pin={pin} />
        </div>
      ))}
    </div>
  );
}
