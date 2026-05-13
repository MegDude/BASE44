import { Lightbulb, ChevronRight } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: 1, title: 'Extend your offer window to 5–9 PM', reason: 'Resident traffic peaks between 5 and 9 PM on weekdays. Your current offer ends at 6 PM.', impact: 'High impact', action: 'Edit offer' },
  { id: 2, title: 'Add a 5–7 PM weekday event', reason: 'Happy hour slots in your district have 3× higher conversion than dinner-only offers.', impact: 'High impact', action: 'Add event' },
  { id: 3, title: 'Feature your venue in a district route', reason: 'Venues in curated routes get 40% more map impressions per week.', impact: 'Medium impact', action: 'Request feature' },
  { id: 4, title: 'Update your perk description', reason: 'Listings with detailed perk descriptions see 22% higher redemption rates.', impact: 'Medium impact', action: 'Edit perk' },
];

export default function RecommendationPanel() {
  return (
    <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }} role="region" aria-label="Recommendations">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="h-4 w-4" style={{ color: 'var(--dp-gold)' }} aria-hidden="true" />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--dp-navy)' }}>What to change next</h3>
      </div>
      <div className="space-y-4" role="list">
        {RECOMMENDATIONS.map(rec => (
          <div key={rec.id} className="pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--dp-border)' }} role="listitem">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--dp-navy)' }}>{rec.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--dp-slate)' }}>{rec.reason}</p>
              </div>
              <span className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5" style={{ backgroundColor: rec.impact === 'High impact' ? 'rgba(207,175,90,0.12)' : 'var(--dp-bg)', color: rec.impact === 'High impact' ? 'var(--dp-gold)' : 'var(--dp-slate)' }}>
                {rec.impact}
              </span>
            </div>
            <button type="button" className="mt-2 text-xs font-medium flex items-center gap-1 transition hover:underline focus:outline-none focus-visible:underline" style={{ color: 'var(--dp-navy)' }}>
              {rec.action} <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
