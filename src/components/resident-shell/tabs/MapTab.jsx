export default function MapTab({ onDrawerStateChange }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-gradient-to-br from-white/40 to-slate-50/40 border border-white/40">
        <h3 className="font-semibold text-slate-900 mb-2">Ask the Map</h3>
        <input
          type="text"
          placeholder="What are you looking for?"
          className="w-full px-3 py-2 rounded-lg bg-white/65 backdrop-blur border border-white/64 text-slate-900 placeholder:text-slate-500"
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Popular Now</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-white/65 backdrop-blur border border-white/64">
            <p className="text-sm font-medium text-slate-900">Place #{i}</p>
            <p className="text-xs text-slate-600 mt-1">Walking distance available</p>
          </div>
        ))}
      </div>
    </div>
  );
}
