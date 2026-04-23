import { useState, useEffect } from "react";
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
    // Mock user for demo purposes
    setUser({ name: "Demo Resident", email: "demo@resident.com" });
    setLoading(false);
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