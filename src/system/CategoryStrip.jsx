export default function CategoryStrip({ onSelect }) {
  const items = ['All', 'Coffee', 'Dining', 'Nightlife', 'Wellness', 'Perks'];
  
  return (
    <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pointer-events-auto pb-2">
      {items.map((item, i) => (
        <button 
          key={item} 
          onClick={() => onSelect?.(item)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95
            ${i === 0 
              ? 'bg-[#F2C14E] text-[#0B1535] shadow-md' 
              : 'bg-white/90 backdrop-blur-md text-slate-600 border border-white/40 shadow-sm'}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
