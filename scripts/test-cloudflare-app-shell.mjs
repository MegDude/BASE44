import assert from "node:assert/strict";
import worker from "../workers/app-shell.js";

const assetRequests = [];
const assets = {
  fetch(request) {
    assetRequests.push(request.url);
    return new Response("<!doctype html><div id=\"root\"></div>", {
      headers: { "Content-Type": "text/html" },
    });
  },
};

const apiResponse = await worker.fetch(new Request("https://app.example/api/unknown"), { ASSETS: assets });
assert.equal(apiResponse.status, 503);
assert.deepEqual(await apiResponse.json(), {
  error: "The Downtown Perks platform API is not configured.",
  code: "BACKEND_NOT_CONFIGURED",
});
assert.equal(assetRequests.length, 0, "API requests must never fall through to the SPA");

const directLoad = await worker.fetch(new Request("https://app.example/partner-workspace/reports"), { ASSETS: assets });
assert.equal(directLoad.status, 200);
assert.match(await directLoad.text(), /id="root"/);

const redirect = await worker.fetch(new Request("https://app.example/resident-app"), { ASSETS: assets });
assert.equal(redirect.status, 308);
assert.equal(
  redirect.headers.get("Location"),
  "https://app.example/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured",
);

const originalFetch = globalThis.fetch;
let proxiedRequest;
globalThis.fetch = async (request) => {
  proxiedRequest = request;
  return Response.json(
    { error: "Not found", code: "NOT_FOUND" },
    { status: 404, headers: { "X-Upstream-Private": "do-not-forward" } },
  );
};

try {
  const request = new Request("https://app.example/api/private?scope=mine", {
    headers: { Authorization: "Bearer resident-token", Cookie: "session=abc" },
  });
  const response = await worker.fetch(request, {
    ASSETS: assets,
    BACKEND_ORIGIN: "https://platform.example/v1/",
    APP_ORIGINS: "https://app.example",
  });
  assert.equal(response.status, 404, "unknown API routes must preserve backend JSON 404 responses");
  assert.equal(proxiedRequest.url, "https://platform.example/v1/api/private?scope=mine");
  assert.equal(proxiedRequest.headers.get("Authorization"), "Bearer resident-token");
  assert.equal(proxiedRequest.headers.get("Cookie"), "session=abc");
  assert.equal(proxiedRequest.headers.get("x-forwarded-host"), "app.example");
  assert.equal(proxiedRequest.redirect, "manual");
  assert.equal(response.headers.get("X-Upstream-Private"), null);
} finally {
  globalThis.fetch = originalFetch;
}

const allowedPreflight = await worker.fetch(new Request("https://app.example/api/private", {
  method: "OPTIONS",
  headers: { Origin: "https://app.example" },
}), {
  ASSETS: assets,
  BACKEND_ORIGIN: "https://platform.example",
  APP_ORIGINS: "https://app.example",
});
assert.equal(allowedPreflight.status, 204);
assert.equal(allowedPreflight.headers.get("Access-Control-Allow-Origin"), "https://app.example");
assert.equal(allowedPreflight.headers.get("Access-Control-Allow-Credentials"), "true");

const rejectedPreflight = await worker.fetch(new Request("https://app.example/api/private", {
  method: "OPTIONS",
  headers: { Origin: "https://attacker.example" },
}), {
  ASSETS: assets,
  BACKEND_ORIGIN: "https://platform.example",
  APP_ORIGINS: "https://app.example",
});
assert.equal(rejectedPreflight.status, 403);
assert.equal((await rejectedPreflight.json()).code, "ORIGIN_NOT_ALLOWED");

const websocket = await worker.fetch(new Request("https://app.example/api/stream", {
  headers: { Upgrade: "websocket" },
}), {
  ASSETS: assets,
  BACKEND_ORIGIN: "https://platform.example",
});
assert.equal(websocket.status, 501);
assert.equal((await websocket.json()).code, "WEBSOCKET_NOT_SUPPORTED");

console.log("Cloudflare app shell contract passed.");
