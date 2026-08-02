import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronDown, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthorizedAdminScope, type AdminScope, type AdminScopeResponse } from "@/lib/admin/adminScopeClient";
import { writePartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

const EMPTY: AdminScopeResponse = { role: "", organizations: [], portfolios: [], listings: [], activeScope: {} };
type ScopeResult = {
  type: "Organization" | "Portfolio" | "Listing";
  id: string;
  organizationId: string;
  portfolioId?: string;
  listingId?: string;
  label: string;
  detail: string;
};

export function AdminScopeSwitcher({ onScopeResolved }: { onScopeResolved?: (scope: AdminScope) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requested = useMemo<AdminScope>(() => ({
    organizationId: params.get("organizationId") || undefined,
    portfolioId: params.get("portfolioId") || undefined,
    listingId: params.get("listingId") || undefined,
  }), [params]);
  const [data, setData] = useState<AdminScopeResponse>(EMPTY);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function loadScope(signal?: AbortSignal) {
    // Never continue rendering records from the previous organization while
    // the server authorizes a newly requested scope.
    onScopeResolved?.({});
    setStatus("loading");
    return getAuthorizedAdminScope(requested, signal)
      .then((next) => {
        setData(next);
        setStatus((next.organizations.length || next.role === "super_admin") ? "ready" : "error");
        onScopeResolved?.(next.activeScope);
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    const controller = new AbortController();
    loadScope(controller.signal);
    return () => controller.abort();
  }, [onScopeResolved, requested]);

  const organization = data.organizations.find((item) => item.id === data.activeScope.organizationId);
  const portfolio = data.portfolios.find((item) => item.id === data.activeScope.portfolioId);
  const listing = data.listings.find((item) => item.id === data.activeScope.listingId);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    const organizations: ScopeResult[] = data.organizations.map((item) => ({ type: "Organization", id: item.id, organizationId: item.id, label: item.name, detail: item.status || "Organization" }));
    const portfolios: ScopeResult[] = data.portfolios.map((item) => ({ type: "Portfolio", id: item.id, organizationId: item.organization_id, portfolioId: item.id, label: item.name, detail: data.organizations.find((organizationItem) => organizationItem.id === item.organization_id)?.name || "Portfolio" }));
    const listings: ScopeResult[] = data.listings.map((item) => ({ type: "Listing", id: item.id, organizationId: item.organization_id, portfolioId: item.portfolio_id, listingId: item.id, label: item.name, detail: item.address || "Listing or property" }));
    const all: ScopeResult[] = [...organizations, ...portfolios, ...listings];
    return normalizedQuery ? all.filter((item) => `${item.label} ${item.detail} ${item.type}`.toLowerCase().includes(normalizedQuery)) : all;
  }, [data, normalizedQuery]);

  function selectScope(next: AdminScope) {
    const nextParams = new URLSearchParams(location.search);
    ["organizationId", "portfolioId", "listingId"].forEach((key) => nextParams.delete(key));
    Object.entries(next).forEach(([key, value]) => { if (value) nextParams.set(key, value); });
    sessionStorage.setItem("dp_admin_workspace:scope", JSON.stringify(next));
    writePartnerWorkspaceScope(next);
    navigate(`${location.pathname}?${nextParams.toString()}`, { replace: false });
    setOpen(false);
  }

  const label = listing?.name || portfolio?.name || organization?.name || (data.role === "super_admin" ? "Platform-wide access" : "Active workspace");
  const isSelectable = status === "ready" && (data.role === "super_admin" || results.length > 1);
  return (
    <section className="dp-admin-scope" aria-label="Administrator organization scope" data-state={status}>
      <DialogPrimitive.Root open={open && isSelectable} onOpenChange={(next) => setOpen(next && isSelectable)}>
        <DialogPrimitive.Trigger asChild>
          <button type="button" className="dp-admin-scope__trigger" aria-haspopup="dialog" aria-expanded={open && isSelectable}>
            <span>{status === "loading" ? "Active scope" : data.role === "super_admin" ? "Platform workspace" : "Active workspace"}</span>
            <strong>{status === "loading" ? "Loading authorized access…" : status === "error" ? "We could not load your authorized scope." : label}</strong>
            {isSelectable ? <ChevronDown aria-hidden="true" /> : null}
          </button>
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="dp-admin-scope__backdrop" />
          <DialogPrimitive.Content className="dp-admin-scope__sheet" aria-describedby={undefined}>
            <header><div><p>Admin Workspace</p><DialogPrimitive.Title>Choose scope</DialogPrimitive.Title></div>
              <DialogPrimitive.Close aria-label="Close organization selector"><X aria-hidden="true" /></DialogPrimitive.Close>
            </header>
            <label className="dp-admin-scope__search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search organization, portfolio, or listing" autoFocus /></label>
            <div className="dp-admin-scope__results">
              {data.role === "super_admin" ? <button type="button" onClick={() => selectScope({})}><span><strong>Platform-wide access</strong><small>All Downtown Perks</small></span></button> : null}
              {results.map((item) => <button type="button" key={`${item.type}-${item.id}`} onClick={() => selectScope({ organizationId: item.organizationId, portfolioId: item.portfolioId, listingId: item.listingId })}><span><em>{item.type}</em><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}
              {!results.length ? <p className="dp-admin-scope__empty">No workspace access yet. Your account is active, but no organization or listing has been assigned.</p> : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {status === "error" ? <button type="button" className="dp-admin-scope__retry" onClick={() => loadScope()}><RefreshCw aria-hidden="true" />Try again</button> : null}
    </section>
  );
}
