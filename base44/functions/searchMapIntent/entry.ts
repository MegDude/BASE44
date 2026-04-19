/**
 * Ask the Map AI — Interpret natural language and return safe intent
 * JS-safe (Base44 compatible) + normalized + fail-safe
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, context } = await req.json();

    // 🔒 INPUT VALIDATION
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json({ error: "Query required" }, { status: 400 });
    }

    // 🔒 LLM CALL
    const llmRaw = await base44.integrations.Core.InvokeLLM({
      prompt: `
You are a downtown discovery assistant.

Return ONLY valid JSON:

{
  "intent": "search|discovery|action|exploration",
  "categories": ["string"],
  "filters": ["string"],
  "ranking": "relevance|distance|popularity|rating",
  "reasoning": "string",
  "confidence": number
}

User query: "${query}"
${context ? `Context: ${JSON.stringify(context)}` : ""}
      `,
    });

    // 🔒 SAFE PARSE
    let parsed = {};
    try {
      parsed =
        typeof llmRaw === "string"
          ? JSON.parse(llmRaw)
          : llmRaw;
    } catch {
      parsed = {};
    }

    // 🔒 NORMALIZATION
    const response = {
      intent: normalizeIntent(parsed.intent),
      categories: normalizeArray(parsed.categories),
      filters: normalizeFilters(parsed.filters),
      ranking: normalizeRanking(parsed.ranking),
      reasoning:
        typeof parsed.reasoning === "string"
          ? parsed.reasoning
          : "",
      confidence: normalizeConfidence(parsed.confidence),
    };

    return Response.json({
      success: true,
      query,
      ...response,
    });

  } catch (error) {
    console.error("Ask the Map error:", error);

    return Response.json({
      success: true,
      intent: "search",
      categories: [],
      filters: [],
      ranking: "relevance",
      reasoning: "Fallback",
      confidence: 0.3,
    });
  }
});

/* --------------------------
   NORMALIZATION HELPERS
-------------------------- */

function normalizeIntent(intent) {
  const allowed = ["search", "discovery", "action", "exploration"];
  return allowed.includes(intent) ? intent : "search";
}

function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((v) => typeof v === "string");
}

function normalizeFilters(filters) {
  const allowed = [
    "open_now",
    "walkable_5",
    "popular",
    "new",
    "live_events",
    "offers",
  ];

  if (!Array.isArray(filters)) return [];
  return filters.filter((f) => allowed.includes(f));
}

function normalizeRanking(ranking) {
  const allowed = ["relevance", "distance", "popularity", "rating"];
  return allowed.includes(ranking) ? ranking : "relevance";
}

function normalizeConfidence(confidence) {
  if (typeof confidence !== "number") return 0.5;
  if (confidence < 0) return 0.3;
  if (confidence > 1) return 1;
  return confidence;
}