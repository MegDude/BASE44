import type { MapEntity } from "../../data/map/mapEntitySchema";
import { enrichEntityWithGooglePlaces } from "./googlePlacesClient";

export async function enrichMapEntities(entities: MapEntity[]): Promise<MapEntity[]> {
  const enriched: MapEntity[] = [];
  for (const entity of entities) {
    const googleData = await enrichEntityWithGooglePlaces(entity);
    enriched.push({
      ...entity,
      ...Object.fromEntries(Object.entries(googleData || {}).filter(([, value]) => value !== undefined && value !== "")),
      datasetStatus: googleData ? "enriched" : entity.datasetStatus,
      tags: googleData ? entity.tags.filter((tag) => tag !== "needs-google-places-enrichment") : entity.tags,
      updatedAt: new Date().toISOString(),
    });
  }
  return enriched;
}
