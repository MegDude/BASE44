const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'map', label: 'Map Insights' },
  { id: 'redemptions', label: 'Redemptions' },
  { id: 'recommendations', label: 'What to Change' },
];

export default function DashboardShell({ children, activeTab = 'overview', onTabChange }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)' }}>
      {/* Dashboard header */}
      <div className="border-b sticky top-14 z-30" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }}>
        <div className="fluid-container">
          <nav className="flex gap-6 overflow-x-auto scrollbar-none -mb-px" aria-label="Dashboard sections">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className="flex-shrink-0 py-3.5 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
                style={{
                  borderColor: activeTab === item.id ? 'var(--dp-navy)' : 'transparent',
                  color: activeTab === item.id ? 'var(--dp-navy)' : 'var(--dp-slate)',
                }}
                aria-selected={activeTab === item.id}
                role="tab"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="fluid-container py-8">{children}</div>
    </div>
  );
}
