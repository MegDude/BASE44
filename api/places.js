import { searchArchiveCatalog } from "./_utils/archiveCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query = "" } = req.query || {};
  const trimmedQuery = String(query).trim();

  if (!trimmedQuery) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const archiveResults = await searchArchiveCatalog(trimmedQuery, {
      types: ["location"],
      limit: 10,
    });

    if (archiveResults.length > 0) {
      return res.status(200).json({
        source: "archive",
        results: archiveResults.map((place) => ({
          id: place.id,
          name: place.name,
          address: place.address,
          category: place.category,
          district: place.district,
          lat: place.latitude,
          lng: place.longitude,
          website: place.website,
          operatingHours: place.operatingHours,
          specials: place.specials,
        })),
      });
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(200).json({ source: "archive", results: [] });
    }

    const googleRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        `${trimmedQuery} downtown Austin`
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!googleRes.ok) {
      return res.status(googleRes.status).json({ error: "Google Places request failed" });
    }

    const data = await googleRes.json();

    const results = (Array.isArray(data.results) ? data.results : []).slice(0, 10).map((place) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
    })).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));

    return res.status(200).json({ source: "google", results });
  } catch (error) {
    console.error("places api failed", error);
    return res.status(500).json({ error: "Places fetch failed", results: [] });
  }
}
