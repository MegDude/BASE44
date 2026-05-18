import { getArchiveSummary, loadArchiveCatalog } from "./_utils/archiveCatalog.js";

function toChartSeries(source = [], labelKey = "label") {
  return source.map((entry) => ({
    label: entry[labelKey] || entry.category || entry.district || "Unknown",
    value: entry.count || 0,
  }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [summary, catalog] = await Promise.all([getArchiveSummary(), loadArchiveCatalog()]);
    const recentSpecials = catalog.locations
      .filter((item) => item.hasSpecials)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        name: item.name,
        district: item.district,
        category: item.category,
        specials: item.specials,
      }));

    const liveEventReady = catalog.locations
      .filter((item) => item.supportsEvents)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        name: item.name,
        district: item.district,
        category: item.category,
      }));

    return res.status(200).json({
      ok: true,
      metrics: {
        catalogLocations: summary.totalLocations,
        listingsImported: summary.totalListings,
        specialsTracked: summary.locationsWithSpecials,
        eventReadyLocations: summary.locationsWithEvents,
        hoursTracked: summary.locationsWithHours,
      },
      topCategories: toChartSeries(summary.topCategories, "category"),
      topDistricts: toChartSeries(summary.topDistricts, "district"),
      recentSpecials,
      liveEventReady,
    });
  } catch (error) {
    console.error("dashboard-snapshot failed", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Dashboard snapshot failed",
    });
  }
}
