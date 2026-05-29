import OpenAI from "openai";

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
  const audience =
    mode === "partner"
      ? "resident movement, nearby demand, and walkable timing"
      : "walkability, current intent, perks, and nearby plans";

  return {
    title: `Answering: “${query}”`,
    answer: `Start with ${topNames}. Around ${location}, the map is reading ${audience}${filter && filter !== "All" ? ` inside ${filter}` : ""}. The useful next move is to pick the closest fit, save it if you are planning ahead, or open the detail drawer for directions, perks, and partner context.`,
    places: usableContext.map((place) => ({
      id: place.id,
      name: place.name,
      reason: `${place.category || "Downtown place"} in ${place.district || location}.`,
      mapQuery: `${place.name} ${place.district || location} Austin`,
    })),
    source: "local",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, location = "Downtown Austin", district, mode = "resident", filter = "All", context = [] } = req.body || {};
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: `You are the Downtown Perks map agent for downtown Austin. Return only valid JSON.\n\nFormat:\n{\n  "title": "Short answer title",\n  "answer": "2-3 plain-English sentences with concrete next steps",\n  "places": [\n    {\n      "id": "optional context id",\n      "name": "Place name",\n      "reason": "One sentence explaining why it fits",\n      "mapQuery": "Google Maps friendly search query"\n    }\n  ]\n}\n\nRules:\n- Never say there are no matches.\n- Use the provided map context first.\n- Keep copy useful for residents or partners, depending on mode.\n- Explain what to do next: save, redeem, launch, visit, compare, or open details.\n- Do not invent addresses or private data.\n- No markdown. No prose outside JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            location: mapLocation,
            mode,
            filter,
            context,
          }),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(normalizeJson(raw));
    const places = Array.isArray(parsed.places) ? parsed.places.slice(0, 5) : [];

    return res.status(200).json({
      title: parsed.title || `Answering: “${query}”`,
      answer: parsed.answer || localAgentAnswer({ query, location: mapLocation, mode, filter, context }).answer,
      places,
      source: "openai",
    });
  } catch (error) {
    console.error("ask-map failed", error);
    return res.status(200).json(localAgentAnswer({ query: req.body?.query || "downtown", location: req.body?.district || req.body?.location || "Downtown Austin", mode: req.body?.mode, filter: req.body?.filter, context: req.body?.context }));
  }
}
