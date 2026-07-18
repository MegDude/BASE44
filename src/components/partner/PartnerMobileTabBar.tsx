import { useNavigate } from "react-router-dom";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import { workspacePrimaryNavigation } from "@/config/workspaceModuleRegistry";

type PartnerMobileTabBarProps = {
  activeTab: string;
  organizationId: string;
};

export function PartnerMobileTabBar({ activeTab, organizationId }: PartnerMobileTabBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="dp-partner-native-tabs" aria-label="Partner workspace" role="tablist">
      {workspacePrimaryNavigation.map((item) => {
        const Icon = item.icon;
        const active = item.matches.some((match) => match === activeTab);
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-label={item.label}
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : ""}
            onClick={() => navigate(withPartnerWorkspaceContext(item.href, organizationId))}
          >
            <Icon aria-hidden="true" />
            <span className="dp-native-tab-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
