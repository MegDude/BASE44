import { proxyAgentQuery } from "./agent/query.js";

const DEFAULT_OPENAI_MODEL = "gpt-5.2";

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

export function buildMapAgentContext(payload = {}) {
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

export function normalizeMapAgentResponse(raw = {}, context, provider = {}) {
  const sourceEntities = [...(context.visibleEntities || []), ...(context.registryEntities || [])];
  const entities = Array.isArray(raw.entities)
    ? raw.entities.slice(0, 5).map((entity) => {
        const entityTitle = compactString(entity.title || entity.name, 140).toLowerCase();
        const matched = sourceEntities.find((item) => (
          (item.id && item.id === entity.id) ||
          (entityTitle && compactString(item.title, 140).toLowerCase() === entityTitle)
        ));
        if (!matched) return null;
        return {
          id: compactString(matched.id, 100),
          title: compactString(matched.title || "Downtown result", 140),
          kind: compactString(matched.kind || matched.category, 80),
          reason: compactString(entity.reason || matched.summary || "Relevant to the current map context.", 220),
          deepLink: compactString(matched.deepLink, 220),
        };
      }).filter(Boolean)
    : [];
  const entityIds = new Set(sourceEntities.map((entity) => entity.id).filter(Boolean));
  const suggestedActions = Array.isArray(raw.suggestedActions)
    ? raw.suggestedActions.slice(0, 4).map((action) => ({
        label: compactString(action.label, 80),
        action: ["open_entity", "apply_filter", "open_campaign_prefill", "open_report", "search_again"].includes(action.action) ? action.action : "search_again",
        value: compactString(action.value, 160),
      })).filter((action) => action.action !== "open_entity" || entityIds.has(action.value))
    : [];

  return {
    answer: compactString(raw.answer, 1200) || "I do not have enough map data for that yet, but I can use the currently visible Downtown Perks context to narrow the next step.",
    intent: compactString(raw.intent || context.intent || "ask_map", 100),
    confidence: typeof raw.confidence === "number" ? Math.max(0, Math.min(1, raw.confidence)) : 0.72,
    entities,
    suggestedActions,
    followUpPrompts: Array.isArray(raw.followUpPrompts) ? raw.followUpPrompts.slice(0, 4).map((item) => compactString(item, 120)) : [],
    title: context.mode === "partner" ? "Partner intelligence" : "Ask the Map",
    places: entities.map((entity) => ({
      id: entity.id,
      name: entity.title,
      reason: entity.reason,
      mapQuery: entity.title,
      action: "Open on map",
    })),
    actions: suggestedActions.map((action) => action.label),
    source: "openai-ask-map",
    model: provider.model || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    responseId: provider.responseId || "",
    usage: provider.usage || null,
  };
}

function mapAgentResponseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["answer", "intent", "confidence", "entities", "suggestedActions", "followUpPrompts"],
    properties: {
      answer: { type: "string" },
      intent: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      entities: {
        type: "array",
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "title", "kind", "reason", "deepLink"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            kind: { type: "string" },
            reason: { type: "string" },
            deepLink: { type: "string" },
          },
        },
      },
      suggestedActions: {
        type: "array",
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "action", "value"],
          properties: {
            label: { type: "string" },
            action: {
              type: "string",
              enum: ["open_entity", "apply_filter", "open_campaign_prefill", "open_report", "search_again"],
            },
            value: { type: "string" },
          },
        },
      },
      followUpPrompts: {
        type: "array",
        maxItems: 4,
        items: { type: "string" },
      },
    },
  };
}

function getResponseOutputText(body = {}) {
  if (typeof body.output_text === "string") return body.output_text;
  const output = Array.isArray(body.output) ? body.output : [];
  return output
    .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
    .filter((item) => item?.type === "output_text" && typeof item?.text === "string")
    .map((item) => item.text)
    .join("\n");
}

function fallbackScore(entity, terms, context) {
  const text = [entity.title, entity.kind, entity.category, entity.district, entity.address, entity.summary, ...(entity.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;
  if (context.selectedEntityId && entity.id === context.selectedEntityId) score += 40;
  if (context.currentDistrict && text.includes(context.currentDistrict.toLowerCase())) score += 12;
  if (context.activeFilter && text.includes(context.activeFilter.toLowerCase())) score += 10;
  terms.forEach((term) => {
    if (text.includes(term)) score += 6;
  });
  return score;
}

export function buildFallbackMapResponse(payload = {}) {
  const context = buildMapAgentContext(payload);
  const terms = context.question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  const sourceEntities = [...context.visibleEntities, ...context.registryEntities]
    .filter((entity, index, list) => entity.id && list.findIndex((item) => item.id === entity.id) === index);
  const ranked = sourceEntities
    .map((entity) => ({ entity, score: fallbackScore(entity, terms, context) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entity }) => entity);
  const first = ranked[0];
  const answer = first
    ? context.mode === "partner"
      ? `Start with ${first.title}. It is the strongest match in the current ${context.currentDistrict || "Downtown Austin"} map context. Review the connected place, then choose one clear campaign, listing, offer, or report action.`
      : `Start with ${first.title}. It is the strongest match in the current ${context.currentDistrict || "Downtown Austin"} map context. Open it on the map to check the details and nearby options.`
    : "There is not enough connected map information to answer that yet. Open a district or category first, then ask again.";
  const entities = ranked.map((entity) => ({
    id: entity.id,
    title: entity.title,
    kind: entity.kind || entity.category,
    reason: entity.summary || `Relevant to ${context.currentDistrict || "the current map area"}.`,
    deepLink: entity.deepLink,
  }));
  const suggestedActions = first
    ? [
        { label: "Open on map", action: "open_entity", value: first.id },
        ...(context.mode === "partner" ? [{ label: "Review reports", action: "open_report", value: context.organizationId }] : []),
      ]
    : [{ label: "Search again", action: "search_again", value: context.question }];

  return {
    answer,
    title: context.mode === "partner" ? "Partner recommendation" : "Ask the Map",
    intent: context.intent || "ask_map",
    confidence: first ? 0.68 : 0.35,
    entities,
    places: entities.map((entity) => ({ id: entity.id, name: entity.title, reason: entity.reason, mapQuery: entity.title, action: "Open on map" })),
    suggestedActions,
    structuredActions: suggestedActions,
    actions: suggestedActions.map((action) => action.label),
    followUpPrompts: context.mode === "partner"
      ? ["What should we improve first?", "Which nearby audience fits this?", "What should the next campaign say?"]
      : ["What is nearby after this?", "Which option has a perk?", "What else fits tonight?"],
    source: "local-agent",
    model: "downtown-perks-context-ranker",
    degraded: true,
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

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      instructions: systemPromptForMode(context.mode),
      input: JSON.stringify(context),
      max_output_tokens: 1400,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "downtown_perks_map_answer",
          strict: true,
          schema: mapAgentResponseSchema(),
        },
      },
      ...(payload.previousResponseId ? { previous_response_id: compactString(payload.previousResponseId, 120) } : {}),
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

  const parsed = parseOpenAIJson(getResponseOutputText(body));
  return {
    status: 200,
    body: normalizeMapAgentResponse(parsed, context, {
      model: body?.model,
      responseId: body?.id,
      usage: body?.usage,
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!compactString(req.body?.question || req.body?.message || req.body?.query, 500)) {
    return res.status(400).json({ error: "Ask a question before sending." });
  }

  try {
    const openAIResult = await runOpenAIAskMap(req.body || {});
    if (openAIResult?.status === 200) {
      return res.status(openAIResult.status).json(openAIResult.body);
    }

    const result = await proxyAgentQuery({
      ...(req.body || {}),
      intent: req.body?.intent || "ask_map",
    });
    if (result.status < 400 && result.body?.answer) return res.status(result.status).json(result.body);

    return res.status(200).json(buildFallbackMapResponse(req.body || {}));
  } catch (error) {
    return res.status(200).json({
      ...buildFallbackMapResponse(req.body || {}),
      providerError: error?.message ? "Provider unavailable; current map context used." : undefined,
    });
  }
}
