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
    return "{\"places\":[]}";
  }

  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseIntentFallback(query = "") {
  const q = String(query || "").toLowerCase();
  const categoryMap = [
    { id: "coffee", terms: ["coffee", "cafe", "espresso", "latte"] },
    { id: "restaurant", terms: ["dinner", "lunch", "food", "restaurant", "eat", "brunch"] },
    { id: "nightlife", terms: ["bar", "cocktail", "drink", "nightlife", "late"] },
    { id: "wellness", terms: ["wellness", "spa", "massage", "yoga", "fitness"] },
    { id: "event", terms: ["event", "concert", "show", "tonight", "happening"] },
    { id: "perk", terms: ["perk", "deal", "offer", "discount", "free"] },
  ];

  const category = categoryMap.find((item) => item.terms.some((term) => q.includes(term)))?.id;
  const intentMode = q.includes("perk") || q.includes("deal")
    ? "perks"
    : q.includes("tonight") || q.includes("later") || q.includes("plan")
      ? "plan"
      : "now";

  const types =
    category === "event"
      ? ["event"]
      : category === "perk"
        ? ["perk"]
        : ["venue"];

  const categories =
    category && !["event", "perk"].includes(category)
      ? [category]
      : [];

  const explanation =
    intentMode === "perks"
      ? `Showing active perks${category ? ` for ${category}` : ""}.`
      : intentMode === "plan"
        ? `Showing places and events that fit ${category || "your plan"} later today.`
        : `Showing ${category || "downtown"} options that fit right now.`;

  const suggestions = [
    "Coffee now",
    "Dinner tonight",
    "Perk nearby",
    "Something social",
  ];

  return {
    category,
    intentMode,
    categories,
    types,
    ranking: intentMode === "plan" ? "popularity" : "live",
    explanation,
    suggestions,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const { query, location = "Downtown Austin" } = body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const fallbackIntent = parseIntentFallback(query);
    const archiveMatches = await searchArchiveCatalog(query, {
      types: fallbackIntent.types?.includes("event")
        ? ["location"]
        : fallbackIntent.types?.includes("perk")
          ? ["location"]
          : [],
      limit: 5,
    });
    const archivePlaces = archiveMatches.slice(0, 5).map((item) => ({
      name: item.name,
      reason:
        item.type === "listing"
          ? `${item.status || "Active"} listing in ${item.district}.`
          : item.supportsEvents
            ? `${item.category} option in ${item.district} with event-ready programming.`
            : item.hasSpecials
              ? `${item.category} option in ${item.district} with tracked specials.`
              : `${item.category} option in ${item.district}.`,
      mapQuery: `${item.name} ${item.address || item.district || "Downtown Austin"}`,
    }));

    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();

    if (!apiKey) {
      return res.status(200).json({
        source: "fallback",
        intent: fallbackIntent,
        places: archivePlaces,
      });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are the intent layer for a live downtown map. Return only valid JSON.

Format:
{
  "intent": {
    "category": "coffee|restaurant|nightlife|wellness|event|perk|null",
    "intentMode": "now|plan|perks",
    "categories": ["coffee"],
    "types": ["venue"],
    "ranking": "live|popularity|distance",
    "explanation": "One short sentence describing what the map is showing",
    "suggestions": ["Coffee now", "Dinner tonight", "Perk nearby"]
  },
  "places": [
    {
      "name": "Place name",
      "reason": "One sentence explaining why it fits",
      "mapQuery": "Google Maps friendly search query"
    }
  ]
}

Rules:
- Return 3 to 5 places.
- Keep explanations concise and operational.
- Use categories and types that a map UI can apply.
- Types must be drawn from: venue, event, perk.
- Suggestions should be short, clickable prompt chips.
- No markdown. No prose outside JSON.`,
        },
        {
          role: "user",
          content: `${query} in ${location}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(normalizeJson(raw));
    const places = Array.isArray(parsed.places) ? parsed.places.slice(0, 5) : [];
    const llmIntent = parsed.intent && typeof parsed.intent === "object" ? parsed.intent : {};

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
      places: places.length > 0 ? places : archivePlaces,
    });
  } catch (error) {
    console.error("ask-map failed", error);
    const body = parseBody(req);
    return res.status(200).json({
      source: "fallback",
      intent: parseIntentFallback(body?.query || ""),
      places: await searchArchiveCatalog(body?.query || "", { limit: 5 })
        .then((items) =>
          items.map((item) => ({
            name: item.name,
            reason: `${item.category || item.type} in ${item.district || "Downtown Austin"}.`,
            mapQuery: `${item.name} ${item.address || item.district || "Downtown Austin"}`,
          }))
        )
        .catch(() => []),
    });
  }
}
