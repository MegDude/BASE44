import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ResidentNav from "@/components/resident/ResidentNav";
import ResidentTabs from "@/components/resident/ResidentTabs";

/**
 * /resident-app — Unified Resident Dashboard
 * Complete product surface for daily use: Now, Plan, Perks, Card, Saved, Buildings
 * Integration point for map, geofencing, notifications, and resident identity
 */

const PUBLIC_RESIDENT_USER = {
  email: "resident@downtownperks.local",
  full_name: "Downtown Resident",
};

export default function ResidentApp() {
  const [user, setUser] = useState(PUBLIC_RESIDENT_USER);
  const [activeTab, setActiveTab] = useState("now");

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setUser(u || PUBLIC_RESIDENT_USER))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-[68px] h-screen fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Navigation */}
      <ResidentNav activeTab={activeTab} onTabChange={setActiveTab} user={user} />

      {/* Tab Content */}
      <ResidentTabs activeTab={activeTab} user={user} />
    </div>
  );
}
