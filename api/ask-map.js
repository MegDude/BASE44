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

async function geocodePlace(place, location) {
  const searchQuery = [place?.mapQuery, place?.name, location].filter(Boolean).join(", ");

  if (!searchQuery) {
    return place;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          "User-Agent": "base44-map-search/1.0",
        },
      }
    );

    if (!response.ok) {
      return place;
    }

    const results = await response.json();
    const bestMatch = Array.isArray(results) ? results[0] : null;

    if (!bestMatch) {
      return place;
    }

    const lat = Number.parseFloat(bestMatch.lat);
    const lng = Number.parseFloat(bestMatch.lon);

    return {
      ...place,
      lat: Number.isFinite(lat) ? lat : place?.lat ?? null,
      lng: Number.isFinite(lng) ? lng : place?.lng ?? null,
      address: bestMatch.display_name || place?.address || null,
    };
  } catch (error) {
    console.warn("Geocoding failed for place", place?.name, error);
    return place;
  }
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
          content: `You are a local downtown concierge. Return only valid JSON.\n\nFormat:\n{\n  "places": [\n    {\n      "name": "Place name",\n      "reason": "One sentence explaining why it fits",\n      "mapQuery": "Google Maps friendly search query",\n      "lat": 30.2672,\n      "lng": -97.7431\n    }\n  ]\n}\n\nRules:\n- Return 3 to 5 places.\n- Keep each reason concise and specific.\n- Focus on real, plausible places or destination types in the requested area.\n- Include approximate latitude and longitude when known.\n- No markdown. No prose outside JSON.`,
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
    const enrichedPlaces = await Promise.all(places.map((place) => geocodePlace(place, location)));

    return res.status(200).json({ places: enrichedPlaces });
  } catch (error) {
    console.error("ask-map failed", error);
    return res.status(500).json({ error: "Search failed", places: [] });
  }
}
