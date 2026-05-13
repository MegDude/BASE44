export default function SavedTab({ onDrawerStateChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Saved Items</h3>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-white/65 backdrop-blur border border-white/64">
          <p className="font-medium text-slate-900">Saved #{i}</p>
          <p className="text-xs text-slate-600 mt-1">Added 3 days ago</p>
        </div>
      ))}
    </div>
  );
}
