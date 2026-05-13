import { useState, useMemo } from "react";
import { MapPin, Compass, Calendar, Bookmark, CreditCard } from "lucide-react";
import BottomRail from "./BottomRail";
import BottomDrawer from "./BottomDrawer";
import MapContainer from "./map/MapContainer";
import MapTab from "./tabs/MapTab";
import DiscoverTab from "./tabs/DiscoverTab";
import EventsTab from "./tabs/EventsTab";
import SavedTab from "./tabs/SavedTab";
import CardTab from "./tabs/CardTab";

const TABS = {
  MAP: "map",
  DISCOVER: "discover",
  EVENTS: "events",
  SAVED: "saved",
  CARD: "card",
};

const TAB_CONFIG = {
  map: {
    label: "MAP",
    icon: MapPin,
    component: MapTab,
  },
  discover: {
    label: "DISCOVER",
    icon: Compass,
    component: DiscoverTab,
  },
  events: {
    label: "EVENTS",
    icon: Calendar,
    component: EventsTab,
  },
  saved: {
    label: "SAVED",
    icon: Bookmark,
    component: SavedTab,
  },
  card: {
    label: "CARD",
    icon: CreditCard,
    component: CardTab,
  },
};

export default function ResidentShell() {
  const [activeTab, setActiveTab] = useState(TABS.MAP);
  const [drawerState, setDrawerState] = useState("peek"); // peek, preview, expanded, fullscreen

  const ActiveTabComponent = useMemo(() => {
    return TAB_CONFIG[activeTab]?.component || MapTab;
  }, [activeTab]);

  return (
    <div className="relative w-full h-screen bg-[#f6f8fb] overflow-hidden">
      {/* Map always visible in background */}
      <MapContainer />

      {/* Bottom Drawer */}
      <BottomDrawer state={drawerState} onStateChange={setDrawerState} activeTab={activeTab}>
        <ActiveTabComponent onDrawerStateChange={setDrawerState} />
      </BottomDrawer>

      {/* Bottom Rail Navigation */}
      <BottomRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TAB_CONFIG}
      />
    </div>
  );
}
