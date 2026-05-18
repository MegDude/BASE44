import { searchArchiveCatalog } from "./_utils/archiveCatalog.js";
import { supabaseServer } from "../src/lib/supabaseServer.js";

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

function normalizeKinds(filters = {}) {
  const entityKinds = Array.isArray(filters.entityKinds)
    ? filters.entityKinds
    : Array.isArray(filters.types)
      ? filters.types
      : [];

  return entityKinds
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
}

function mapArchiveTypes(entityKinds = []) {
  if (entityKinds.includes("building") || entityKinds.includes("property")) {
    return ["listing", "location"];
  }

  return ["location"];
}

function mapArchiveItem(item) {
  if (item.type === "listing") {
    return {
      id: item.id,
      type: "property",
      name: item.searchTerm || item.address || "Property",
      title: item.searchTerm || item.address || "Property",
      category: "property",
      description: item.summary || item.status || "",
      district: item.district || "Downtown Austin",
      address: item.address || "",
      latitude: null,
      longitude: null,
      metadata: item,
    };
  }

  return {
    id: item.id,
    type: "venue",
    name: item.name || "Downtown Place",
    title: item.name || "Downtown Place",
    category: String(item.category || "nearby").toLowerCase(),
    description: item.summary || item.alignment || item.specials || "",
    district: item.district || "Downtown Austin",
    address: item.address || "",
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    lat: item.latitude ?? null,
    lng: item.longitude ?? null,
    metadata: item,
  };
}

function applyKinds(items = [], entityKinds = []) {
  if (!entityKinds.length) return items;

  return items.filter((item) => {
    const type = String(item.type || "").toLowerCase();

    if (entityKinds.includes(type)) return true;
    if (entityKinds.includes("building") && type === "property") return true;
    if (entityKinds.includes("venue") && type === "hotel") return true;

    return false;
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filters = parseBody(req);
    const searchQuery = String(filters.query || filters.search || "").trim();
    const entityKinds = normalizeKinds(filters);

    if (supabaseServer) {
      let query = supabaseServer.from("map_entities").select("*").limit(100);

      if (entityKinds.length) {
        query = query.in("type", entityKinds);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data) && data.length > 0) {
        return res.status(200).json(data);
      }
    }

    const archiveItems = await searchArchiveCatalog(searchQuery, {
      limit: 30,
      types: mapArchiveTypes(entityKinds),
    });

    return res.status(200).json(applyKinds(archiveItems.map(mapArchiveItem), entityKinds));
  } catch (error) {
    console.error("map-data failed", error);
    return res.status(500).json({ error: "Map data failed", results: [] });
  }
}
