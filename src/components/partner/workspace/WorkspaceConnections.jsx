import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { getWorkspaceConnections, requestWorkspaceConnection } from "@/lib/partner/workspaceConnectionsClient";
import { withPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

const PROVIDERS = [
  ["luxury_presence", "Luxury Presence", "SEO, listing demand, favorites, inquiries, and qualified follow-up"],
  ["google_analytics", "Google Analytics", "Verified web traffic and source attribution"],
  ["stripe", "Stripe", "Subscription and payment-status reporting"],
  ["resend", "Resend", "Delivery, open, and click reporting"],
  ["webhook", "Custom webhook", "A verified partner-system event feed"],
];

function date(value) {
  if (!value) return "Not reported";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function WorkspaceConnections({ scope = {} }) {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [provider, setProvider] = useState("luxury_presence");
  const [note, setNote] = useState("");
  const [requesting, setRequesting] = useState(false);

  const requestScope = useMemo(() => ({
    organizationId: scope.organizationId,
    portfolioId: scope.portfolioId,
    listingId: scope.listingId,
  }), [scope.organizationId, scope.portfolioId, scope.listingId]);

  const load = async () => {
    setState({ status: "loading", data: null, error: "" });
    try {
      const data = await getWorkspaceConnections(requestScope);
      setState({ status: "ready", data, error: "" });
    } catch (error) {
      setState({ status: "error", data: null, error: error?.message || "Connections could not be loaded." });
    }
  };

  useEffect(() => { load(); }, [requestScope.organizationId, requestScope.portfolioId, requestScope.listingId]);

  const requestConnection = async (event) => {
    event.preventDefault();
    setRequesting(true);
    try {
      await requestWorkspaceConnection(requestScope, provider, note);
      setNote("");
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error: error?.message || "The request could not be sent." }));
    } finally {
      setRequesting(false);
    }
  };

  if (state.status === "loading") return <section className="dp-workspace-connections"><p>Loading authorized services…</p></section>;
  if (state.status === "error") return <section className="dp-workspace-connections"><p role="alert">{state.error}</p><button type="button" onClick={load}>Try again</button></section>;
  if (!state.data) return null;

  const { cards, scope: authorizedScope } = state.data;
  return (
    <section className="dp-workspace-connections" aria-labelledby="workspace-connections-title">
      <header className="dp-workspace-connections__header">
        <p>Connections</p>
        <h2 id="workspace-connections-title">Use sources you can trust.</h2>
        <span>{authorizedScope.organizationName} · sources update only when their provider sends verified records.</span>
      </header>

      <div className="dp-workspace-connections__table" role="table" aria-label="Workspace services">
        <div className="dp-workspace-connections__table-head" role="row">
          <span>Service</span><span>Connection</span><span>Last update</span><span>What it supports</span><span>Status</span><span>Actions</span>
        </div>
        {cards.map((card) => (
          <article key={card.id} className="dp-workspace-connections__row" role="row">
            <div role="cell"><strong>{card.service}</strong>{card.detail ? <small>{card.detail}</small> : null}</div>
            <div role="cell"><span>{card.connection}</span></div>
            <div role="cell"><span>{date(card.status.lastUpdated)}</span></div>
            <div role="cell"><span>{card.supports}</span></div>
            <div role="cell"><em data-status={card.status.code}>{card.status.label}</em>{typeof card.value === "number" ? <small>{card.value.toLocaleString()} verified records</small> : null}</div>
            <div role="cell">{card.action ? <span>{card.action}</span> : <Link to={withPartnerWorkspaceScope("/partner-workspace/analytics", scope)}>View analytics <ArrowRight size={14} /></Link>}</div>
          </article>
        ))}
      </div>

      <section className="dp-workspace-connections__request" aria-labelledby="request-connection-title">
        <div><p>Partner action</p><h3 id="request-connection-title">Request a secure connection</h3><span>Requests create a backend work item. Your API keys, passwords, and provider tokens stay outside the browser.</span></div>
        <form onSubmit={requestConnection}>
          <label><span>Service</span><select value={provider} onChange={(event) => setProvider(event.target.value)}>{PROVIDERS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label><span>What should this support?</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1200} placeholder="Example: connect listing inquiry events for The Shore." /></label>
          <button type="submit" disabled={requesting}>{requesting ? "Sending…" : "Request connection"}</button>
        </form>
      </section>

      <div className="dp-workspace-connections__actions">
        <Link to={withPartnerWorkspaceScope("/partner-workspace/analytics", scope)}>Open analytics</Link>
        <Link to={withPartnerWorkspaceScope("/partner-workspace/audience", scope)}>Open audience</Link>
        <button type="button" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </section>
  );
}
