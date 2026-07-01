import { proxyAgentQuery } from "./agent/query.js";

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

function compactString(value, max = 360) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function compactEntity(entity = {}) {
  return {
    id: compactString(entity.id || entity.entityId || entity.slug || entity.name || entity.title, 80),
    title: compactString(entity.title || entity.name, 120),
    kind: compactString(entity.kind || entity.type || entity.category, 80),
    category: compactString(entity.category, 80),
    district: compactString(entity.district || entity.neighborhood, 80),
    address: compactString(entity.address, 160),
    summary: compactString(entity.summary || entity.description || entity.residentValue || entity.partnerValue, 320),
    offer: compactString(entity.offer || entity.perk || entity.perkTeaser, 220),
    tags: Array.isArray(entity.tags) ? entity.tags.slice(0, 8).map((tag) => compactString(tag, 60)) : [],
    deepLink: compactString(entity.deepLink || entity.route, 180),
  };
}

function buildMapAgentContext(payload = {}) {
  const agentContext = payload.agentContext || payload.context?.agentContext || {};
  const selectedEntity = payload.selectedEntity || payload.context?.selectedEntity || agentContext.selectedEntity || null;
  const mapContext = Array.isArray(payload.mapContext)
    ? payload.mapContext
    : Array.isArray(payload.context?.mapContext)
      ? payload.context.mapContext
      : Array.isArray(payload.context?.entities)
        ? payload.context.entities
        : [];
  const registry = Array.isArray(agentContext.entityRegistry) ? agentContext.entityRegistry : [];

  return {
    question: compactString(payload.question || payload.message || payload.query, 500),
    mode: payload.mode === "partner" ? "partner" : "resident",
    activeFilter: compactString(payload.activeFilter || payload.filter, 80),
    activeLayer: compactString(payload.activeLayer, 80),
    activeCollection: compactString(payload.activeCollection, 80),
    selectedEntity: selectedEntity ? compactEntity(selectedEntity) : null,
    selectedEntityId: compactString(payload.selectedEntityId || payload.activeEntity || agentContext.activeEntity, 100),
    visibleEntities: mapContext.slice(0, 25).map(compactEntity),
    registryEntities: registry.slice(0, 25).map(compactEntity),
    currentDistrict: compactString(payload.currentDistrict || payload.district || agentContext.selectedDistrict, 100),
    mapBounds: payload.mapBounds || agentContext.mapBounds || null,
    savedEntityIds: Array.isArray(payload.savedEntities) ? payload.savedEntities.slice(0, 30).map(String) : [],
    timeContext: compactString(payload.timeContext || agentContext.timeContext, 80),
    workspaceId: compactString(payload.workspaceId, 100),
    organizationId: compactString(payload.organizationId, 100),
    intent: compactString(payload.intent || "ask_map", 100),
    intentCategories: Array.isArray(payload.intentCategories) ? payload.intentCategories.slice(0, 8).map(String) : [],
  };
}

function responseSchemaInstruction() {
  return `Return only JSON with this shape:
{
  "answer": "string",
  "intent": "string",
  "confidence": number,
  "entities": [{"id":"string","title":"string","kind":"string","reason":"string","deepLink":"string"}],
  "suggestedActions": [{"label":"string","action":"open_entity|apply_filter|open_campaign_prefill|open_report|search_again","value":"string"}],
  "followUpPrompts": ["string"]
}`;
}

function systemPromptForMode(mode) {
  const shared = `You are the Downtown Perks map intelligence layer. Use only the provided app context for specific places, offers, hours, addresses, campaigns, analytics, or listings. Do not invent missing facts. Be concise, practical, and specific. Prefer exact entities from context over general downtown advice. If context is thin, say what is missing and answer from currently visible map data. ${responseSchemaInstruction()}`;
  if (mode === "partner") {
    return `${shared}
Partner mode must produce operational recommendations: campaign idea, audience fit, listing improvement, nearby partner pairing, report insight, suggested offer, and next action. Avoid generic marketing advice.`;
  }
  return `${shared}
Resident mode must answer what to do, what is nearby, what is walkable, which perk applies, what fits tonight, and what places are similar. Avoid generic travel-guide answers.`;
}

function parseOpenAIJson(content) {
  const text = compactString(content, 8000);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

function normalizeMapAgentResponse(raw = {}, context) {
  const sourceEntities = [...(context.visibleEntities || []), ...(context.registryEntities || [])];
  const entities = Array.isArray(raw.entities)
    ? raw.entities.slice(0, 5).map((entity) => {
        const matched = sourceEntities.find((item) => item.id && item.id === entity.id) || {};
        return {
          id: compactString(entity.id || matched.id, 100),
          title: compactString(entity.title || matched.title || "Downtown result", 140),
          kind: compactString(entity.kind || matched.kind || matched.category, 80),
          reason: compactString(entity.reason || matched.summary || "Relevant to the current map context.", 220),
          deepLink: compactString(entity.deepLink || matched.deepLink, 220),
        };
      })
    : [];

  return {
    answer: compactString(raw.answer, 1200) || "I do not have enough map data for that yet, but I can use the currently visible Downtown Perks context to narrow the next step.",
    intent: compactString(raw.intent || context.intent || "ask_map", 100),
    confidence: typeof raw.confidence === "number" ? Math.max(0, Math.min(1, raw.confidence)) : 0.72,
    entities,
    suggestedActions: Array.isArray(raw.suggestedActions)
      ? raw.suggestedActions.slice(0, 4).map((action) => ({
          label: compactString(action.label, 80),
          action: ["open_entity", "apply_filter", "open_campaign_prefill", "open_report", "search_again"].includes(action.action) ? action.action : "search_again",
          value: compactString(action.value, 160),
        }))
      : [],
    followUpPrompts: Array.isArray(raw.followUpPrompts) ? raw.followUpPrompts.slice(0, 4).map((item) => compactString(item, 120)) : [],
    title: context.mode === "partner" ? "Partner intelligence" : "Ask the Map",
    places: entities.map((entity) => ({
      id: entity.id,
      name: entity.title,
      reason: entity.reason,
      mapQuery: entity.title,
      action: "Open on map",
    })),
    actions: Array.isArray(raw.suggestedActions) ? raw.suggestedActions.slice(0, 4).map((action) => compactString(action.label, 80)) : [],
    source: "openai-ask-map",
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  };
}

async function runOpenAIAskMap(payload = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const context = buildMapAgentContext(payload);
  if (!context.question) {
    return {
      status: 400,
      body: { error: "Missing question" },
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPromptForMode(context.mode) },
        { role: "user", content: JSON.stringify(context) },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error: body?.error?.message || "OpenAI map agent request failed",
        source: "openai-ask-map",
      },
    };
  }

  const parsed = parseOpenAIJson(body?.choices?.[0]?.message?.content || "");
  return {
    status: 200,
    body: normalizeMapAgentResponse(parsed, context),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const openAIResult = await runOpenAIAskMap(req.body || {});
    if (openAIResult) {
      return res.status(openAIResult.status).json(openAIResult.body);
    }

    const result = await proxyAgentQuery({
      ...(req.body || {}),
      intent: req.body?.intent || "ask_map",
    });
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || "Backend agent gateway unavailable",
      source: "ask-map-agent-proxy",
    });
  }
}
