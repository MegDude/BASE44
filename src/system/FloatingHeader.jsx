export default function FloatingHeader() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto">
      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/20">
        <div className="w-10 h-10 bg-[#0B1535] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-[#F2C14E] font-bold text-lg">B</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Austin: Downtown Layer</p>
          <p className="text-sm font-medium text-slate-800">Search places, events, perks...</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-white text-[#0B1535] font-semibold text-sm border border-slate-100 shadow-sm active:scale-95 transition-transform">
          Card
        </button>
      </div>
    </div>
  );
}
