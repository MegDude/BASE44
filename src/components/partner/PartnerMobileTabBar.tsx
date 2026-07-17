import { ChartNoAxesCombined, House, MapPin, Megaphone, Settings, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PartnerMobileTab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  matches: readonly string[];
};

const PARTNER_MOBILE_TABS = [
  { id: "home", label: "Home", href: "/partner-workspace/overview", icon: House, matches: ["overview"] },
  { id: "publish", label: "Publish", href: "/partner-workspace/offers", icon: Megaphone, matches: ["offers", "events", "campaigns", "surveys", "broadcasts"] },
  { id: "map", label: "Map", href: "/map?mode=partner&tab=map&filter=All", icon: MapPin, matches: ["map"] },
  { id: "insights", label: "Performance", href: "/app/workspace/reports", icon: ChartNoAxesCombined, matches: ["analytics", "reports", "audience"] },
  { id: "workspace", label: "Workspace", href: "/partner-workspace/profile", icon: Settings, matches: ["profile", "team", "billing", "media", "sources"] },
] as const satisfies readonly PartnerMobileTab[];

type PartnerMobileTabBarProps = {
  activeTab: string;
};

export function PartnerMobileTabBar({ activeTab }: PartnerMobileTabBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="dp-partner-native-tabs" aria-label="Partner workspace" role="tablist">
      {PARTNER_MOBILE_TABS.map((item) => {
        const Icon = item.icon;
        const active = item.matches.some((match) => match === activeTab);
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? "is-active" : ""}
            onClick={() => navigate(item.href)}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
