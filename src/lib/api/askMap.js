export async function askMap(query, options = {}) {
  const response = await fetch("/api/ask-map", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      location: options.location || "Downtown Austin",
      userLocation: options.userLocation || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`ask-map request failed: ${response.status}`);
  }

  const payload = await response.json();
  const intent = payload?.intent || null;

  let rankedResults = [];

  try {
    const mapResponse = await fetch("/api/map-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        types: Array.isArray(intent?.types) ? intent.types : [],
        categories: Array.isArray(intent?.categories) ? intent.categories : [],
        limit: 60,
      }),
    });

    if (mapResponse.ok) {
      const mapPayload = await mapResponse.json();
      rankedResults = Array.isArray(mapPayload?.results) ? mapPayload.results : [];
    }
  } catch {
    rankedResults = [];
  }

  return {
    results:
      rankedResults.length > 0
        ? rankedResults
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.places)
            ? payload.places
            : [],
    intent,
    suggestions: Array.isArray(intent?.suggestions) ? intent.suggestions : [],
    source: payload?.source || "fallback",
  };
}
