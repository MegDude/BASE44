import assert from "node:assert/strict";
import askMapHandler, { buildFallbackMapResponse, buildMapAgentContext, normalizeMapAgentResponse } from "../api/ask-map.js";
import agentQueryHandler from "../api/agent/query.js";
import { runAskMapAgent } from "../src/features/agent/askMapAgent";
import {
  PARTNER_ROUTES,
  PARTNER_WORKSPACE_COPY,
  PARTNER_WORKSPACE_NAV,
} from "../src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry";

const entities = [
  {
    id: "merit-seaholm",
    name: "Merit Coffee Seaholm",
    category: "Coffee",
    district: "Seaholm",
    summary: "Coffee at the Seaholm district storefront.",
    deepLink: "/map?entityId=merit-seaholm",
  },
  {
    id: "shore-4301",
    name: "The Shore #4301",
    category: "Listing",
    district: "Rainey",
    summary: "A connected Legends Real Estate listing.",
    deepLink: "/map?entityId=shore-4301",
  },
];

const resident = await runAskMapAgent({
  query: "Where can I get coffee in Seaholm?",
  mode: "resident",
  district: "Seaholm",
  context: entities,
});
assert.equal(resident.mode, "resident");
assert.equal(resident.places[0]?.id, "merit-seaholm");
assert.ok(resident.structuredActions.some((action) => action.type === "open_entity"));

const partner = await runAskMapAgent({
  query: "What campaign should we launch around The Shore?",
  mode: "partner",
  district: "Rainey",
  context: entities,
  selectedEntity: entities[1],
});
assert.equal(partner.mode, "partner");
assert.ok(partner.campaigns.length > 0);
assert.ok(partner.structuredActions.some((action) => action.type === "open_dashboard"));

const providerContext = buildMapAgentContext({
  question: "What should I open first?",
  mode: "partner",
  mapContext: entities,
  organizationId: "demo-org-legends-real-estate",
});
assert.equal(providerContext.mode, "partner");
assert.equal(providerContext.visibleEntities.length, 2);

const normalized = normalizeMapAgentResponse({
  answer: "Open The Shore #4301 first.",
  intent: "listing_priority",
  confidence: 0.91,
  entities: [
    { id: "shore-4301", title: "The Shore #4301", kind: "Listing", reason: "It is connected.", deepLink: "/invented-route" },
    { id: "invented-place", title: "Invented Place", kind: "Venue", reason: "Not in context.", deepLink: "/invented" },
  ],
  suggestedActions: [
    { label: "Open listing", action: "open_entity", value: "shore-4301" },
    { label: "Open invented", action: "open_entity", value: "invented-place" },
  ],
  followUpPrompts: ["What should we compare next?"],
}, providerContext, { model: "test-model", responseId: "resp_test" });
assert.equal(normalized.entities.length, 1);
assert.equal(normalized.entities[0].deepLink, "/map?entityId=shore-4301");
assert.equal(normalized.suggestedActions.length, 1);
assert.equal(normalized.responseId, "resp_test");

const fallback = buildFallbackMapResponse({
  question: "Which Shore listing should we review?",
  mode: "partner",
  mapContext: entities,
  organizationId: "demo-org-legends-real-estate",
});
assert.equal(fallback.source, "local-agent");
assert.equal(fallback.places[0].id, "shore-4301");
assert.ok(fallback.structuredActions.some((action) => action.action === "open_entity"));

assert.equal(PARTNER_ROUTES.workspaceAssistant, "/partner-workspace/assistant");
assert.ok(PARTNER_WORKSPACE_NAV.some((item) => item.id === "assistant"));
assert.ok(PARTNER_WORKSPACE_COPY.assistant.prompts.length >= 4);

async function runHandler(handler: any, body: Record<string, unknown>) {
  let statusCode = 200;
  let responseBody: any = null;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseBody = payload;
      return payload;
    },
  };
  await handler({ method: "POST", body }, response);
  return { statusCode, body: responseBody };
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("Provider unavailable during deterministic contract test");
};

try {
  const askMapEndpoint = await runHandler(askMapHandler, {
    question: "Coffee near Seaholm",
    mode: "resident",
    mapContext: entities,
  });
  assert.equal(askMapEndpoint.statusCode, 200);
  assert.ok(askMapEndpoint.body.answer);

  const queryEndpoint = await runHandler(agentQueryHandler, {
    message: "What should we improve first?",
    mode: "partner",
    mapContext: entities,
  });
  assert.equal(queryEndpoint.statusCode, 200);
  assert.ok(queryEndpoint.body.answer);
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Agent integration contract: PASS");
