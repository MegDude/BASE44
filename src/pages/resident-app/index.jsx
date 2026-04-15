/**
 * /resident-app — Map-first resident experience foundation
 * Phase 5 stub: Foundation for unified map + geofencing + Ask the Map integration
 * 
 * This page will serve as the primary resident-facing map surface with:
 * - Shared MapShell component
 * - Venue + Event + Building plotting
 * - Geofence-triggered notifications
 * - Ask the Map integration
 * - Resident onboarding/verification overlays
 * - Saved items integration
 * 
 * Currently a stub that will be fully implemented in Phase 5.
 */

import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer } from "react-leaflet";
import { AlertCircle, MapPin } from "lucide-react";

const AUSTIN_CENTER = [30.267, -97.743];

export default function ResidentApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-[68px]">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-xl font-medium mb-2">Sign in to continue</h2>
          <p className="text-muted-foreground text-[13px] mb-6">
            Access your personal Downtown Perks map experience with saved items, nearby
            discoveries, and real-time engagement.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
          >
            Sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[68px] min-h-screen bg-background flex flex-col">
      {/* Map section (mobile-first, full height on mobile, left panel on desktop) */}
      <div className="flex-1 relative w-full md:flex hidden md:block min-h-[50vh] md:min-h-0 bg-muted/20">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-4 bg-primary/5">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-[13px]">MapShell will render here in Phase 5</p>
          </div>
        </div>
      </div>

      {/* Results/Info panel (shifts below map on mobile) */}
      <div className="w-full md:w-[420px] md:shrink-0 flex flex-col max-h-[50vh] md:max-h-none">
        <div className="p-6 md:p-8 bg-background overflow-y-auto flex-1">
          <div className="text-center md:text-left">
            <h1 className="font-heading text-2xl md:text-3xl font-medium mb-3">Your Downtown Map</h1>
            <p className="text-muted-foreground text-[13px] mb-6">
              Welcome, {user.full_name}. This is the foundation of your resident experience.
            </p>

            <div className="p-6 rounded-2xl border border-border/40 bg-card/40">
              <h2 className="font-heading text-base font-medium mb-4">Phase 5 Roadmap</h2>
              <ul className="text-left space-y-2 text-[12px] text-muted-foreground mb-4">
                <li>✓ Unified MapShell (Explore + Events + ResidentApp)</li>
                <li>✓ Venue + Event + Building plotting</li>
                <li>✓ Geofence-triggered alerts</li>
                <li>✓ Ask the Map integration</li>
                <li>✓ Saved items & preferences</li>
              </ul>
              <p className="text-muted-foreground text-[11px]">
                Interactive map experience coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}