import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Sparkles } from "lucide-react";
import {
  ADMIN_STUDIO_ROUTES,
  CAMPAIGN_CREATION_FLOW,
  CAMPAIGN_OBJECT_FIELDS,
  CAMPAIGN_TYPES,
  DOWNTOWN_PERKS_OS_AREAS,
  STUDIO_STATUS_CARDS,
} from "@/content/downtown-perks/downtownPerksOSBlueprint";

function getActiveStudioRoute(pathname) {
  return ADMIN_STUDIO_ROUTES.find((route) => pathname.includes(route.id)) || ADMIN_STUDIO_ROUTES[0];
}

function StudioShell({ activeRoute }) {
  return (
    <aside className="dp-os-studio-rail" aria-label="Admin Marketing Studio navigation">
      <Link to="/admin-studio/command-center" className="dp-os-studio-brand">
        <span>DP</span>
        <strong>Marketing Studio</strong>
      </Link>
      <nav>
        {ADMIN_STUDIO_ROUTES.map((route) => {
          const Icon = route.icon;
          const active = route.id === activeRoute.id;
          return (
            <Link key={route.id} to={route.path} className={active ? "is-active" : ""}>
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
          <Link key={route.id} to={route.path} className={active ? "is-active" : ""}>
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
        <p>All perks, events, surveys, placements, and activations use the same campaign object and launch path.</p>
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

function StudioRouteWireframe({ route }) {
  return (
    <section className="dp-os-wire-card dp-os-route-wireframe" aria-label={`${route.label} wireframe`}>
      <header>
        <span>{route.label}</span>
        <h2>{route.purpose}</h2>
        <p>{route.priority}</p>
      </header>

      <div className="dp-os-mobile-frame" aria-label={`${route.label} mobile wireframe`}>
        <div className="dp-os-mobile-frame__top">
          <strong>{route.label}</strong>
          <small>Today’s priority</small>
        </div>
        <div className="dp-os-mobile-frame__body">
          <article>
            <span>Primary</span>
            <strong>{route.priority}</strong>
            <button type="button">{route.primaryCta}</button>
          </article>
          <div>
            {route.cards.slice(0, 4).map((card) => (
              <button key={card} type="button">
                <span>{card}</span>
                <ChevronRight aria-hidden="true" />
              </button>
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
      <p>Perks, events, surveys, sponsored placements, broadcasts, and partner activations become campaign types instead of disconnected modules.</p>
      <div className="dp-os-chip-grid">
        {CAMPAIGN_TYPES.map((type) => <span key={type}>{type}</span>)}
      </div>
      <div className="dp-os-field-list" aria-label="Campaign fields">
        {CAMPAIGN_OBJECT_FIELDS.map((field) => (
          <span key={field}>{field}</span>
        ))}
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
          <div>
            {area.routes.map((route) => <em key={route}>{route}</em>)}
          </div>
        </article>
      ))}
    </section>
  );
}

export default function AdminMarketingStudio() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeRoute = getActiveStudioRoute(location.pathname);
  const ActiveIcon = activeRoute.icon;

  return (
    <div className="dp-os-studio-page">
      <StudioShell activeRoute={activeRoute} />
      <main className="dp-os-studio-main">
        <header className="dp-os-studio-hero">
          <div>
            <span className="dp-os-kicker">Downtown Perks OS</span>
            <h1>Premium control layer for downtown discovery.</h1>
            <p>
              One native-feeling system for resident decisions, partner launches, admin governance, and public storytelling.
            </p>
          </div>
          <div className="dp-os-studio-hero__actions">
            <button type="button" onClick={() => navigate("/admin-studio/campaign-builder")}>
              Build campaign
              <ArrowRight aria-hidden="true" />
            </button>
            <Link to="/map?mode=resident&tab=map&filter=All">Open resident map</Link>
          </div>
        </header>

        <section className="dp-os-status-grid" aria-label="Today in Marketing Studio">
          {STUDIO_STATUS_CARDS.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="dp-os-active-panel" aria-label={activeRoute.label}>
          <div className="dp-os-active-panel__icon">
            <ActiveIcon aria-hidden="true" />
          </div>
          <div>
            <span>{activeRoute.label}</span>
            <h2>{activeRoute.purpose}</h2>
            <p>{activeRoute.priority}</p>
          </div>
          <button type="button">
            {activeRoute.primaryCta}
            <Sparkles aria-hidden="true" />
          </button>
        </section>

        <div className="dp-os-studio-grid">
          <StudioRouteWireframe route={activeRoute} />
          <CampaignFlowCard />
          <CampaignObjectPanel />
        </div>

        <SystemMap />

        <section className="dp-os-governance-strip" aria-label="Launch rules">
          {["Draft mode always available", "Preview required", "Test send required", "Approval for paid/public placements", "Report auto-generated"].map((rule) => (
            <span key={rule}>
              <Check aria-hidden="true" />
              {rule}
            </span>
          ))}
        </section>
      </main>
      <MobileStudioNav activeRoute={activeRoute} />
    </div>
  );
}
