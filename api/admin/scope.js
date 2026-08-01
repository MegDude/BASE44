import {
  requireAuthenticatedUser,
  requireTransactionDatabase,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";
import { requestCorrelationId } from "../../src/lib/api/backendTransactionContext.js";
import {
  ADMIN_SCOPE_EVENTS,
  ADMIN_SCOPE_LEVELS,
  adminScopeLevel,
  emptyAdminScopeResponse,
  parseAdminScopeQuery,
  serializeAdminScopeResponse,
  validateAdminScopeInput,
} from "../../src/lib/admin/adminScopeContract.js";

const ADMIN_ROLES = new Set(["admin", "platform_admin", "super_admin"]);
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);

function platformRole(user) {
  const app = user?.app_metadata || {};
  if (app.is_super_admin === true) return "super_admin";
  return clean(app.platform_role || app.role || user?.user_metadata?.platform_role || user?.user_metadata?.role, 80).toLowerCase();
}

function adminScopeRequestId(req) {
  return clean(req?.headers?.["x-vercel-id"], 128) || requestCorrelationId(req);
}

const ADMIN_SCOPE_LEVELS_SAFE = new Set(ADMIN_SCOPE_LEVELS);

function logAdminScope(event, input = {}) {
  const entry = {
    level: event === ADMIN_SCOPE_EVENTS.failed ? "error" : "info",
    event,
    route: "/api/admin/scope",
    requestId: clean(input.requestId, 128) || undefined,
    deploymentSha: clean(process.env.VERCEL_GIT_COMMIT_SHA, 80) || undefined,
    durationMs: Number.isFinite(input.durationMs) ? input.durationMs : undefined,
    statusCode: Number.isFinite(input.statusCode) ? input.statusCode : undefined,
    actorRole: clean(input.actorRole, 80) || "unknown",
    scopeLevel: ADMIN_SCOPE_LEVELS_SAFE.has(input.scopeLevel) ? input.scopeLevel : "none",
  };
  const line = JSON.stringify(entry);
  if (entry.level === "error") console.error(line);
  else console.log(line);
}

export default async function handler(req, res) {
  const startedAt = Date.now();
  const requestId = adminScopeRequestId(req);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Request-Id", requestId);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed", requestId });
  const requestedScope = parseAdminScopeQuery(req.query);
  let role = "unknown";
  try {
    logAdminScope(ADMIN_SCOPE_EVENTS.requested, {
      requestId,
      actorRole: role,
      scopeLevel: adminScopeLevel(requestedScope),
    });

    const validation = validateAdminScopeInput(requestedScope);
    if (!validation.ok) {
      throw new TransactionApiError(400, validation.code, validation.message);
    }

    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);
    role = platformRole(user);
    if (!ADMIN_ROLES.has(role)) {
      throw new TransactionApiError(403, "ADMIN_ACCESS_REQUIRED", "Administrator access is required.");
    }

    let organizationQuery = database.from("partner_organizations").select("id,name,external_id,status,legacy_partner_id").order("name");
    if (role !== "super_admin") {
      const { data: memberships, error: membershipError } = await database.from("partner_users").select("partner_id,role,active").eq("auth_user_id", user.id).eq("active", true);
      if (membershipError) throw membershipError;
      const partnerIds = [...new Set((memberships || []).map((item) => item.partner_id).filter(Boolean))];
      if (!partnerIds.length) {
        const body = emptyAdminScopeResponse(role);
        logAdminScope(ADMIN_SCOPE_EVENTS.denied, {
          requestId,
          actorRole: role,
          scopeLevel: "none",
          statusCode: 200,
          durationMs: Date.now() - startedAt,
        });
        return res.status(200).json({ ...body, requestId });
      }
      organizationQuery = organizationQuery.in("legacy_partner_id", partnerIds);
    }

    const { data: organizations, error: organizationError } = await organizationQuery;
    if (organizationError) throw organizationError;
    const organizationIds = (organizations || []).map((item) => item.id);
    const [{ data: portfolios, error: portfolioError }, { data: listings, error: listingError }] = organizationIds.length
      ? await Promise.all([
          database.from("partner_portfolios").select("id,organization_id,name,status").in("organization_id", organizationIds).order("name"),
          database.from("partner_listings").select("id,organization_id,portfolio_id,name,status,entity_id").in("organization_id", organizationIds).order("name"),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (portfolioError) throw portfolioError;
    if (listingError) throw listingError;

    const organization = (organizations || []).find((item) => item.id === requestedScope.organizationId);
    const portfolio = organization && (portfolios || []).find((item) => item.id === requestedScope.portfolioId && item.organization_id === organization.id);
    const listing = organization && (listings || []).find((item) => item.id === requestedScope.listingId && item.organization_id === organization.id && (!portfolio || !item.portfolio_id || item.portfolio_id === portfolio.id));
    const activeScope = { organizationId: organization?.id, portfolioId: portfolio?.id, listingId: listing?.id };
    const body = serializeAdminScopeResponse({
      role,
      organizations: organizations || [],
      portfolios: portfolios || [],
      listings: listings || [],
      activeScope,
    });

    logAdminScope(ADMIN_SCOPE_EVENTS.resolved, {
      requestId,
      actorRole: role,
      scopeLevel: adminScopeLevel(body.activeScope),
      statusCode: 200,
      durationMs: Date.now() - startedAt,
    });

    return res.status(200).json({ ...body, requestId });
  } catch (error) {
    const statusCode = error instanceof TransactionApiError ? error.status : 500;
    logAdminScope(statusCode >= 500 ? ADMIN_SCOPE_EVENTS.failed : ADMIN_SCOPE_EVENTS.denied, {
      requestId,
      actorRole: role,
      scopeLevel: statusCode >= 500 ? adminScopeLevel(requestedScope) : "none",
      statusCode,
      durationMs: Date.now() - startedAt,
    });
    if (error instanceof TransactionApiError) {
      return res.status(error.status).json({ ok: false, code: error.code, error: error.message, requestId });
    }
    return res.status(500).json({ ok: false, code: "ADMIN_SCOPE_FAILED", error: "Administrator scope could not be loaded.", requestId });
  }
}
