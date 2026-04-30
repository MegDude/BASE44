import OpenAI from "openai";
import { searchArchiveCatalog } from "./_utils/archiveCatalog.js";

function parseBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }

  return req.body && typeof req.body === "object" ? req.body : {};
}

function normalizeJson(rawText) {
  if (!rawText) {
    return "{\"intent\":{}}";
  }

  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildFallbackIntent(query = "") {
  const q = String(query || "").toLowerCase();

  const mappings = [
    { match: ["coffee", "cafe", "espresso", "latte"], category: "coffee", types: ["venue"], categories: ["coffee"] },
    { match: ["dinner", "lunch", "restaurant", "food", "eat", "brunch"], category: "dining", types: ["venue"], categories: ["restaurant", "bar"] },
    { match: ["drinks", "bar", "cocktail", "nightlife", "happy hour"], category: "nightlife", types: ["venue"], categories: ["bar"] },
    { match: ["fitness", "wellness", "spa", "yoga", "massage"], category: "wellness", types: ["venue"], categories: ["wellness", "fitness"] },
    { match: ["event", "show", "concert", "tonight", "happening"], category: "event", types: ["event"], categories: [] },
    { match: ["perk", "deal", "discount", "offer", "free"], category: "perk", types: ["perk"], categories: [] },
    { match: ["building", "live here", "apartment", "condo", "property", "home"], category: "building", types: ["building"], categories: [] },
  ];

  const matched = mappings.find((item) => item.match.some((term) => q.includes(term)));
  const intentMode = q.includes("tonight") || q.includes("later") || q.includes("plan") ? "plan" : "now";

  return {
    category: matched?.category || null,
    intentMode,
    categories: matched?.categories || [],
    types: matched?.types || ["venue"],
    ranking: intentMode === "plan" ? "popularity" : "live",
    explanation: matched
      ? `Showing ${matched.category} options that best fit right now.`
      : "Showing useful downtown options based on what you asked for.",
    suggestions: ["Coffee now", "Dinner tonight", "Perk nearby", "Something social"],
  };
}

function archiveReason(item) {
  if (item.type === "listing") {
    return `${item.status || "Active"} building or listing in ${item.district || "Downtown Austin"}.`;
  }
  if (item.supportsEvents) {
    return `${item.category || "Local"} option with live event potential nearby.`;
  }
  if (item.hasSpecials) {
    return `${item.category || "Local"} option with active offers nearby.`;
  }
  return `${item.category || item.type || "Local"} option in ${item.district || "Downtown Austin"}.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const query = String(body.query || "").trim();
    const location = String(body.location || "Downtown Austin");

    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const fallbackIntent = buildFallbackIntent(query);
    const archiveMatches = await searchArchiveCatalog(query, {
      limit: 5,
      types: fallbackIntent.types.includes("building") ? ["listing", "location"] : ["location"],
    });

    const places = (Array.isArray(archiveMatches) ? archiveMatches : []).slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name || item.searchTerm || item.address || "Downtown place",
      type: item.type === "listing" ? "building" : fallbackIntent.types[0] || "venue",
      category:
        item.type === "listing"
          ? "building"
          : String(item.category || fallbackIntent.category || "venue").toLowerCase(),
      description: archiveReason(item),
      district: item.district || "Downtown Austin",
      address: item.address || "",
      lat: item.latitude ?? null,
      lng: item.longitude ?? null,
      metadata: {
        tags: [item.category, item.district, item.type].filter(Boolean),
      },
    }));

    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();

    if (!apiKey) {
      return res.status(200).json({
        source: "fallback",
        intent: fallbackIntent,
        places,
        results: places,
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are the structured intent layer for a live downtown map. Return valid JSON only.

Format:
{
  "intent": {
    "category": "coffee|dining|nightlife|wellness|event|perk|building|null",
    "intentMode": "now|plan|perks",
    "categories": ["coffee"],
    "types": ["venue"],
    "ranking": "live|popularity|distance",
    "explanation": "One short sentence",
    "suggestions": ["Coffee now", "Dinner tonight"]
  }
}

Rules:
- Types must come from: venue, event, perk, building
- Keep suggestions short and clickable
- No markdown
- No prose outside JSON`,
        },
        {
          role: "user",
          content: `${query} in ${location}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(normalizeJson(raw));
    const llmIntent = parsed?.intent && typeof parsed.intent === "object" ? parsed.intent : {};

    return res.status(200).json({
      source: "api",
      intent: {
        ...fallbackIntent,
        ...llmIntent,
        categories:
          Array.isArray(llmIntent.categories) && llmIntent.categories.length > 0
            ? llmIntent.categories
            : fallbackIntent.categories,
        types:
          Array.isArray(llmIntent.types) && llmIntent.types.length > 0
            ? llmIntent.types
            : fallbackIntent.types,
        suggestions:
          Array.isArray(llmIntent.suggestions) && llmIntent.suggestions.length > 0
            ? llmIntent.suggestions.slice(0, 4)
            : fallbackIntent.suggestions,
      },
      places,
      results: places,
    });
  } catch (error) {
    console.error("ask-map failed", error);
    const body = parseBody(req);
    const fallbackIntent = buildFallbackIntent(body?.query || "");
    return res.status(200).json({
      source: "fallback",
      intent: fallbackIntent,
      places: [],
      results: [],
    });
  }
}
