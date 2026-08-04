const API_PREFIX = "/api/";
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};
const FORWARDED_REQUEST_HEADERS = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
  "if-match",
  "if-none-match",
  "range",
  "user-agent",
]);
const RETURNED_RESPONSE_HEADERS = new Set([
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "content-language",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
  "retry-after",
  "set-cookie",
  "vary",
  "www-authenticate",
]);

function jsonError(status, code, error) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: JSON_HEADERS,
  });
}

function getBackendOrigin(env) {
  const configured = String(env.BACKEND_ORIGIN || "").trim();
  if (!configured) return null;

  try {
    const origin = new URL(configured);
    if (origin.protocol !== "https:" && origin.hostname !== "localhost" && origin.hostname !== "127.0.0.1") {
      return null;
    }
    origin.pathname = origin.pathname.replace(/\/+$/, "");
    origin.search = "";
    origin.hash = "";
    return origin;
  } catch {
    return null;
  }
}

function getAllowedAppOrigins(env, requestUrl) {
  const requestOrigin = new URL(requestUrl).origin;
  const configured = String(env.APP_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([requestOrigin, ...configured]);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || !getAllowedAppOrigins(env, request.url).has(origin)) return null;
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, If-Match, If-None-Match",
    "Access-Control-Allow-Methods": "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function buildBackendRequest(request, backendOrigin, env) {
  const incoming = new URL(request.url);
  const target = new URL(backendOrigin);
  target.pathname = `${target.pathname}${incoming.pathname}`.replace(/\/{2,}/g, "/");
  target.search = incoming.search;

  const headers = new Headers();
  for (const [name, value] of request.headers) {
    if (FORWARDED_REQUEST_HEADERS.has(name.toLowerCase())) headers.set(name, value);
  }
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));
  headers.set("x-forwarded-for", request.headers.get("CF-Connecting-IP") || "");
  headers.set("x-downtown-perks-proxy", "cloudflare-app");
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && getAllowedAppOrigins(env, request.url).has(requestOrigin)) headers.set("origin", requestOrigin);

  return new Request(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}

function backendResponse(response, backendOrigin, request, env) {
  const headers = new Headers();
  for (const [name, value] of response.headers) {
    if (RETURNED_RESPONSE_HEADERS.has(name.toLowerCase())) headers.append(name, value);
  }

  const location = response.headers.get("Location");
  if (location) {
    const resolved = new URL(location, backendOrigin);
    if (resolved.origin === backendOrigin.origin) {
      const incoming = new URL(request.url);
      resolved.protocol = incoming.protocol;
      resolved.host = incoming.host;
      headers.set("Location", resolved.toString());
    }
  }

  const cors = corsHeaders(request, env);
  if (cors) Object.entries(cors).forEach(([name, value]) => headers.set(name, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function proxyApi(request, env) {
  const backendOrigin = getBackendOrigin(env);
  if (!backendOrigin) {
    return jsonError(503, "BACKEND_NOT_CONFIGURED", "The Downtown Perks platform API is not configured.");
  }

  const upgrade = request.headers.get("Upgrade");
  if (upgrade && upgrade.toLowerCase() === "websocket") {
    return jsonError(501, "WEBSOCKET_NOT_SUPPORTED", "WebSocket API routes require a dedicated backend service binding.");
  }

  if (request.method === "OPTIONS") {
    const cors = corsHeaders(request, env);
    return cors
      ? new Response(null, { status: 204, headers: cors })
      : jsonError(403, "ORIGIN_NOT_ALLOWED", "This origin is not allowed to call the Downtown Perks platform API.");
  }

  try {
    const response = await fetch(buildBackendRequest(request, backendOrigin, env));
    return backendResponse(response, backendOrigin, request, env);
  } catch (error) {
    console.error(JSON.stringify({
      event: "backend_proxy_failed",
      path: new URL(request.url).pathname,
      message: error instanceof Error ? error.message : "Unknown upstream error",
    }));
    return jsonError(502, "BACKEND_UNAVAILABLE", "The Downtown Perks platform API is temporarily unavailable.");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/resident-app") {
      return Response.redirect(
        new URL("/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured", request.url),
        308,
      );
    }

    if (url.pathname === "/api" || url.pathname.startsWith(API_PREFIX)) {
      return proxyApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
