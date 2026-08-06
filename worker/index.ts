type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API?: { fetch(request: Request): Promise<Response> };
  API_BASE_URL: string;
};

function applySecurityHeaders(headers: Headers) {
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
}

async function proxyApi(request: Request, env: Env) {
  if (!env.API_BASE_URL) {
    return Response.json(
      { error: "The product API is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const incomingUrl = new URL(request.url);
  const apiPath = incomingUrl.pathname.slice(4) || "/";
  const upstreamPath = apiPath === "/agent/query" || apiPath === "/ask-map" ? "/agent" : apiPath;
  const upstreamUrl = new URL(`${upstreamPath}${incomingUrl.search}`, env.API_BASE_URL);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("X-Forwarded-Host", incomingUrl.host);
  headers.set("X-Forwarded-Proto", incomingUrl.protocol.replace(":", ""));

  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  const upstream = env.API ? await env.API.fetch(upstreamRequest) : await fetch(upstreamRequest);
  if (upstream.headers.get("Content-Type")?.includes("text/html")) {
    console.error("product_api_invalid_response", {
      path: upstreamPath,
      status: upstream.status,
      contentType: upstream.headers.get("Content-Type"),
    });
    return Response.json(
      { error: "The canonical API returned an invalid response." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "no-store");
  applySecurityHeaders(response.headers);
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/resident-app") {
      url.pathname = "/map";
      url.searchParams.set("mode", "resident");
      url.searchParams.set("tab", "map");
      return Response.redirect(url, 308);
    }
    if (url.pathname === "/founding-partner-collection") {
      url.pathname = "/founding-partners.html";
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        return await proxyApi(request, env);
      } catch (error) {
        console.error("product_api_proxy_error", {
          path: url.pathname,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        return Response.json(
          { error: "The product API could not be reached." },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    const lastSegment = url.pathname.split("/").filter(Boolean).at(-1) ?? "";
    if (url.pathname !== "/" && !lastSegment.includes(".")) {
      const indexUrl = new URL("/", url);
      const indexResponse = await env.ASSETS.fetch(new Request(indexUrl));
      const response = new Response(indexResponse.body, indexResponse);
      response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
      applySecurityHeaders(response.headers);
      return response;
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const response = new Response(assetResponse.body, assetResponse);
    applySecurityHeaders(response.headers);
    if (/\/assets\/.*\.[a-f0-9]{8,}\./i.test(url.pathname)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (response.headers.get("Content-Type")?.includes("text/html")) {
      response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    }
    return response;
  },
};
