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
  return Response.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
};

try {
  const request = new Request("https://app.example/api/private?scope=mine", {
    headers: { Authorization: "Bearer resident-token", Cookie: "session=abc" },
  });
  const response = await worker.fetch(request, {
    ASSETS: assets,
    BACKEND_ORIGIN: "https://platform.example/v1/",
  });
  assert.equal(response.status, 404, "unknown API routes must preserve backend JSON 404 responses");
  assert.equal(proxiedRequest.url, "https://platform.example/v1/api/private?scope=mine");
  assert.equal(proxiedRequest.headers.get("Authorization"), "Bearer resident-token");
  assert.equal(proxiedRequest.headers.get("Cookie"), "session=abc");
  assert.equal(proxiedRequest.headers.get("x-forwarded-host"), "app.example");
  assert.equal(proxiedRequest.redirect, "manual");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Cloudflare app shell contract passed.");
