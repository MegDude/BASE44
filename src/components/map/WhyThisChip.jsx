/**
 * WhyThisChip — Explains why entity shows up
 * Attaches to: marker hover, drawer header, result cards
 * CRITICAL: Every visible entity must explain itself
 */

import { MapPin, Clock, Zap, Star, Users, TrendingUp } from 'lucide-react';

const REASON_CONFIG = {
  nearby: {
    icon: MapPin,
    label: (distance) => `${distance || '0'} min walk`,
    color: 'text-[#0B1F33] bg-[#F7F8FB]',
  },
  saved: {
    icon: Star,
    label: 'You saved this',
    color: 'text-[#0B1F33] bg-[#F7F8FB]/40',
  },
  campaign: {
    icon: Zap,
    label: 'Featured campaign',
    color: 'text-primary bg-primary/10',
  },
  event_now: {
    icon: Clock,
    label: 'Happening now',
    color: 'text-[#0B1F33] bg-[#F7F8FB]/40',
  },
  perk_match: {
    icon: TrendingUp,
    label: 'Perk available',
    color: 'text-[#0B1F33] bg-[#F7F8FB]/40',
  },
  trending: {
    icon: Users,
    label: 'Trending nearby',
    color: 'text-[#0B1F33] bg-[#F7F8FB]/40',
  },
};

export default function WhyThisChip({ reason, distance, variant = 'inline' }) {
  if (!reason) return null;

  const config = REASON_CONFIG[reason];
  if (!config) return null;

  const Icon = config.icon;
  const label = typeof config.label === 'function' ? config.label(distance) : config.label;

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {label}
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${config.color.split(' ')[0]}`} />
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </div>
    );
  }

  return null;
}
