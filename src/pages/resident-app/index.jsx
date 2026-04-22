import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ResidentNav from "@/components/resident/ResidentNav";
import ResidentTabs from "@/components/resident/ResidentTabs";
import { resolveResidentContext } from "@/lib/resident/resolveResidentContext";

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

export default function ResidentApp({ defaultTab = "now" }) {
  const location = useLocation();
  const [user] = useState(GUEST_RESIDENT);
  const [loading] = useState(false);
  const initialContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return resolveResidentContext({ tab: params.get("tab") || defaultTab });
  }, [defaultTab, location.search]);
  const [activeTab, setActiveTab] = useState(defaultTab || initialContext.tab);

  useEffect(() => {
    setActiveTab(defaultTab || initialContext.tab);
  }, [defaultTab, initialContext.tab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[68px] h-screen fixed inset-0 flex flex-col bg-background overflow-hidden">
      <ResidentNav user={user} />
      <ResidentTabs activeTab={activeTab} user={user} />
    </div>
  );
}
