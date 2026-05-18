import { useState } from 'react';
import MapShell from '../system/MapShell';
import FloatingHeader from '../system/FloatingHeader';
import CategoryStrip from '../system/CategoryStrip';
import ActiveSheet from '../system/ActiveSheet';

export default function Home() {
  const [active, setActive] = useState(null);

  return (
    <MapShell>
      <FloatingHeader />
      <div className="absolute bottom-8 left-0 right-0 flex flex-col gap-4">
        <CategoryStrip onSelect={(cat) => console.log("Filtering:", cat)} />
        {!active && (
          <button 
            className="mx-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 text-xs pointer-events-auto"
            onClick={() => setActive({
              title: "Rainey Street Food + Drink Loop",
              category: "Perk",
              description: "The legendary partner walkabout. Hit 4 stops to unlock exclusive rewards."
            })}
          >
            Tap a map pin to see details
          </button>
        )}
      </div>
      <ActiveSheet data={active} onClose={() => setActive(null)} />
    </MapShell>
  );
}
