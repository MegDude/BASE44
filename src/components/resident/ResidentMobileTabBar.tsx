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
  { id: "map", label: "Map", href: "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured", icon: MapPin },
  { id: "perks", label: "Perks", href: "/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits", icon: Gift },
  { id: "events", label: "Events", href: "/map?mode=resident&tab=events&filter=Events&collection=events-nearby", icon: CalendarDays },
  { id: "card", label: "Card", href: "/map?mode=resident&tab=card", icon: CreditCard },
] as const satisfies readonly ResidentTab[];

type ResidentMobileTabBarProps = {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
};

export function ResidentMobileTabBar({ activeTab, onTabChange }: ResidentMobileTabBarProps) {
  return (
    <nav className="dp-resident-native-tabs" aria-label="Resident app" role="tablist">
      {RESIDENT_TABS.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeTab;
        const opensHomePanel = Boolean(onTabChange && (item.id === "home" || item.id === "perks" || item.id === "card"));
        const content = <><Icon aria-hidden="true" /><span>{item.label}</span></>;

        return opensHomePanel ? (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? "is-active" : ""}
            onClick={() => onTabChange?.(item.id)}
          >
            {content}
          </button>
        ) : (
          <Link key={item.id} to={item.href} role="tab" aria-selected={active} className={active ? "is-active" : ""}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
