import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsKPICard({ label, value, delta, deltaType, sparkline, onClick, loading }) {
  const isPositive = deltaType === 'positive';
  const isNegative = deltaType === 'negative';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`rounded-lg border border-border/50 bg-card/40 p-6 transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/30 hover:shadow-md' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
            {label}
          </span>
          {delta && (
            <div className={`flex items-center gap-1 text-[12px] font-medium ${
              isPositive ? 'text-[#B38F4F]' : isNegative ? 'text-[#0B1F33]/58' : 'text-muted-foreground'
            }`}>
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {delta}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
          ) : (
            <div className="text-4xl font-bold text-foreground tracking-normal">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          )}
        </div>

        {sparkline && (
          <div className="mt-4 h-10 opacity-60">
            {sparkline}
          </div>
        )}
      </div>
    </motion.div>
  );
}