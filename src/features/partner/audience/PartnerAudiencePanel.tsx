import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info, RefreshCw, Users } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { withPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";
import type { PartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

type Metric = {
  id: string;
  label: string;
  value: number | null;
  status: "ready" | "collecting" | "not_connected";
  latestAt: string | null;
  description: string;
  nextAction: { label: string; href: string };
};

type AudienceResponse = {
  metrics: Metric[];
  lastActivityAt: string | null;
  privacy: { minimumReportableAudience: number };
};

function formatDate(value: string | null) {
  if (!value) return "No attributable activity yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recent activity" : `Last activity ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}`;
}

export function PartnerAudiencePanel({ scope }: { scope: PartnerWorkspaceScope }) {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; data: AudienceResponse | null }>({ status: "loading", data: null });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ status: "loading", data: null });
      try {
        const session = await supabaseClient?.auth.getSession();
        const token = session?.data?.session?.access_token;
        if (!token) throw new Error("Sign in with an authorized partner account to review activity.");
        const response = await fetch("/api/partner/audience/overview?range=30d", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || "Audience activity is not available right now.");
        setState({ status: "ready", data: body });
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") setState({ status: "error", data: null });
      }
    }
    load();
    return () => controller.abort();
  }, [refreshKey]);

  if (state.status === "loading") return <section className="dp-workspace-registry-panel dp-audience-panel" aria-live="polite"><p>Reading the latest attributable activity…</p></section>;
  if (state.status === "error" || !state.data) return <section className="dp-workspace-registry-panel dp-audience-panel"><Info aria-hidden="true" /><h2>Audience activity is not available yet.</h2><p>Sign in with the organization that owns this workspace. The page will only show activity attributed to that partner.</p></section>;

  return <section className="dp-workspace-registry-panel dp-audience-panel" aria-labelledby="partner-audience-title">
    <header className="dp-workspace-panel-header">
      <span>People</span>
      <h2 id="partner-audience-title">See the response without exposing personal details.</h2>
      <p>Residents, guests, attendees, and leads are independently attributed to this partner. There are no estimates, borrowed totals, or contact records on this screen.</p>
      <div className="dp-workspace-panel-actions">
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)}><RefreshCw aria-hidden="true" />Refresh</button>
      </div>
    </header>
    <div className="dp-workspace-row-list" aria-label="Audience activity">
      {state.data.metrics.map((metric) => <article key={metric.id} className="dp-workspace-row dp-audience-panel__row">
        <div><strong>{metric.label}</strong><small>{metric.description}</small></div>
        <div className="dp-audience-panel__result"><strong>{metric.value === null ? "—" : metric.value.toLocaleString()}</strong><small>{metric.status === "ready" ? formatDate(metric.latestAt) : metric.status === "collecting" ? "Collecting safely" : "Not connected"}</small><Link to={withPartnerWorkspaceScope(metric.nextAction.href, scope)}>{metric.nextAction.label}</Link></div>
      </article>)}
    </div>
    <p className="dp-workspace-note"><Users aria-hidden="true" />Counts appear at {state.data.privacy.minimumReportableAudience}+ people. This protects individual privacy while keeping the follow-up tied to actual activity.</p>
  </section>;
}
