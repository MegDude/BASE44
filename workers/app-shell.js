const API_PREFIX = "/api/";

function backendUrl(requestUrl, backendOrigin) {
  const incoming = new URL(requestUrl);
  const target = new URL(backendOrigin);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  return target;
}

function backendRequest(request, targetUrl) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", new URL(request.url).host);
  headers.set("x-forwarded-proto", new URL(request.url).protocol.replace(":", ""));
  return new Request(targetUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;

    if (pathname === "/resident-app") {
      return Response.redirect(new URL("/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured", request.url), 308);
    }

    if (pathname.startsWith(API_PREFIX)) {
      const origin = String(env.BACKEND_PLATFORM_ORIGIN || "").trim();
      if (!origin) {
        return Response.json(
          { error: "Backend platform is not configured for this environment." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }

      try {
        const target = backendUrl(request.url, origin);
        return await fetch(backendRequest(request, target));
      } catch {
        return Response.json(
          { error: "Backend platform is unavailable." },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
