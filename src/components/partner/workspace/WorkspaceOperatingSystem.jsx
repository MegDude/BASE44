import { ArrowRight, ChevronDown, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

export function WorkspacePageShell({ header, sidebar, children, bottomNavigation }) {
  return (
    <>
      {header}
      <div className="dp-workspace-shell">
        {sidebar}
        <main className="dp-workspace-main">
          <div className="dp-workspace-content">{children}</div>
        </main>
      </div>
      {bottomNavigation}
    </>
  );
}

export function SectionHeader({ title, description, action, compact = false }) {
  return (
    <header className={`dp-os-section-header ${compact ? "is-compact" : ""}`}>
      <div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
      {action || null}
    </header>
  );
}

export function WorkspaceHeader({ organization, role, status, onSwitchWorkspace }) {
  return (
    <header className="dp-os-workspace-header">
      <button type="button" onClick={onSwitchWorkspace} aria-label={`Switch workspace. Current workspace: ${organization?.name || "Partner workspace"}`}>
        <span>
          <span className="dp-os-workspace-title" role="heading" aria-level="1">{organization?.name || "Partner workspace"}</span>
          <small>{role} · {status}</small>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
    </header>
  );
}

export function NextActionCard({ eyebrow = "Next action", title, description, actionLabel, href }) {
  return (
    <section className="dp-os-next-action" aria-labelledby="dp-os-next-action-title">
      <p>{eyebrow}</p>
      <h2 id="dp-os-next-action-title">{title}</h2>
      {description ? <span>{description}</span> : null}
      {href && actionLabel ? <Link to={href}>{actionLabel}<ArrowRight aria-hidden="true" /></Link> : null}
    </section>
  );
}

export function WorkspaceSummaryStrip({ metrics = [], label = "Workspace status" }) {
  return (
    <dl className="dp-os-summary-strip" aria-label={label} tabIndex="0">
      {metrics.slice(0, 4).map((metric) => (
        <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd>{metric.context ? <small>{metric.context}</small> : null}</div>
      ))}
    </dl>
  );
}

export function ModuleStatusRow({ icon: Icon, title, status, description, actionLabel, route, disabled = false }) {
  const content = (
    <>
      <span className="dp-os-module-icon">{Icon ? <Icon aria-hidden="true" /> : null}</span>
      <span className="dp-os-module-copy"><strong>{title}</strong><small>{description}</small></span>
      <span className="dp-os-module-status">{status}</span>
      {actionLabel ? <span className="dp-os-module-action">{actionLabel}<ArrowRight aria-hidden="true" /></span> : null}
    </>
  );
  return route && !disabled ? <Link className="dp-os-module-row" to={route}>{content}</Link> : <div className="dp-os-module-row" aria-disabled={disabled}>{content}</div>;
}

export function EntityRail({ title = "Your places", entities = [], onOpenMenu, viewAllHref }) {
  return (
    <section className="dp-os-section" aria-labelledby="dp-os-entity-title">
      <SectionHeader title={title} action={viewAllHref ? <Link to={viewAllHref}>View map</Link> : null} compact />
      {entities.length ? (
        <ul className="dp-os-entity-rail" aria-label={title} tabIndex="0">
          {entities.map((entity) => (
            <li key={entity.id}>
              <Link to={entity.href}>
                <span className="dp-os-entity-media">{entity.image ? <img src={entity.image} alt="" loading="lazy" /> : <b aria-hidden="true">{entity.name?.slice(0, 1)}</b>}</span>
                <span className="dp-os-entity-copy"><strong>{entity.name}</strong><small>{entity.meta}</small><em>{entity.value}</em></span>
              </Link>
              {onOpenMenu ? <button type="button" onClick={() => onOpenMenu(entity)} aria-label={`More actions for ${entity.name}`}><MoreHorizontal aria-hidden="true" /></button> : null}
            </li>
          ))}
        </ul>
      ) : <EmptyState title="No places connected" description="Connect a place to manage it from this workspace." />}
    </section>
  );
}

export function MetricRow({ metrics = [] }) {
  return (
    <dl className="dp-os-metric-row">
      {metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd>{metric.context ? <small>{metric.context}</small> : null}</div>)}
    </dl>
  );
}

export function InsightCard({ category, title, description, actionLabel, href }) {
  return (
    <article className="dp-os-insight">
      <p>{category}</p><h3>{title}</h3>{description ? <span>{description}</span> : null}
      {href && actionLabel ? <Link to={href}>{actionLabel}<ArrowRight aria-hidden="true" /></Link> : null}
    </article>
  );
}

export function FeaturedResult({ eyebrow = "Featured result", title, description, metrics = [], actionLabel, href }) {
  return (
    <section className="dp-os-featured-result">
      <p>{eyebrow}</p><h2>{title}</h2>{description ? <span>{description}</span> : null}
      <MetricRow metrics={metrics} />
      {href && actionLabel ? <Link to={href}>{actionLabel}<ArrowRight aria-hidden="true" /></Link> : null}
    </section>
  );
}

export function ActivityTimeline({ groups = [] }) {
  return (
    <section className="dp-os-section" aria-labelledby="dp-os-activity-title">
      <SectionHeader title="Recent activity" compact />
      <div className="dp-os-activity" id="dp-os-activity-title">
        {groups.map((group) => (
          <section key={group.label}><h3>{group.label}</h3><ol>{group.items.map((item) => <li key={`${item.title}-${item.time}`}><span><strong>{item.title}</strong>{item.entity ? <small>{item.entity}</small> : null}</span><time>{item.time}</time></li>)}</ol></section>
        ))}
      </div>
    </section>
  );
}

export function EmptyState({ title, description, actionLabel, href }) {
  return <div className="dp-os-empty"><strong>{title}</strong><p>{description}</p>{href && actionLabel ? <Link to={href}>{actionLabel}</Link> : null}</div>;
}
