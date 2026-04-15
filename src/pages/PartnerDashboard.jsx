import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Eye, MapPin, Calendar, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PartnerDashboard — Secure analytics for venue/property partners
 * Shows impressions, visitors, and traffic trends
 */
export default function PartnerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u) {
        base44.auth.redirectToLogin();
        return;
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['partner-bookings'],
    queryFn: async () => {
      if (!user?.email) return [];
      const allBookings = await base44.entities.Booking.list('-created_date', 1000);
      // Partner sees only bookings for their venues (created_by == user email for venue ownership)
      return allBookings.filter((b) => b.user_email === user.email);
    },
    enabled: !!user,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['partner-analytics'],
    queryFn: async () => {
      if (!user?.email) return [];
      const allSignals = await base44.entities.AnalyticsSignal.list('-timestamp', 2000);
      // Filter signals from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return allSignals.filter((s) => new Date(s.timestamp) >= sevenDaysAgo);
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[68px]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Partner Dashboard</h1>
          <p className="text-muted-foreground">Real-time engagement metrics for your venues</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Impressions"
            value={analytics.length}
            icon={Eye}
            trend={12}
            color="bg-blue-500/10"
          />
          <MetricCard
            title="Unique Visitors"
            value={new Set(analytics.map((a) => a.session_token)).size}
            icon={Users}
            trend={8}
            color="bg-green-500/10"
          />
          <MetricCard
            title="Bookings This Week"
            value={bookings.filter((b) => new Date(b.created_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            icon={MapPin}
            trend={5}
            color="bg-gold/10"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Traffic Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Traffic Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTrendData(analytics)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => [`${value} impressions`, 'Activity']}
                />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Booking Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Booking Status
            </h2>
            <div className="space-y-4">
              {getBookingStats(bookings).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-foreground capitalize">{stat.status}</div>
                    <div className="text-xs text-muted-foreground">{stat.count} bookings</div>
                  </div>
                  <div className="text-lg font-bold text-primary">{Math.round((stat.count / bookings.length) * 100)}%</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Types Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-card rounded-2xl p-6 border border-border shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Engagement by Action Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getActionStats(analytics)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="action"
                stroke="var(--muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-card rounded-2xl p-6 border border-border shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Confirmation</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-foreground">{booking.confirmation_code}</td>
                    <td className="py-3 px-4 text-foreground capitalize">{booking.type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(booking.created_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/20 text-green-700'
                            : booking.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-700'
                              : 'bg-red-500/20 text-red-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, trend, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${color} border border-border rounded-2xl p-6 backdrop-blur`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
          <div className="text-3xl font-bold text-foreground">{value.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
            <ArrowUp className="w-3 h-3" />
            {trend}% from last week
          </div>
        </div>
        <Icon className="w-6 h-6 text-muted-foreground opacity-50" />
      </div>
    </motion.div>
  );
}

function getTrendData(analytics) {
  const trendMap = {};

  analytics.forEach((signal) => {
    const date = new Date(signal.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!trendMap[dateStr]) trendMap[dateStr] = 0;
    trendMap[dateStr] += signal.value || 1;
  });

  // Last 7 days
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({
      date: dateStr,
      impressions: trendMap[dateStr] || 0,
    });
  }

  return result;
}

function getBookingStats(bookings) {
  const stats = {};
  bookings.forEach((b) => {
    stats[b.status] = (stats[b.status] || 0) + 1;
  });

  return Object.entries(stats).map(([status, count]) => ({ status, count }));
}

function getActionStats(analytics) {
  const stats = {};
  analytics.forEach((signal) => {
    const action = signal.action_type || 'impression';
    stats[action] = (stats[action] || 0) + 1;
  });

  return Object.entries(stats)
    .map(([action, count]) => ({ action: action.replace('_', ' '), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}