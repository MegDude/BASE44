import { loadArchiveCatalog } from "./_utils/archiveCatalog.js";
import { CIVIC_TRANSCRIPT_SIGNALS } from "../src/data/civicTranscriptSignals.js";

function normalizeDistrict(value = "") {
  const text = String(value || "").trim();
  return text || "Downtown Core";
}

function toCountMap(items = [], accessor) {
  return items.reduce((store, item) => {
    const key = accessor(item);
    if (!key) return store;
    store[key] = Number(store[key] || 0) + 1;
    return store;
  }, {});
}

function toTopList(countMap, labelKey, limit = 6) {
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ [labelKey]: label, count }));
}

function pickCorridors(catalog) {
  const districtCounts = toCountMap(catalog.locations, (item) => normalizeDistrict(item.district));
  const listingCounts = toCountMap(catalog.listings, (item) => normalizeDistrict(item.district));

  return toTopList(districtCounts, "district", 8).map((entry) => {
    const district = entry.district;
    const districtLocations = catalog.locations.filter((item) => normalizeDistrict(item.district) === district);
    const activeWithHours = districtLocations.filter((item) => item.operatingHours).length;
    const specials = districtLocations.filter((item) => item.hasSpecials).length;
    const eventReady = districtLocations.filter((item) => item.supportsEvents).length;
    const listings = Number(listingCounts[district] || 0);
    const residentDensity =
      districtLocations.filter((item) => /residential/i.test(String(item.category || ""))).length + listings;
    const activationReadiness = activeWithHours + specials + eventReady;

    return {
      district,
      mappedPlaces: entry.count,
      listings,
      residentDensity,
      activeWithHours,
      specials,
      eventReady,
      activationReadiness,
      priority:
        district === CIVIC_TRANSCRIPT_SIGNALS.operatingModel.launchCorridor
          ? "Launch"
          : activationReadiness >= 18
            ? "Ready"
            : residentDensity >= 12
              ? "Grow"
              : "Watch",
    };
  });
}

function buildRecommendations(corridors) {
  const launch = corridors.find((item) => item.priority === "Launch") || corridors[0];
  const grow = corridors.find((item) => item.priority === "Grow");
  const watch = corridors.find((item) => item.priority === "Watch");

  return [
    launch
      ? {
          id: "launch-corridor",
          title: `Keep ${launch.district} As The Launch Corridor`,
          detail: `${launch.mappedPlaces} mapped places, ${launch.listings} listings, and ${launch.activationReadiness} readiness signals support the resident-first civic rollout discussed in the transcripts.`,
        }
      : null,
    grow
      ? {
          id: "expand-next",
          title: `Prepare ${grow.district} As The Next Expansion Corridor`,
          detail: `${grow.residentDensity} residential or listing signals suggest strong civic demand once local business onboarding catches up.`,
        }
      : null,
    watch
      ? {
          id: "outreach-gap",
          title: `Use ${watch.district} As An Outreach Gap Report`,
          detail: `${watch.mappedPlaces} mapped places are visible, but only ${watch.activationReadiness} are activation-ready. This is where direct local business onboarding matters.`,
        }
      : null,
  ].filter(Boolean);
}

function buildActivityFeed(corridors) {
  return corridors.slice(0, 4).map((corridor) => ({
    id: `civic-${corridor.district.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: `${corridor.district} Corridor`,
    detail: `${corridor.mappedPlaces} mapped places · ${corridor.eventReady} event-ready · ${corridor.specials} offers tracked`,
  }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const catalog = await loadArchiveCatalog();
    const corridors = pickCorridors(catalog);
    const recommendations = buildRecommendations(corridors);
    const topCategories = toTopList(
      toCountMap(catalog.locations, (item) => item.category || "Unknown"),
      "category",
      8
    );

    const summary = {
      interactions: corridors.reduce((sum, item) => sum + item.activationReadiness, 0),
      impressions: catalog.locations.length + catalog.listings.length,
      redemptions: catalog.locations.filter((item) => item.hasSpecials).length,
      activePerks: catalog.locations.filter((item) => item.hasSpecials).length,
      activeEvents: catalog.locations.filter((item) => item.supportsEvents).length,
      activeMembers: catalog.listings.length,
      activeZones: corridors.length,
      partnerLocations: catalog.locations.filter((item) => item.contactEmail || item.contactPhone || item.website).length,
      conversionRate: 22,
      repeatRate: 28,
      topInsight: `${CIVIC_TRANSCRIPT_SIGNALS.operatingModel.launchCorridor} launch corridor is the strongest first district`,
      peakWindow: "Resident + Event Layer",
      recentActions: recommendations.length,
      leadingLabel: "Civic tool is now reading imported district signals",
      narrative:
        "This civic backend view combines imported downtown catalog data with the operating model described in the Downtown Perks strategy transcripts: resident density, corridor rollout, local business onboarding, and civic/event participation.",
    };

    return res.status(200).json({
      ok: true,
      summary,
      corridors,
      topCategories,
      modules: CIVIC_TRANSCRIPT_SIGNALS.dashboardModules,
      recurringThemes: CIVIC_TRANSCRIPT_SIGNALS.recurringThemes,
      partnerTargets: CIVIC_TRANSCRIPT_SIGNALS.partnerTargets,
      recommendations,
      activityFeed: buildActivityFeed(corridors),
      operatingModel: CIVIC_TRANSCRIPT_SIGNALS.operatingModel,
      sourceFiles: CIVIC_TRANSCRIPT_SIGNALS.sourceFiles,
    });
  } catch (error) {
    console.error("civic-dashboard failed", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Civic dashboard failed",
    });
  }
}
