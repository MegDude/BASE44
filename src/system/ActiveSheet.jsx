export default function ActiveSheet({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-[#0B1535]/10 pointer-events-auto" 
        onClick={onClose} 
      />
      
      {/* The Drawer */}
      <div className="relative w-full bg-white/95 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] p-6 pt-0 pointer-events-auto animate-in slide-in-from-bottom duration-300">
        {/* Swipe Handle */}
        <div className="h-12 w-full flex justify-center items-center" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="flex justify-between items-start gap-4 mb-3">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            {data.title}
          </h2>
          <span className="bg-[#F2C14E] text-[#0B1535] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide whitespace-nowrap mt-1">
            {data.category}
          </span>
        </div>

        <p className="text-slate-600 mb-8 leading-relaxed text-[15px]">
          {data.description}
        </p>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 active:bg-slate-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button className="flex-1 bg-[#F2C14E] text-[#0B1535] h-12 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform">
            Go Now
          </button>
        </div>
      </div>
    </div>
  );
}
