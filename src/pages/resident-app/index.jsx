import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle } from "lucide-react";
import ResidentNav from "@/components/resident/ResidentNav";
import ResidentTabs from "@/components/resident/ResidentTabs";

/**
 * /resident-app — Unified Resident Dashboard
 * Complete product surface for daily use: Now, Plan, Perks, Card, Saved, Buildings
 * Integration point for map, geofencing, notifications, and resident identity
 */

export default function ResidentApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("now");

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
            Access your personal Downtown Perks experience with live map, saved items, and instant engagement.
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
    <div className="pt-[68px] h-screen fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Navigation */}
      <ResidentNav activeTab={activeTab} onTabChange={setActiveTab} user={user} />

      {/* Tab Content */}
      <ResidentTabs activeTab={activeTab} user={user} />
    </div>
  );
}