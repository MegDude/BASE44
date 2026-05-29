/**
 * Partner Dashboard — Live partner reporting system
 * Real-time metrics, actions, redemptions
 * No refresh needed—all data syncs instantly
 */

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  Heart,
  CheckCircle,
  Clock,
  Edit2,
  X,
} from 'lucide-react';

const PUBLIC_PARTNER_USER = {
  email: "partner@downtownperks.local",
  full_name: "Partner Dashboard",
};

export default function PartnerDashboard() {
  const [user, setUser] = useState(PUBLIC_PARTNER_USER);
  const [venues, setVenues] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [editingPerk, setEditingPerk] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me || PUBLIC_PARTNER_USER);

        // Load venues (for this partner)
        const venueList = await base44.entities.Venue.list();
        setVenues(venueList || []);

        // Subscribe to live actions
        const unsubscribe = base44.entities.UserAction.subscribe((event) => {
          if (event.type === 'create') {
            setActions((prev) => [event.data, ...prev].slice(0, 50));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = calculateMetrics(actions);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-5 lg:px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Partner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time engagement metrics for your venues
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'Impressions',
              value: metrics.impressions,
              icon: Eye,
              color: 'text-[#B38F4F]',
            },
            {
              label: 'Saves',
              value: metrics.saves,
              icon: Heart,
              color: 'text-[#0B1F33]/58',
            },
            {
              label: 'Redemptions',
              value: metrics.redemptions,
              icon: CheckCircle,
              color: 'text-[#B38F4F]',
            },
            {
              label: 'Trending',
              value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
              icon: TrendingUp,
              color: 'text-[#B38F4F]',
            },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {metric.label}
                  </span>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <motion.div
                  key={metric.value}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-foreground"
                >
                  {metric.value}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Venues List (left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Your Venues</h2>
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {venues.length === 0 ? (
                  <div className="p-5 text-center text-[13px] text-muted-foreground">
                    No venues yet
                  </div>
                ) : (
                  venues.map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => setSelectedVenue(venue)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedVenue?.id === venue.id
                          ? 'bg-primary/10'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <div className="font-medium text-foreground text-[13px]">
                        {venue.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {venue.category}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Live Feed (right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Live Activity</h2>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {actions.length === 0 ? (
                  <div className="p-5 text-center text-[13px] text-muted-foreground">
                    No activity yet
                  </div>
                ) : (
                  actions.map((action) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-[13px] text-foreground capitalize">
                          {action.action_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(action.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {action.user_email}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Venue Details / Edit Panel */}
        <AnimatePresence mode="wait" initial={false}>
          {selectedVenue && (
            <VenuePanel
              venue={selectedVenue}
              onClose={() => setSelectedVenue(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── VENUE DETAILS PANEL ────────────────────────────────────

function VenuePanel({ venue, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    perk_description: venue.perk_description || '',
    perk_value: venue.perk_value || '',
    hours: venue.hours || '',
  });

  const handleSave = async () => {
    await base44.entities.Venue.update(venue.id, formData);
    setIsEditing(false);
    // Trigger map refresh via action
    await base44.entities.UserAction.create({
      user_email: (await base44.auth.me()).email,
      entity_id: venue.id,
      action_type: 'edit',
      timestamp: new Date().toISOString(),
      metadata: { perkUpdated: true },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-card rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{venue.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Perk Description
                </label>
                <input
                  type="text"
                  value={formData.perk_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perk_description: e.target.value,
                    })
                  }
                  className="w-full h-10 border border-border rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Perk Value
                </label>
                <input
                  type="text"
                  value={formData.perk_value}
                  onChange={(e) =>
                    setFormData({ ...formData, perk_value: e.target.value })
                  }
                  className="w-full h-10 border border-border rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Hours
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  className="w-full h-10 border border-border rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 h-10 rounded-lg bg-foreground text-background font-semibold text-[13px] hover:bg-foreground/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-10 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-[13px]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Perk Value
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {venue.perk_value || 'No perk'}
                </p>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Hours</div>
                <p className="text-[13px] text-foreground">{venue.hours || 'N/A'}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full h-10 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-[13px] flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit details
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── HELPERS ────────────────────────────────────────────────

function calculateMetrics(actions) {
  const impressions = actions.filter((a) => a.action_type === 'scan').length;
  const saves = actions.filter((a) => a.action_type === 'save').length;
  const redemptions = actions.filter((a) => a.action_type === 'redeem').length;
  const conversionRate = saves > 0 ? redemptions / saves : 0;

  return { impressions, saves, redemptions, conversionRate };
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now - date) / 1000; // seconds

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}
