import { legendsLuxuryPresenceSeoSnapshot } from "../../../data/luxuryPresenceSeoSnapshot.js";
import { normalizeLuxuryPresenceSeoSnapshot } from "../../../lib/analytics/seoMetrics.js";

export function getLegendsSeoReport() {
  return normalizeLuxuryPresenceSeoSnapshot(legendsLuxuryPresenceSeoSnapshot);
}
