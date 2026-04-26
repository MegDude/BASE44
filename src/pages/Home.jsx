import { Link } from 'react-router-dom';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';

export default function Home() {
  return (
    <main className="fixed inset-0 bg-[#f7f7fb] text-[#0b1f33]">
      <div className="absolute inset-0">
        <UnifiedMapShell className="w-full h-full" />
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-20 max-w-md rounded-3xl bg-white/85 p-6 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold leading-tight">Where downtown works like a system.</h1>
        <p className="mt-2 text-sm text-slate-600">Open the map, see what is useful nearby, and act in one tap.</p>
        <div className="mt-4 flex gap-3">
          <Link to="/downtown-perks/explore" className="rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white">Open the Map</Link>
          <Link to="/partners" className="rounded-full border px-5 py-3 text-sm">Partner</Link>
        </div>
      </div>
    </main>
  );
}
