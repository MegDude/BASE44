import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/resident', destination: '/resident-app', permanent: false },
      { source: '/resident/map', destination: '/resident-app/map', permanent: false },
      { source: '/resident/events', destination: '/resident-app/events', permanent: false },
      { source: '/resident/properties', destination: '/resident-app/properties', permanent: false },
      { source: '/resident/perks-card', destination: '/resident-app/perks', permanent: false },
      { source: '/partner', destination: '/partner-dashboard', permanent: false },
      { source: '/partner/pricing', destination: '/partner-dashboard/about?type=venues', permanent: false },
      { source: '/schedule-demo', destination: '/partner-dashboard/about?type=properties', permanent: false },
    ];
  },
};

export default nextConfig;
