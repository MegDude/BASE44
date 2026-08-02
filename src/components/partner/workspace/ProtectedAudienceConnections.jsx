import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { getWorkspaceAudience, getWorkspaceConnections, requestWorkspaceConnection } from "@/lib/partner/audienceConnectionsClient";
import { withPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

function formatFreshness(value) {
  if (!value) return "Freshness pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Freshness pending";
  return `Verified ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function statusLabel(value) {
  return String(value || "needs_connection").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function DataState({ state, error, children }) {
  if (state === "loading") return <section className="dp-protected-workspace-empty"><strong>Loading protected workspace data.</strong><p>Reading the authenticated server-authorized scope.</p></section>;
  if (state === "error") return <section className="dp-protected-workspace-empty" role="alert"><strong>This module is not available yet.</strong><p>{error}</p></section>;
  return children;
}

export function ProtectedAudiencePanel({ scope, hasPrivilegedAccess = false }) {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    getWorkspaceAudience(scope, controller.signal)
      .then((data) => { setPayload(data); setState("ready"); })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err?.message || "Audience data could not be loaded.");
        setState("error");
      });
    return () => controller.abort();
  }, [scope?.organizationId, scope?.portfolioId, scope?.listingId, scope?.range]);

  const audience = payload?.audience || {};
  const totals = audience.totals || {};
  const buildings = Array.isArray(audience.buildings) ? audience.buildings : [];
  const sources = Array.isArray(audience.sources) ? audience.sources : [];
  const setupHref = withPartnerWorkspaceScope(hasPrivilegedAccess ? "/partner-workspace/connections?action=connect-audience" : "/partner-workspace/profile?section=support&topic=audience", scope || {});

  return (
    <DataState state={state} error={error}>
      <MotionSafeSection className="dp-protected-workspace-module dp-audience-module" aria-labelledby="protected-audience-title">
        <header className="dp-protected-workspace-header">
          <span>Protected audience</span>
          <h2 id="protected-audience-title">Consent-aware resident reach.</h2>
          <p>Only aggregate counts are shown. Cohorts under {audience.minimumCohortSize || 5} are suppressed for partner workspaces.</p>
        </header>

        <div className="dp-audience-metrics" aria-label="Aggregate audience counts">
          <article><span>Eligible residents</span><strong>{totals.eligible?.display || "0"}</strong><small>{totals.eligible?.suppressed ? "Suppressed minimum cohort" : "Server-authorized aggregate"}</small></article>
          <article><span>Contactable residents</span><strong>{totals.contactable?.display || "0"}</strong><small>Consent-aware only</small></article>
          <article><span>Connected buildings</span><strong>{String(buildings.length)}</strong><small>{audience.status === "connected" ? "Verified audience scope" : "No verified scope"}</small></article>
          <article><span>Consent-aware activity</span><strong>{totals.activity?.display || totals.contactable?.display || "0"}</strong><small>Person-level records excluded</small></article>
        </div>

        <section className="dp-protected-workspace-state" aria-labelledby="audience-source-title">
          <div><p>Source and freshness</p><h3 id="audience-source-title">{audience.status === "connected" ? "Verified audience source connected." : "No verified audience is connected yet."}</h3></div>
          <ul>{sources.length ? sources.map((source) => <li key={source.name}><strong>{source.name}</strong><span>{statusLabel(source.status)} · {formatFreshness(source.lastSyncedAt)}</span></li>) : <li><strong>No verified audience is connected yet.</strong><span>Connect an authorized building source before counts appear.</span></li>}</ul>
        </section>

        {buildings.length ? (
          <div className="dp-protected-row-list">
            {buildings.map((building, index) => (
              <article key={`${building.name}-${index}`}>
                <div><strong>{building.name || "Authorized building"}</strong><small>{building.district || "Authorized workspace scope"}</small></div>
                <span>{building.eligible?.display || "0"} eligible</span>
                <span>{building.contactable?.display || "0"} contactable</span>
              </article>
            ))}
          </div>
        ) : (
          <section className="dp-protected-workspace-empty">
            <strong>No verified audience is connected yet.</strong>
            <p>{hasPrivilegedAccess ? "Add an authorized building connection to activate aggregate resident counts." : "Ask support to connect the verified buildings available to your workspace."}</p>
            <Link to={setupHref}>{hasPrivilegedAccess ? "Authorize building connection" : "Request help"}<ArrowRight aria-hidden="true" /></Link>
          </section>
        )}
      </MotionSafeSection>
    </DataState>
  );
}

export function ProtectedConnectionsPanel({ scope }) {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [requesting, setRequesting] = useState("");

  const load = (signal) => {
    setState("loading");
    return getWorkspaceConnections(scope, signal)
      .then((data) => { setPayload(data); setState("ready"); })
      .catch((err) => {
        if (signal?.aborted) return;
        setError(err?.message || "Connections could not be loaded.");
        setState("error");
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [scope?.organizationId, scope?.portfolioId, scope?.listingId, scope?.range]);

  async function requestConnection(provider) {
    setRequesting(provider);
    try {
      await requestWorkspaceConnection(scope, provider, "Requested from protected workspace Connections module.");
      await load();
    } catch (err) {
      setError(err?.message || "Connection request failed.");
      setState("error");
    } finally {
      setRequesting("");
    }
  }

  const cards = Array.isArray(payload?.cards) ? payload.cards : [];
  const supportHref = withPartnerWorkspaceScope("/partner-workspace/profile?section=support&topic=connections", scope || {});

  return (
    <DataState state={state} error={error}>
      <MotionSafeSection className="dp-protected-workspace-module dp-connections-module" aria-labelledby="protected-connections-title">
        <header className="dp-protected-workspace-header">
          <span>Connections</span>
          <h2 id="protected-connections-title">Verified sources and setup requests.</h2>
          <p>Request connection creates a backend work item only. The workspace never asks for API keys, passwords, tokens, or webhook secrets.</p>
        </header>
        <div className="dp-connections-table" role="table" aria-label="Workspace connections">
          <div role="row" className="dp-connections-table-head"><span>Service</span><span>Connection</span><span>Last update</span><span>What it supports</span><span>Status</span><span>Action</span></div>
          {cards.map((card) => {
            const requested = card.request?.status === "requested" || card.status === "requested";
            const canOpenAnalytics = card.action === "open_analytics";
            return (
              <div role="row" key={card.id} className="dp-connections-table-row">
                <span><strong>{card.service}</strong><small>{card.source || "Downtown Perks"}</small></span>
                <span>{card.connection}</span>
                <span>{formatFreshness(card.lastUpdate)}</span>
                <span>{card.detail}</span>
                <span><i data-status={card.status}>{statusLabel(requested ? "requested" : card.status)}</i></span>
                <span>
                  {canOpenAnalytics ? <Link to={withPartnerWorkspaceScope("/partner-workspace/analytics", scope || {})}>Open analytics</Link> : requested ? <Link to={supportHref}>Contact support</Link> : card.status === "failed" ? <button type="button" onClick={() => requestConnection(card.provider || card.id)} disabled={requesting === (card.provider || card.id)}><RefreshCw aria-hidden="true" />Retry</button> : <button type="button" onClick={() => requestConnection(card.provider || card.id)} disabled={!!requesting}>Request connection</button>}
                </span>
              </div>
            );
          })}
        </div>
      </MotionSafeSection>
    </DataState>
  );
}

function MotionSafeSection(props) {
  const { children, ...rest } = props;
  return <section {...rest}>{children}</section>;
}
