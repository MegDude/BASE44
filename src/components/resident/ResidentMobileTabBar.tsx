import { CalendarDays, CreditCard, Gift, House, MapPin, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type ResidentTab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const RESIDENT_TABS = [
  { id: "home", label: "Home", href: "/resident/home", icon: House },
  { id: "map", label: "Map", href: "/map?mode=resident&tab=map&filter=All", icon: MapPin },
  { id: "perks", label: "Perks", href: "/map?mode=resident&tab=perks&filter=Perks", icon: Gift },
  { id: "events", label: "Events", href: "/map?mode=resident&tab=events&filter=Events", icon: CalendarDays },
  { id: "card", label: "Card", href: "/map?mode=resident&tab=pass", icon: CreditCard },
] as const satisfies readonly ResidentTab[];

type ResidentMobileTabBarProps = {
  activeTab: string;
};

export function ResidentMobileTabBar({ activeTab }: ResidentMobileTabBarProps) {
  return (
    <nav className="dp-resident-native-tabs" aria-label="Resident app" role="tablist">
      {RESIDENT_TABS.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeTab;
        return (
          <Link key={item.id} to={item.href} role="tab" aria-selected={active} className={active ? "is-active" : ""}>
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
