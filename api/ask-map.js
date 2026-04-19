import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  try {
    const { query, location = "Downtown Austin" } = req.body || {};

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `You are a local downtown concierge. Return only valid JSON.\n\nFormat:\n{\n  "places": [\n    {\n      "name": "Place name",\n      "reason": "One sentence explaining why it fits",\n      "mapQuery": "Google Maps friendly search query"\n    }\n  ]\n}\n\nRules:\n- Return 3 to 5 places.\n- Keep each reason concise and specific.\n- Focus on real, plausible places or destination types in the requested area.\n- No markdown. No prose outside JSON.`,
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

    return res.status(200).json({ places });
  } catch (error) {
    console.error("ask-map failed", error);
    return res.status(500).json({ error: "Search failed", places: [] });
  }
}
