import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, UsersRound } from "lucide-react";
import { connectAudienceBuilding, getPartnerAudience } from "@/lib/partner/audienceClient";
import { withPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

function displayCount(value) {
  if (!value) return "0";
  return value.display ?? String(value.count ?? 0);
}

function audienceCampaignLink(scope, buildingId) {
  const base = withPartnerWorkspaceScope("/partner-workspace/campaigns", scope);
  if (!buildingId) return base;
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}audienceBuildingId=${encodeURIComponent(buildingId)}`;
}

export function WorkspaceAudience({ scope = {} }) {
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [connecting, setConnecting] = useState(false);

  const requestScope = useMemo(() => ({
    organizationId: scope.organizationId,
    portfolioId: scope.portfolioId,
    listingId: scope.listingId,
  }), [scope.organizationId, scope.portfolioId, scope.listingId]);

  const load = async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await getPartnerAudience(requestScope);
      setSnapshot(data);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError?.message || "Audience data could not be loaded.");
      setStatus("error");
    }
  };

  useEffect(() => { load(); }, [requestScope.organizationId, requestScope.portfolioId, requestScope.listingId]);

  const connectBuilding = async () => {
    if (!selectedBuildingId) return;
    setConnecting(true);
    setError("");
    try {
      await connectAudienceBuilding(requestScope, selectedBuildingId);
      setSelectedBuildingId("");
      await load();
    } catch (requestError) {
      setError(requestError?.message || "The building could not be connected.");
    } finally {
      setConnecting(false);
    }
  };

  if (status === "loading") return <div className="dp-audience-operations"><p className="dp-audience-operations__loading">Loading authorized audience operations…</p></div>;
  if (status === "error") return <div className="dp-audience-operations"><div className="dp-audience-operations__error"><p>{error}</p><button type="button" className="dp-audience-operations__secondary" onClick={load}>Try again</button></div></div>;
  if (!snapshot) return null;

  const { audience, activity, scope: authorizedScope, availableBuildings = [] } = snapshot;
  const isSetupRequired = audience.status === "setup_required";
  const selectedSegment = audience.buildings.find((building) => building.id === selectedBuildingId) || audience.buildings[0];
  const campaignHref = audienceCampaignLink(scope, selectedSegment?.id);

  return (
    <section className="dp-audience-operations" aria-labelledby="audience-operations-title">
      <header className="dp-audience-operations__header">
        <p className="dp-audience-operations__eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Audience operations</p>
        <h2 id="audience-operations-title">Use verified reach. Keep it consent-aware.</h2>
        <p className="dp-audience-operations__lede">
          This workspace shows only aggregate records from buildings explicitly connected to {authorizedScope.organizationName}. It never exposes a resident list.
        </p>
        <div className="dp-audience-operations__meta">
          <span>{authorizedScope.organizationName}</span>
          <span>Last 30 days of activity</span>
          <span>Refreshed now</span>
        </div>
      </header>

      <div className="dp-audience-operations__metrics" aria-label="Audience metrics">
        <div className="dp-audience-operations__metric"><span>Eligible residents</span><strong>{displayCount(audience.totals.eligible)}</strong><small>Active members in authorized buildings</small></div>
        <div className="dp-audience-operations__metric"><span>Contactable</span><strong>{displayCount(audience.totals.contactable)}</strong><small>Explicit partner-contact consent only</small></div>
        <div className="dp-audience-operations__metric"><span>Attributed actions</span><strong>{activity.total}</strong><small>Authorized workspace actions in 30 days</small></div>
      </div>

      {isSetupRequired ? (
        <div className="dp-audience-operations__empty">
          <p className="dp-audience-operations__eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Connection required</p>
          <h3>No building is connected to this workspace yet.</h3>
          <p className="dp-audience-operations__status">Connect a building only after confirming the organization has permission to use its aggregate resident audience.</p>
          {authorizedScope.isSuperAdmin ? (
            <>
              <select className="dp-audience-operations__select" value={selectedBuildingId} onChange={(event) => setSelectedBuildingId(event.target.value)} aria-label="Building to connect">
                <option value="">Choose a verified building</option>
                {availableBuildings.map((building) => <option key={building.id} value={building.id}>{building.name}{building.district ? ` · ${building.district}` : ""}</option>)}
              </select>
              <div className="dp-audience-operations__actions">
                <button type="button" disabled={!selectedBuildingId || connecting} className="dp-audience-operations__primary" onClick={connectBuilding}>
                  {connecting ? "Connecting…" : "Connect authorized building"}
                </button>
              </div>
            </>
          ) : <p className="dp-audience-operations__status">Ask a platform administrator to connect an authorized building before creating an audience-targeted campaign.</p>}
        </div>
      ) : (
        <div className="dp-audience-operations__grid">
          <section className="dp-audience-operations__section">
            <h3>Authorized segments</h3>
            <p>Choose a building for the next campaign handoff. Counts below the privacy threshold are suppressed for partner roles.</p>
            <div className="dp-audience-operations__rows">
              {audience.buildings.map((building) => (
                <div className="dp-audience-operations__row" key={building.id}>
                  <div><strong>{building.name}</strong><small>{building.district || "Downtown Austin"} · {displayCount(building.contactable)} contactable</small></div>
                  <span className="dp-audience-operations__row-count">{displayCount(building.eligible)}</span>
                </div>
              ))}
            </div>
            <div className="dp-audience-operations__actions">
              <Link className="dp-audience-operations__primary" to={campaignHref}>Create campaign <ArrowRight size={15} aria-hidden="true" /></Link>
              <Link className="dp-audience-operations__secondary" to={withPartnerWorkspaceScope("/partner-workspace/analytics?view=audience", scope)}>Open analytics</Link>
            </div>
          </section>

          <section className="dp-audience-operations__section">
            <h3>Source health</h3>
            <p>Only connected source records contribute to reach.</p>
            <ul className="dp-audience-operations__list">
              {audience.sources.length ? audience.sources.map((source) => (
                <li key={source.id}><span>{source.name}<br /><small>{source.status}{source.lastSyncedAt ? ` · synced ${new Date(source.lastSyncedAt).toLocaleDateString()}` : ""}</small></span><strong>{displayCount(source.eligible)}</strong></li>
              )) : <li><span>No active consented members yet.</span></li>}
            </ul>
          </section>

          <section className="dp-audience-operations__section">
            <h3>What people did</h3>
            <p>Attributed activity in this workspace—aggregate and privacy-safe.</p>
            <ul className="dp-audience-operations__list">
              {activity.actions.length ? activity.actions.map((item) => <li key={item.action}><span>{item.action.replaceAll("_", " ")}</span><strong>{item.count}</strong></li>) : <li><span>No attributed actions in the last 30 days.</span></li>}
            </ul>
          </section>

          <section className="dp-audience-operations__section">
            <h3>Privacy and routing</h3>
            <p className="dp-audience-operations__status">Audience data remains at aggregate level. Email addresses, member IDs, and resident profiles are not sent to this workspace.</p>
            <div className="dp-audience-operations__actions">
              <Link className="dp-audience-operations__secondary" to={withPartnerWorkspaceScope("/partner-workspace/residents", scope)}><UsersRound size={15} aria-hidden="true" /> People & access</Link>
              <button type="button" className="dp-audience-operations__secondary" onClick={load}><RefreshCw size={15} aria-hidden="true" /> Refresh data</button>
            </div>
          </section>
        </div>
      )}

      {error ? <p className="dp-audience-operations__error">{error}</p> : null}
    </section>
  );
}
