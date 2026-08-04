const API_PREFIX = "/api/";
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

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

function buildBackendRequest(request, backendOrigin) {
  const incoming = new URL(request.url);
  const target = new URL(backendOrigin);
  target.pathname = `${target.pathname}${incoming.pathname}`.replace(/\/{2,}/g, "/");
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

  return new Request(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}

async function proxyApi(request, env) {
  const backendOrigin = getBackendOrigin(env);
  if (!backendOrigin) {
    return jsonError(503, "BACKEND_NOT_CONFIGURED", "The Downtown Perks platform API is not configured.");
  }

  try {
    const response = await fetch(buildBackendRequest(request, backendOrigin));
    return new Response(response.body, response);
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
