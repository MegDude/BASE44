import OpenAI from "openai";

const MAP_AGENT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const mapAgentSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "answer", "places", "actions", "confidence"],
  properties: {
    title: { type: "string" },
    answer: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    places: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "reason", "mapQuery", "action"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          reason: { type: "string" },
          mapQuery: { type: "string" },
          action: { type: "string" },
        },
      },
    },
    actions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" },
    },
  },
};

function normalizeJson(rawText) {
  if (!rawText) {
    return "{\"answer\":\"\",\"places\":[]}";
  }

  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function localAgentAnswer({ query, location, mode, filter, context = [] }) {
  const usableContext = Array.isArray(context) ? context.slice(0, 5) : [];
  const names = usableContext.map((place) => place.name).filter(Boolean);
  const topNames = names.length ? names.join(", ") : "the nearest useful downtown places";
  const isPartner = mode === "partner";
  const propertyContext = usableContext.find((place) => place?.listing || Array.isArray(place?.buildingListings));

  if (isPartner) {
    return {
      title: `Understanding: “${query}”`,
      answer: `Start with ${topNames}. Around ${location}, the useful read is resident activity, saves, scans, visits, nearby timing, and which categories are gaining attention${filter && filter !== "All" ? ` inside ${filter}` : ""}. Use this to decide what to promote next, where to place the offer, and which nearby audience is most likely to act.`,
      places: usableContext.map((place) => ({
        id: String(place.id || place.name || ""),
        name: place.name,
        reason: `${place.category || "Downtown place"} in ${place.district || location}; useful for comparing activity, audience fit, and next action.`,
        mapQuery: `${place.name} ${place.district || location} Austin`,
        action: "Review next move",
      })),
      actions: ["Compare activity", "Review saves and visits", "Choose what to promote next"],
      confidence: usableContext.length ? 0.74 : 0.6,
      source: "local",
    };
  }

  if (propertyContext?.listing) {
    const listing = propertyContext.listing;
    const facts = [
      listing.price,
      listing.beds ? `${listing.beds} bed` : "",
      listing.baths ? `${listing.baths} bath` : "",
      listing.sqft ? `${listing.sqft}` : "",
      listing.mls ? `MLS ${listing.mls}` : "",
    ].filter(Boolean).join(" · ");
    const nearby = usableContext
      .filter((place) => place.id !== propertyContext.id)
      .map((place) => place.name)
      .filter(Boolean)
      .slice(0, 3);
    return {
      title: `About ${propertyContext.name}`,
      answer: `${facts ? `${facts}. ` : ""}${nearby.length ? `Nearby, ${nearby.join(", ")} are useful places to compare around the showing. ` : ""}Ask Legends Real Estate for current availability, private tour options, and similar downtown homes that may not always be easy to find on public listing sites.`,
      places: usableContext.map((place) => ({
        id: String(place.id || place.name || ""),
        name: place.name,
        reason: place.id === propertyContext.id
          ? `Listing details for ${propertyContext.name}${facts ? `: ${facts}` : ""}.`
          : `${place.category || "Nearby place"} in ${place.district || location}.`,
        mapQuery: `${place.name} ${place.district || location} Austin`,
        action: place.id === propertyContext.id ? "Contact Legends" : "Compare nearby",
      })),
      actions: ["Contact Legends", "Compare nearby places", "Save this listing"],
      confidence: 0.78,
      source: "local",
    };
  }

  if (propertyContext?.buildingListings?.length) {
    const listings = propertyContext.buildingListings.slice(0, 3).map((listing) => {
      const unit = listing.unit ? `#${listing.unit}` : "Residence";
      const facts = [listing.price, listing.beds ? `${listing.beds} bed` : "", listing.baths ? `${listing.baths} bath` : "", listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "", listing.mls ? `MLS ${listing.mls}` : ""].filter(Boolean).join(" · ");
      return `${unit}: ${facts}`;
    });
    return {
      title: `Listings at ${propertyContext.name}`,
      answer: `${listings.join(" | ")}. Use the map to compare nearby places, resident perks, and daily errands, then contact Legends Real Estate for current availability and private tour options.`,
      places: usableContext.map((place) => ({
        id: String(place.id || place.name || ""),
        name: place.name,
        reason: place.id === propertyContext.id ? "Active Legends inventory in this building." : `${place.category || "Nearby place"} in ${place.district || location}.`,
        mapQuery: `${place.name} ${place.district || location} Austin`,
        action: place.id === propertyContext.id ? "Review listings" : "Compare nearby",
      })),
      actions: ["Review listings", "Contact Legends", "Compare nearby places"],
      confidence: 0.78,
      source: "local",
    };
  }

  return {
    title: `Answering: “${query}”`,
    answer: `Start with ${topNames}. Around ${location}, the map is reading walkability, current intent, perks, and nearby plans${filter && filter !== "All" ? ` inside ${filter}` : ""}. Pick the closest fit, save it if you are planning ahead, or open the detail drawer for directions, perks, and local context.`,
    places: usableContext.map((place) => ({
      id: String(place.id || place.name || ""),
      name: place.name,
      reason: `${place.category || "Downtown place"} in ${place.district || location}.`,
      mapQuery: `${place.name} ${place.district || location} Austin`,
      action: "Open on map",
    })),
    actions: ["Open the map", "Save the best fit", "Check walkable next steps"],
    confidence: usableContext.length ? 0.72 : 0.58,
    source: "local",
  };
}

function parseResponseOutput(response) {
  if (response?.output_text) return response.output_text;

  const textItems = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content?.text) {
        textItems.push(content.text);
      }
    }
  }
  return textItems.join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, location = "Downtown Austin", district, mode = "resident", filter = "All", intentCategories = [], context = [] } = req.body || {};
    const mapLocation = district || location;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json(localAgentAnswer({ query, location: mapLocation, mode, filter, context }));
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: MAP_AGENT_MODEL,
      instructions: `You are the Downtown Perks agentic map operator for downtown Austin.
Use the provided map context first. Rank relevant places, explain why they matter, and give concrete next actions.
Use the context fields directly: addresses, summaries, offers, timing, coordinates, and listing details when present.
Pick only from context ids and names. If the context has a concrete offer, timing, price, unit, or address, mention the useful fact in plain English.
Resident mode prioritizes walkability, perks, events, saves, and simple next steps.
Partner mode is operational intelligence, not discovery. In partner mode answer what happened, why it happened, and what to do next. Prioritize activity, campaigns, perks, events, properties, trends, resident behavior, district movement, saves, scans, visits, redemption fit, and timing. Never answer partner prompts as "where should we go", "coffee nearby", "dinner nearby", or resident nightlife discovery. Partner answers should help a property manager, hotel manager, venue operator, broker, brand manager, DAA, or DANA decide what to promote, where to activate, and what nearby behavior matters.
Never invent addresses, private data, or real-time facts not present in context. Never say there are no matches; give the best available next move.
Return only the requested structured JSON.`,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                query,
                location: mapLocation,
                mode,
                filter,
                intentCategories: Array.isArray(intentCategories) ? intentCategories : [],
                context: Array.isArray(context) ? context.slice(0, 12) : [],
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "downtown_perks_map_agent_answer",
          strict: true,
          schema: mapAgentSchema,
        },
      },
    });

    const raw = parseResponseOutput(response);
    const parsed = JSON.parse(normalizeJson(raw));
    const places = Array.isArray(parsed.places) ? parsed.places.slice(0, 5) : [];

    return res.status(200).json({
      title: parsed.title || `Answering: “${query}”`,
      answer: parsed.answer || localAgentAnswer({ query, location: mapLocation, mode, filter, context }).answer,
      places,
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 4) : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
      source: "openai",
      model: MAP_AGENT_MODEL,
    });
  } catch (error) {
    console.error("ask-map failed", error);
    return res.status(200).json(localAgentAnswer({ query: req.body?.query || "downtown", location: req.body?.district || req.body?.location || "Downtown Austin", mode: req.body?.mode, filter: req.body?.filter, context: req.body?.context }));
  }
}
