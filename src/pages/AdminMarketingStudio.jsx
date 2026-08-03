import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";
import { AdminScopeSwitcher } from "@/components/admin/AdminScopeSwitcher";
import {
  ADMIN_STUDIO_ROUTES,
  CAMPAIGN_CREATION_FLOW,
  CAMPAIGN_OBJECT_FIELDS,
  CAMPAIGN_TYPES,
  DOWNTOWN_PERKS_OS_AREAS,
  STUDIO_STATUS_CARDS,
} from "@/content/downtown-perks/downtownPerksOSBlueprint";

const ADMIN_ACTION_TARGETS = {
  "command-center": "/partner-workspace/overview",
  "campaign-builder": "/partner-workspace/campaigns?intent=new",
  "audience-builder": "/partner-workspace/audience",
  "content-library": "/partner-workspace/media",
  "approval-queue": "/partner-workspace/publish",
  distribution: "/partner-workspace/broadcasts",
  performance: "/partner-workspace/performance",
  "partner-intelligence": "/partner-workspace/analytics",
  residents: "/partner-workspace/residents",
};

function getActiveStudioRoute(pathname) {
  return ADMIN_STUDIO_ROUTES.find((route) => pathname.includes(route.id)) || ADMIN_STUDIO_ROUTES[0];
}

function getAdminActionTarget(route) {
  return ADMIN_ACTION_TARGETS[route?.id] || "/partner-workspace/overview";
}

function StudioShell({ activeRoute }) {
  return (
    <aside className="dp-os-studio-rail" aria-label="Admin Marketing Studio navigation">
      <Link to="/admin-studio/command-center" className="dp-os-studio-brand">
        <span>DP</span>
        <strong>Admin Workspace</strong>
      </Link>
      <nav>
        {ADMIN_STUDIO_ROUTES.map((route) => {
          const Icon = route.icon;
          const active = route.id === activeRoute.id;
          return (
            <Link key={route.id} to={route.path} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" />
              <span>{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileStudioNav({ activeRoute }) {
  return (
    <nav className="dp-os-studio-bottom-nav" aria-label="Studio sections">
      {ADMIN_STUDIO_ROUTES.slice(0, 5).map((route) => {
        const Icon = route.icon;
        const active = route.id === activeRoute.id;
        return (
          <Link key={route.id} to={route.path} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{route.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function CampaignFlowCard() {
  return (
    <section className="dp-os-wire-card dp-os-wire-card--flow" aria-label="Campaign creation flow">
      <div>
        <span>Campaign flow</span>
        <h2>Objective to report, with governance built in.</h2>
        <p>All perks, events, surveys, placements, and partner programs use the same campaign object and launch path.</p>
      </div>
      <ol>
        {CAMPAIGN_CREATION_FLOW.map((step, index) => (
          <li key={step}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StudioRouteModule({ route }) {
  const target = getAdminActionTarget(route);
  return (
    <section className="dp-os-wire-card dp-os-route-wireframe" aria-label={`${route.label} operating module`}>
      <header>
        <span>{route.label}</span>
        <h2>{route.purpose}</h2>
        <p>{route.priority}</p>
      </header>
      <div className="dp-os-mobile-frame" aria-label={`${route.label} mobile operating module`}>
        <div className="dp-os-mobile-frame__top">
          <strong>{route.label}</strong>
          <small>Today’s priority</small>
        </div>
        <div className="dp-os-mobile-frame__body">
          <article>
            <span>Primary</span>
            <strong>{route.priority}</strong>
            <Link to={target}>{route.primaryCta}</Link>
          </article>
          <div>
            {route.cards.slice(0, 4).map((card) => (
              <Link key={card} to={target} aria-label={`${card} in ${route.label}`}>
                <span>{card}</span>
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CampaignObjectPanel() {
  return (
    <section className="dp-os-wire-card" aria-label="Campaign object">
      <span>Shared data object</span>
      <h2>Campaign is the central object.</h2>
      <p>Perks, events, surveys, sponsored placements, broadcasts, and partner programs become campaign types instead of disconnected tools.</p>
      <div className="dp-os-chip-grid">
        {CAMPAIGN_TYPES.map((type) => <span key={type}>{type}</span>)}
      </div>
      <div className="dp-os-field-list" aria-label="Campaign fields">
        {CAMPAIGN_OBJECT_FIELDS.map((field) => <span key={field}>{field}</span>)}
      </div>
    </section>
  );
}

function SystemMap() {
  return (
    <section className="dp-os-system-map" aria-label="Downtown Perks OS product areas">
      {DOWNTOWN_PERKS_OS_AREAS.map((area) => (
        <article key={area.id}>
          <span>{area.label}</span>
          <p>{area.job}</p>
          <div>{area.routes.map((route) => <em key={route}>{route}</em>)}</div>
        </article>
      ))}
    </section>
  );
}

function ResidentAdminPanel() {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });

  useEffect(() => {
    let active = true;
    async function loadAccounts() {
      if (!supabaseClient) {
        if (active) setState({ status: "error", data: null, error: "Production account access is not configured." });
        return;
      }
      const { data } = await supabaseClient.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        if (active) setState({ status: "error", data: null, error: "Sign in again to load account records." });
        return;
      }
      try {
        const response = await fetch(`${getPartnerContentApiBaseUrl()}/api/admin/accounts`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Account records could not be loaded.");
        if (active) setState({ status: "ready", data: payload, error: "" });
      } catch (error) {
        if (active) setState({ status: "error", data: null, error: error.message || "Account records could not be loaded." });
      }
    }
    loadAccounts();
    return () => { active = false; };
  }, []);

  const records = state.data?.accounts || [];
  const summary = state.data?.summary || {};
  return (
    <section className="dp-os-wire-card dp-os-resident-admin" aria-label="Production account access management">
      <span>Super admin</span>
      <h2>Account and access manager.</h2>
      <p>Review confirmed accounts, role resolution, resident onboarding, partner provisioning, organizations, portfolios, listings, and access grants from the production system.</p>
      {state.status === "loading" ? <p role="status">Loading production account records…</p> : null}
      {state.status === "error" ? <p role="alert">{state.error}</p> : null}
      {state.status === "ready" ? (
        <dl className="dp-os-resident-admin-summary">
          <div><dt>Accounts</dt><dd>{summary.accounts || 0}</dd></div>
          <div><dt>Residents</dt><dd>{summary.residents || 0}</dd></div>
          <div><dt>Partner users</dt><dd>{summary.activePartnerUsers || 0}</dd></div>
          <div><dt>Organizations</dt><dd>{summary.partnerOrganizations || 0}</dd></div>
          <div><dt>Portfolios</dt><dd>{summary.partnerPortfolios || 0}</dd></div>
          <div><dt>Listings</dt><dd>{summary.partnerListings || 0}</dd></div>
        </dl>
      ) : null}
      <div className="dp-os-resident-admin-grid">
        {records.map((record) => (
          <article key={record.id}>
            <strong>{record.fullName || record.email || "Account"}</strong>
            <p>{record.email || "No email yet"}</p>
            <dl>
              <div><dt>Role</dt><dd>{String(record.platformRole || "resident").replace(/_/g, " ")}</dd></div>
              <div><dt>Email</dt><dd>{record.emailConfirmed ? "Confirmed" : "Unconfirmed"}</dd></div>
              <div><dt>Resident</dt><dd>{record.resident?.status || "No resident profile"}</dd></div>
              <div><dt>Partner scopes</dt><dd>{record.partners?.filter((scope) => scope.active).length || 0}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      {state.status === "ready" && records.length === 0 ? <p>No account records were returned.</p> : null}
      <Link to="/partner-workspace/residents">Open resident operations</Link>
    </section>
  );
}

export default function AdminMarketingStudio() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, user, startPartnerImpersonation } = useAuth();
  const [selectedScope, setSelectedScope] = useState({});
  const [workspaceEntryState, setWorkspaceEntryState] = useState({ status: "idle", message: "" });
  if (isLoadingAuth) {
    return (
      <main className="dp-os-studio-page flex min-h-screen items-center justify-center bg-white text-[#0B1F33]" aria-busy="true">
        <p>Checking administrator access…</p>
      </main>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/partners/sign-in" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  }
  const role = String(user?.role || "").toLowerCase();
  if (!["admin", "platform_admin", "super_admin"].includes(role)) {
    return <Navigate to="/partner-workspace/overview" replace />;
  }
  const activeRoute = getActiveStudioRoute(location.pathname);
  const ActiveIcon = activeRoute.icon;
  const activeTarget = getAdminActionTarget(activeRoute);

  async function enterSelectedWorkspace() {
    if (!selectedScope.organizationId) {
      setWorkspaceEntryState({ status: "error", message: "Choose an organization before entering its workspace." });
      return;
    }
    setWorkspaceEntryState({ status: "loading", message: "" });
    try {
      await startPartnerImpersonation(selectedScope.organizationId, "Command Center workspace management");
      navigate("/partner-workspace/overview");
    } catch (error) {
      setWorkspaceEntryState({ status: "error", message: error?.message || "The workspace could not be opened." });
    }
  }

  return (
    <div className="dp-os-studio-page">
      <StudioShell activeRoute={activeRoute} />
      <main className="dp-os-studio-main">
        <div className="dp-admin-workspace-entry">
          <AdminScopeSwitcher onScopeResolved={setSelectedScope} />
          <button type="button" onClick={enterSelectedWorkspace} disabled={!selectedScope.organizationId || workspaceEntryState.status === "loading"}>
            {workspaceEntryState.status === "loading" ? "Opening workspace…" : "Enter selected workspace"}
          </button>
          {workspaceEntryState.message ? <p role="alert">{workspaceEntryState.message}</p> : null}
        </div>
        <header className="dp-os-studio-hero">
          <div>
            <span className="dp-os-kicker">Downtown Perks · Admin Workspace</span>
            <h1>Platform operations in one authorized workspace.</h1>
            <p>Review organizations, people, places, campaigns, publishing, and data health without leaving the Downtown Perks platform shell.</p>
          </div>
          <div className="dp-os-studio-hero__actions">
            <button type="button" onClick={() => navigate("/partner-workspace/campaigns?intent=new")}>Build campaign <ArrowRight aria-hidden="true" /></button>
            <Link to="/map?mode=resident&tab=map&filter=All">Open resident map</Link>
          </div>
        </header>
        <section className="dp-os-status-grid" aria-label="Today in Marketing Studio">
          {STUDIO_STATUS_CARDS.map((card) => (
            <article key={card.label}><span>{card.label}</span><strong>{card.value}</strong><p>{card.note}</p></article>
          ))}
        </section>
        <section className="dp-os-active-panel" aria-label={activeRoute.label}>
          <div className="dp-os-active-panel__icon"><ActiveIcon aria-hidden="true" /></div>
          <div><span>{activeRoute.label}</span><h2>{activeRoute.purpose}</h2><p>{activeRoute.priority}</p></div>
          <Link to={activeTarget}>{activeRoute.primaryCta}<Sparkles aria-hidden="true" /></Link>
        </section>
        <div className="dp-os-studio-grid">
          {activeRoute.id === "residents" ? <ResidentAdminPanel /> : null}
          <StudioRouteModule route={activeRoute} />
          <CampaignFlowCard />
          <CampaignObjectPanel />
        </div>
        <SystemMap />
        <section className="dp-os-governance-strip" aria-label="Launch rules">
          {["Draft mode always available", "Preview required", "Test send required", "Approval for paid/public placements", "Report auto-generated"].map((rule) => (
            <span key={rule}><Check aria-hidden="true" />{rule}</span>
          ))}
        </section>
      </main>
      <MobileStudioNav activeRoute={activeRoute} />
    </div>
  );
}
