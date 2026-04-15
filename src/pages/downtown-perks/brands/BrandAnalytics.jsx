import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import AnalyticsKPICard from '@/components/analytics/AnalyticsKPICard';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFiltersPanel';
import AnalyticsFunnel from '@/components/analytics/AnalyticsFunnel';
import AnalyticsAttributionTable from '@/components/analytics/AnalyticsAttributionTable';

// Sample data generator
function generateSampleAnalytics(seed = 1) {
  const baseMultiplier = seed;
  return {
    reach: Math.round(12400 * baseMultiplier),
    scans: Math.round(2840 * baseMultiplier),
    unlocks: Math.round(1920 * baseMultiplier),
    optIns: Math.round(560 * baseMultiplier),
    visits: Math.round(1240 * baseMultiplier),
    redemptions: Math.round(620 * baseMultiplier),
    repeatEngagement: Math.round(280 * baseMultiplier),
    conversionRate: 5.2,
    funnel: {
      impression: Math.round(12400 * baseMultiplier),
      open: Math.round(5680 * baseMultiplier),
      unlock: Math.round(2840 * baseMultiplier),
      save: Math.round(1920 * baseMultiplier),
      visit_intent: Math.round(1560 * baseMultiplier),
      visit: Math.round(1240 * baseMultiplier),
      redemption: Math.round(620 * baseMultiplier)
    },
    attribution: {
      building_qr: { actions: 3840, visits: 680, redemptions: 320, trend: 'up' },
      map_discovery: { actions: 2960, visits: 520, redemptions: 240, trend: 'stable' },
      event_marker: { actions: 2400, visits: 480, redemptions: 200, trend: 'up' },
      sms: { actions: 1280, visits: 400, redemptions: 160, trend: 'down' },
      resident_card: { actions: 960, visits: 120, redemptions: 80, trend: 'stable' },
      direct_link: { actions: 560, visits: 40, redemptions: 20, trend: 'down' }
    }
  };
}

export default function BrandAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brand, setBrand] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timeRange: [searchParams.get('timeRange') || 'month'],
    district: searchParams.getAll('district') || [],
    source: searchParams.getAll('source') || []
  });

  useEffect(() => {
    // Load sample data
    const sampleData = generateSampleAnalytics();
    setAnalytics(sampleData);
    
    // Set default brand (can be customized via params)
    const brandSlug = searchParams.get('brand');
    if (brandSlug) {
      setBrand({ slug: brandSlug, name: 'Fine Eyewear' });
    } else {
      setBrand({ slug: 'all-brands', name: 'All Brands' });
    }
    
    setLoading(false);
  }, [searchParams]);

  const handleFilterChange = (filterType, values) => {
    setFilters(prev => ({ ...prev, [filterType]: values }));
    // Update URL params
    const params = new URLSearchParams();
    if (brand?.slug && brand.slug !== 'all-brands') {
      params.set('brand', brand.slug);
    }
    values.forEach(v => params.append(filterType, v));
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ timeRange: ['month'], district: [], source: [] });
    const params = new URLSearchParams();
    if (brand?.slug && brand.slug !== 'all-brands') {
      params.set('brand', brand.slug);
    }
    setSearchParams(params);
  };

  if (loading || !analytics) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-gradient-to-br from-background to-muted/20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Analytics</span>
            <h1 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-3">
              {brand?.name} Performance
            </h1>
            <p className="text-muted-foreground text-[15px] max-w-2xl leading-relaxed">
              Track what's converting downtown. See where engagement is highest, which channels drive visits, and what your audience does next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* ── SIDEBAR: FILTERS ──────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <AnalyticsFiltersPanel
                activeFilters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
              />
            </div>

            {/* ── MAIN CONTENT ────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AnalyticsKPICard label="Reach" value={analytics.reach} delta="+12%" deltaType="positive" />
                <AnalyticsKPICard label="Scans" value={analytics.scans} delta="+8%" deltaType="positive" />
                <AnalyticsKPICard label="Unlocks" value={analytics.unlocks} delta="+5%" deltaType="positive" />
                <AnalyticsKPICard label="Visits" value={analytics.visits} delta="-3%" deltaType="negative" />
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnalyticsKPICard label="Redemptions" value={analytics.redemptions} delta="+14%" deltaType="positive" />
                <AnalyticsKPICard label="Repeat Engagement" value={analytics.repeatEngagement} delta="+22%" deltaType="positive" />
                <AnalyticsKPICard label="Conversion Rate" value={`${analytics.conversionRate}%`} delta="+1.2%" deltaType="positive" />
              </div>

              {/* Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <AnalyticsFunnel data={analytics.funnel} />
              </motion.div>

              {/* Heatmap / Geography */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <div>
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
                    Downtown Heat
                  </h3>
                  <p className="text-[13px] text-muted-foreground mb-6">
                    High-intent corridors and scan density across districts.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { district: 'Rainey', heat: 92, icon: '🔥' },
                    { district: 'Seaholm', heat: 78, icon: '🔥' },
                    { district: 'Congress', heat: 65, icon: '🔥' },
                    { district: 'Red River', heat: 52, icon: '⚡' }
                  ].map((d, idx) => (
                    <motion.div
                      key={d.district}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-foreground">{d.icon} {d.district}</span>
                        <span className="text-[12px] font-semibold text-foreground">{d.heat}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.heat}%` }}
                          transition={{ duration: 0.8, delay: 0.35 + idx * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <div className="text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground">Peak activity:</span> Rainey district, 6–8pm
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground">Strongest source:</span> Building QR at conference venues
                  </div>
                </div>
              </motion.div>

              {/* Attribution Table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <AnalyticsAttributionTable data={analytics.attribution} />
              </motion.div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
                  This Period's Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Building QR is outperforming map discovery for confirmed visits this month.
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Rainey district generates 40% more scans but Seaholm shows the strongest redemption rate.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border/40 py-12 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Next Steps</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight mb-3">
                Optimize your downtown presence.
              </h2>
              <p className="text-muted-foreground text-[14px] leading-relaxed">
                Use these insights to refine where you focus, which channels convert best, and how to deepen resident engagement.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                Schedule a strategy call <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground font-medium text-sm hover:bg-muted/30 transition-all">
                View campaign formats
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}