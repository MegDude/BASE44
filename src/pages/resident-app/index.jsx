import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ResidentNav from "@/components/resident/ResidentNav";
import ResidentTabs from "@/components/resident/ResidentTabs";

/**
 * /resident-app — Unified Resident Dashboard
 * Complete product surface for daily use: Now, Plan, Perks, Card, Saved, Buildings
 * Integration point for map, geofencing, notifications, and resident identity
 */

const GUEST_RESIDENT = {
  id: "guest-resident",
  full_name: "Downtown Resident",
  email: "guest@downtownperks.demo",
  role: "resident",
  is_guest: true,
};

export default function ResidentApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("now");

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => {
        setUser(u || GUEST_RESIDENT);
        setLoading(false);
      })
      .catch(() => {
        setUser(GUEST_RESIDENT);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
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
