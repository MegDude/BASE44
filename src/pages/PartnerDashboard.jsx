/**
 * Partner Dashboard - Answer-First Design
 * Top prompt: "What do you want to know?"
 * Short answer modules, no metric walls
 */

import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  Heart,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function PartnerDashboard() {
  const [venues, setVenues] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const venueList = await base44.entities.Venue.list();
        setVenues(venueList || []);

        // Subscribe to live actions
        const unsubscribe = base44.entities.UserAction.subscribe((event) => {
          if (event.type === 'create') {
            setActions((prev) => [event.data, ...prev].slice(0, 100));
          }
        });

        setLoading(false);
        return () => unsubscribe?.();
      } catch (error) {
        console.error('Dashboard init failed:', error);
        setLoading(false);
      }
    };

    init();
  }, []);

  const insights = useMemo(() => {
    const impressions = actions.filter((a) => a.action_type === 'view').length;
    const saves = actions.filter((a) => a.action_type === 'save').length;
    const redemptions = actions.filter((a) => a.action_type === 'redeem').length;
    
    // Find top performing venue/perk
    const venueViews = {};
    actions.forEach((a) => {
      if (a.venue_id) {
        venueViews[a.venue_id] = (venueViews[a.venue_id] || 0) + 1;
      }
    });
    const topVenueId = Object.entries(venueViews).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topVenue = venues.find((v) => v.id === topVenueId);

    return {
      impressions,
      saves,
      redemptions,
      conversionRate: impressions > 0 ? saves / impressions : 0,
      topVenue: topVenue?.name || 'No data yet',
      trend: impressions > 10 ? 'up' : 'stable',
    };
  }, [actions, venues]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const modules = [
    {
      id: 'views',
      question: 'What residents looked at',
      answer: `${insights.impressions} views this period`,
      detail: 'People opened your venue or perk listing.',
      icon: Eye,
      color: 'text-blue-600',
    },
    {
      id: 'saves',
      question: 'Which perk moved',
      answer: `${insights.saves} saves, ${insights.redemptions} redemptions`,
      detail: 'Residents saved or redeemed your offers.',
      icon: Heart,
      color: 'text-red-500',
    },
    {
      id: 'performance',
      question: 'Which block performed',
      answer: insights.topVenue,
      detail: 'Your top-performing listing by engagement.',
      icon: TrendingUp,
      color: 'text-amber-600',
    },
    {
      id: 'next',
      question: 'What to do next',
      answer: insights.trend === 'up' 
        ? 'Keep momentum — consider a limited-time perk' 
        : 'Try adding a new perk or updating your hours',
      detail: 'Suggested action based on recent activity.',
      icon: Sparkles,
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header - Question Prompt */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            What do you want to know?
          </h1>
          <p className="text-muted-foreground text-sm">
            Quick answers from your Downtown Perks activity.
          </p>
        </motion.div>

        {/* Answer Modules */}
        <div className="space-y-3">
          {modules.map((module, i) => {
            const Icon = module.icon;
            const isExpanded = expandedModule === module.id;

            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isExpanded 
                    ? 'bg-muted/50 ring-1 ring-border' 
                    : 'bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${module.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">
                      {module.question}
                    </p>
                    <p className="font-medium text-foreground">
                      {module.answer}
                    </p>
                    {isExpanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-muted-foreground mt-2"
                      >
                        {module.detail}
                      </motion.p>
                    )}
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-8 border-t border-border/40"
        >
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground">Quick stats</span>
            <button className="text-primary hover:underline text-xs">
              See details
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{insights.impressions}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{insights.saves}</p>
              <p className="text-xs text-muted-foreground">Saves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {(insights.conversionRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Convert</p>
            </div>
          </div>
        </motion.div>

        {/* Map CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href="/downtown-perks/explore"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            See your listing on the map
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
