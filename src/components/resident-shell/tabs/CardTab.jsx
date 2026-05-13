export default function CardTab({ onDrawerStateChange }) {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
        <p className="text-xs uppercase tracking-wider opacity-70 mb-4">Downtown Perks Card</p>
        <p className="text-2xl font-bold font-display tracking-tight">****  ****  ****  1234</p>
        <div className="flex justify-between mt-6 text-xs">
          <div>
            <p className="opacity-70">Cardholder</p>
            <p className="font-semibold">Your Name</p>
          </div>
          <div className="text-right">
            <p className="opacity-70 uppercase">Valid</p>
            <p className="font-semibold">12/26</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-white/65 backdrop-blur border border-white/64">
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Recent Redemptions</h3>
        {[1, 2].map((i) => (
          <div key={i} className="py-2 border-t border-white/40 text-xs">
            <p className="font-medium text-slate-900">Redemption #{i}</p>
            <p className="text-slate-600 mt-1">May 10, 2026</p>
          </div>
        ))}
      </div>
    </div>
  );
}
