import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { PartnerTypeConfig } from "@/content/partnerTypes";

interface PartnerTypeCardProps {
  partner: PartnerTypeConfig;
  variant?: "overview" | "compact" | "featured";
}

export function PartnerTypeCard({ partner, variant = "overview" }: PartnerTypeCardProps) {
  if (variant === "compact") {
    return (
      <Link
        to={partner.href}
        className="group flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
      >
        <span className="text-xs font-medium text-amber-400/70 uppercase tracking-widest">
          {partner.layerLabel}
        </span>
        <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
          {partner.label}
        </span>
        <span className="text-xs text-slate-400 line-clamp-2">{partner.summary}</span>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        to={partner.href}
        className="group relative flex flex-col gap-5 p-7 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-sm transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-[0.12em]">
              {partner.layerLabel}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{partner.label}</h3>
          <p className="text-sm text-slate-300/80 leading-relaxed">{partner.summary}</p>
          <p className="text-xs font-medium text-amber-300/70">{partner.highlight}</p>
        </div>
      </Link>
    );
  }

  // Default: overview variant
  return (
    <Link
      to={partner.href}
      className="group flex flex-col gap-4 p-6 rounded-2xl border border-slate-200/10 bg-slate-50/[0.03] hover:bg-slate-50/[0.06] backdrop-blur-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-amber-500/70 uppercase tracking-[0.14em]">
            {partner.eyebrow}
          </span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {partner.label}
          </h3>
        </div>
        <ArrowRight className="w-4 h-4 shrink-0 mt-1 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all duration-150" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300/80 leading-relaxed">
        {partner.summary}
      </p>
      <p className="text-xs font-medium text-amber-600 dark:text-amber-400/80">
        {partner.highlight}
      </p>
    </Link>
  );
}
