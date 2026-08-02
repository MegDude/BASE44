import { Link } from "react-router-dom";
import {
  ADMIN_STUDIO_MASTER_ROUTES,
  BACKEND_AUTHORIZATION_CHAIN,
  CANONICAL_BACKEND_RECORDS,
  PARTNER_WORKSPACE_SHELL,
  PRODUCT_ACTIVITY_EVENTS,
  REQUIRED_ADD_ON_CATALOG_CONTRACT,
  SUPER_ADMIN_CONTRACT,
} from "@/lib/platformControlPlane/contracts";

const RELEASE_PHASES = [
  ["Foundation", "Identity, roles, organizations, buildings, residents, map entities, memberships, plans, add-ons, entitlements, payments, audit logs, and server authorization contracts."],
  ["Isolation", "Row-level data access rules for every resident, building, organization, portfolio, listing, and workspace query."],
  ["Provisioning", "51-partner reconciliation, prebuilt workspaces, The Shore reference resident flow, QR issuance, and payment-webhook entitlement activation."],
  ["Operations", "Admin Studio control plane for Super Admin, support, audit logs, integrations, reports, and safe provisioning retries."],
];

export default function BackendMasterControlPlaneResource() {
  return (
    <main className="dp-admin-resource-page">
      <header>
        <Link to="/admin-studio/command-center">Admin home</Link>
        <p>Backend master build</p>
        <h1>Platform control plane contract.</h1>
        <p>
          This page documents the platform contract. It does not show live backend status, grant permissions,
          activate modules, or create operational records.
        </p>
      </header>

      <aside>
        <strong>Backend Platform owns persistence, RBAC, Stripe webhooks, QR validation, reporting, and integrations.</strong>
        <p>BASE44 may consume these contracts and render safe states, but user access must be server-authorized before data loads.</p>
      </aside>

      <section aria-labelledby="super-admin-contract">
        <h2 id="super-admin-contract">Required backend contract — not verified account state</h2>
        <div className="dp-admin-resource-sections">
          <article>
            <div>
              <strong>Super Admin requirements</strong>
              <p>Architecture documentation only. Actual role, entitlement, and scope must come from authorized backend APIs in a later release.</p>
              <span>Requires server authorization and audit logging for every consequential action.</span>
              <code>{SUPER_ADMIN_CONTRACT.verifiedEmail} · {SUPER_ADMIN_CONTRACT.role} · {SUPER_ADMIN_CONTRACT.scope}</code>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="release-phases">
        <h2 id="release-phases">Release phases</h2>
        <div className="dp-admin-resource-sections">
          {RELEASE_PHASES.map(([title, description]) => (
            <article key={title}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
                <span>Separate PR and production gate required</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="authorization-chain">
        <h2 id="authorization-chain">Server authorization chain</h2>
        <div className="dp-admin-resource-sections">
          {BACKEND_AUTHORIZATION_CHAIN.map((step, index) => (
            <article key={step}>
              <div>
                <strong>{String(index + 1).padStart(2, "0")}. {step}</strong>
                <p>Must pass before any protected resident, partner, building, portfolio, listing, entitlement, or report data loads.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-routes">
        <h2 id="admin-routes">Admin Studio master routes</h2>
        <div className="dp-admin-resource-sections">
          {ADMIN_STUDIO_MASTER_ROUTES.map((route) => (
            <article key={route}>
              <div>
                <strong>{route}</strong>
                <p>Route must resolve through backend role, scope, entitlement, and audit contracts before showing operational data.</p>
              </div>
              <Link to={route}>Open route</Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspace-shell">
        <h2 id="workspace-shell">Partner workspace shell</h2>
        <div className="dp-admin-resource-sections">
          {PARTNER_WORKSPACE_SHELL.map((route) => (
            <article key={route}>
              <div>
                <strong>{route}</strong>
                <p>Visible only when the backend returns an authorized organization scope and active entitlement.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="records">
        <h2 id="records">Canonical backend records</h2>
        <p>{CANONICAL_BACKEND_RECORDS.length} backend-owned record classes are required by the directive.</p>
        <div className="dp-admin-resource-sections">
          {CANONICAL_BACKEND_RECORDS.map((record) => (
            <article key={record}>
              <div>
                <strong>{record}</strong>
                <p>Operational records require organization scope where applicable and row-level data isolation.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="addons">
        <h2 id="addons">Add-on catalog contract</h2>
        <p>{REQUIRED_ADD_ON_CATALOG_CONTRACT.length} active module contracts are defined for the server-managed add-on catalog.</p>
        <div className="dp-admin-resource-sections">
          {REQUIRED_ADD_ON_CATALOG_CONTRACT.map((addon) => (
            <article key={addon.key}>
              <div>
                <strong>{addon.name}</strong>
                <p>{addon.description}</p>
                <span>{addon.billingMode} · {addon.status}</span>
                <code>{addon.route || "No route"}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="auth-recovery">
        <h2 id="auth-recovery">Authentication and recovery contract</h2>
        <div className="dp-admin-resource-sections">
          {[
            ["Email + password", "Available at platform sign-in surfaces with server-side auth provider validation."],
            ["Forgot password?", "Routes to /reset-password and submits to the canonical backend auth provider."],
            ["Super-admin recovery", "me@megdude.com must recover access through verified provider reset and server-resolved role data."],
            ["Audit-safe recovery", "Reset requested, completed, sessions revoked, and sign-in outcomes are logged without secrets."],
          ].map(([title, description]) => (
            <article key={title}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
                <span>Documentation-only contract; live behavior must come from authorized backend APIs.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="events">
        <h2 id="events">Activity and audit event contract</h2>
        <div className="dp-admin-resource-sections">
          {PRODUCT_ACTIVITY_EVENTS.map((eventName) => (
            <article key={eventName}>
              <div>
                <strong>{eventName}</strong>
                <p>Event must be scoped to the authenticated user and permitted organization, building, portfolio, or listing.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
