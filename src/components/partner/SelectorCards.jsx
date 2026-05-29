import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * SelectorCards — Unified component for selecting partner types, formats, or use cases
 */
export default function SelectorCards({
  items = [],
  selectedId,
  onSelect,
  columns = 3,
}) {
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-4`}>
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          onClick={() => onSelect?.(item)}
          className={`text-left p-5 rounded-lg border transition-all duration-200 ${
            selectedId === item.id
              ? 'border-[#0B1F33] bg-[#0B1F33] text-white shadow-lg'
              : 'border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:border-[#B38F4F]/45 hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="text-[14px] font-semibold leading-snug flex-1">{item.label}</div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                selectedId === item.id ? 'rotate-90' : ''
              }`}
            />
          </div>

          {item.description && (
            <div
              className={`text-[13px] leading-relaxed ${
                selectedId === item.id ? 'text-white/80' : 'text-[#0B1F33]/58'
              }`}
            >
              {item.description}
            </div>
          )}

          {item.stats && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-current border-opacity-10">
              {item.stats.map((stat, j) => (
                <div key={j} className="text-[11px]">
                  <div className="font-semibold">{stat.value}</div>
                  <div className={selectedId === item.id ? 'text-white/60' : 'text-[#0B1F33]/50'}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}