export default function DiscoverTab({ onDrawerStateChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Discover Places</h3>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-white/65 backdrop-blur border border-white/64 cursor-pointer hover:bg-white/75 transition-colors">
          <p className="font-medium text-slate-900">Discovery #{i}</p>
          <p className="text-xs text-slate-600 mt-1">New perk unlocked</p>
        </div>
      ))}
    </div>
  );
}
