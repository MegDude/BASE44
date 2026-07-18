import { useLocation, useNavigate } from "react-router-dom";
import { readPartnerWorkspaceOrganizationId, withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import { workspacePrimaryNavigation } from "@/config/workspaceModuleRegistry";

type PartnerMobileTabBarProps = {
  activeTab: string;
};

export function PartnerMobileTabBar({ activeTab }: PartnerMobileTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const organizationId = readPartnerWorkspaceOrganizationId(location.search);

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
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : ""}
            onClick={() => navigate(withPartnerWorkspaceContext(item.href, organizationId))}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
