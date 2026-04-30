function toPayload(options = {}) {
  const query = String(options.query || options.search || "").trim();
  const filters = options.filters && typeof options.filters === "object" ? options.filters : {};
  const types = Array.isArray(options.types) ? options.types : Array.isArray(filters.types) ? filters.types : [];
  const categories = Array.isArray(options.categories)
    ? options.categories
    : Array.isArray(filters.categories)
      ? filters.categories
      : [];

  return {
    query,
    limit: Number(options.limit || 120),
    district: options.district || filters.district || null,
    types,
    categories,
  };
}

export async function fetchMapData(options = {}) {
  const payload = toPayload(options);
  const hasPayload =
    Boolean(payload.query) ||
    Boolean(payload.district) ||
    payload.types.length > 0 ||
    payload.categories.length > 0;

  const response = await fetch("/api/map-data", {
    method: hasPayload ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: hasPayload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    throw new Error(`map-data request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data,
    results: Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [],
  };
}
