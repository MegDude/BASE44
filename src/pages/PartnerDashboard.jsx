import { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import PartnerMapInsights from '@/components/dashboard/PartnerMapInsights';
import RedemptionTable from '@/components/dashboard/RedemptionTable';
import RecommendationPanel from '@/components/dashboard/RecommendationPanel';
import CTAButton from '@/components/ui/CTAButton';

const METRICS = [
  { label: 'Scans', value: '1,284', trend: 'up', trendValue: '+12%', description: 'Resident card scans this month', highlight: true },
  { label: 'Foot Traffic', value: '847', trend: 'up', trendValue: '+8%', description: 'Estimated visits from residents' },
  { label: 'Saves', value: '312', trend: 'up', trendValue: '+24%', description: 'Times saved to resident lists' },
  { label: 'Redemptions', value: '156', trend: 'up', trendValue: '+18%', description: 'Perk redemptions this month' },
  { label: 'Est. Revenue Impact', value: '$2,890', trend: 'up', trendValue: '+15%', description: 'Estimated from resident actions' },
  { label: 'Action Rate', value: '18', unit: '%', trend: 'up', trendValue: '+3pts', description: 'Residents who acted after viewing' },
];

export default function PartnerDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="pt-14">
      <DashboardShell activeTab={tab} onTabChange={setTab}>
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: 'var(--dp-gold)' }}>Partner Dashboard</p>
                <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--dp-navy)', fontFamily: 'var(--dp-font-display)' }}>Resident Engagement</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--dp-slate)' }}>Downtown Austin · Last 30 days</p>
              </div>
              <CTAButton ctaId="openMap" variant="secondary" />
            </div>

            <section aria-labelledby="metrics-heading">
              <h2 id="metrics-heading" className="sr-only">Key metrics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <PartnerMapInsights />
              <RecommendationPanel />
            </div>
          </div>
        )}

        {tab === 'map' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--dp-navy)' }}>Map Insights</h2>
            <PartnerMapInsights />
          </div>
        )}

        {tab === 'redemptions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--dp-navy)' }}>Redemptions</h2>
            <RedemptionTable />
          </div>
        )}

        {tab === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--dp-navy)' }}>What to Change Next</h2>
            <RecommendationPanel />
          </div>
        )}
      </DashboardShell>
    </div>
  );
}
