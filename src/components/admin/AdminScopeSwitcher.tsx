import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthorizedAdminScope, type AdminScope, type AdminScopeResponse } from "@/lib/admin/adminScopeClient";

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

export function AdminScopeSwitcher() {
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

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getAuthorizedAdminScope(requested, controller.signal)
      .then((next) => { setData(next); setStatus("ready"); })
      .catch(() => setStatus("error"));
    return () => controller.abort();
  }, [requested]);

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
    navigate(`${location.pathname}?${nextParams.toString()}`, { replace: false });
    setOpen(false);
  }

  const label = listing?.name || portfolio?.name || organization?.name || "All organizations";
  return (
    <section className="dp-admin-scope" aria-label="Administrator organization scope">
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Trigger asChild>
          <button type="button" className="dp-admin-scope__trigger" disabled={status !== "ready"}>
            <span>Active scope</span><strong>{status === "loading" ? "Loading authorized organizations…" : status === "error" ? "Scope unavailable" : label}</strong>
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
              {data.role === "super_admin" ? <button type="button" onClick={() => selectScope({})}><span><strong>All organizations</strong><small>Platform-wide view</small></span></button> : null}
              {results.map((item) => <button type="button" key={`${item.type}-${item.id}`} onClick={() => selectScope({ organizationId: item.organizationId, portfolioId: item.portfolioId, listingId: item.listingId })}><span><em>{item.type}</em><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
