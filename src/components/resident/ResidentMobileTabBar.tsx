import { CalendarDays, CreditCard, Gift, MapPin, UserRound, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type ResidentTab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const RESIDENT_TABS = [
  { id: "map", label: "Map", href: "/map?mode=resident&tab=map&filter=All", icon: MapPin },
  { id: "perks", label: "Perks", href: "/map?mode=resident&tab=perks&filter=Perks", icon: Gift },
  { id: "events", label: "Events", href: "/map?mode=resident&tab=events&filter=Events", icon: CalendarDays },
  { id: "card", label: "Card", href: "/map?mode=resident&tab=card", icon: CreditCard },
  { id: "profile", label: "Profile", href: "/resident/home?panel=profile", icon: UserRound },
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
        const opensHomePanel = Boolean(onTabChange && ["card", "profile"].includes(item.id));
        const content = <><Icon aria-hidden="true" /><span className="dp-native-tab-label">{item.label}</span></>;

        return opensHomePanel ? (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-label={item.label}
            aria-selected={active}
            className={active ? "is-active" : ""}
            onClick={() => onTabChange?.(item.id)}
          >
            {content}
          </button>
        ) : (
          <Link key={item.id} to={item.href} role="tab" aria-label={item.label} aria-selected={active} className={active ? "is-active" : ""}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
