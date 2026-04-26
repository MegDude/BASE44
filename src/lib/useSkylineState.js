import { useEffect, useMemo, useState } from "react";
import { projectToScreen } from "./geoProject";
import { DISTRICTS, inferDistrictFromQuery } from "./districts";

export function useSkylineState({ query = "", intent = "", enabled = true } = {}) {
  const [signals, setSignals] = useState([]);
  const [mode, setMode] = useState("dusk");
  const [focus, setFocus] = useState(DISTRICTS.cbd);
  const [activityLevel, setActivityLevel] = useState(0);

  const districtKey = useMemo(() => inferDistrictFromQuery(query || intent), [query, intent]);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;

    async function run() {
      try {
        const res = await fetch("/api/heatmap");
        const data = res.ok ? await res.json() : [];

        if (!alive) return;

        const projected = Array.isArray(data)
          ? data
              .filter((d) => Number.isFinite(Number(d.lat)) && Number.isFinite(Number(d.lng)))
              .sort((a, b) => Number(b.intensity || 0) - Number(a.intensity || 0))
              .slice(0, 25)
              .map((d) => ({
                ...projectToScreen(d.lat, d.lng),
                intensity: Number(d.intensity || 1)
              }))
          : [];

        const total = projected.reduce((sum, d) => sum + d.intensity, 0);

        setSignals(projected);
        setActivityLevel(total);
        setFocus(DISTRICTS[districtKey] || DISTRICTS.cbd);

        const lowered = String(query || intent).toLowerCase();

        if (lowered.includes("bar") || lowered.includes("night") || lowered.includes("music") || total > 250) {
          setMode("night");
        } else if (lowered.includes("coffee") || lowered.includes("lunch") || lowered.includes("wellness")) {
          setMode("day");
        } else if (total > 100) {
          setMode("dusk");
        } else {
          const hour = new Date().getHours();
          setMode(hour >= 7 && hour < 18 ? "day" : "night");
        }
      } catch {
        if (!alive) return;
        setSignals([]);
        setFocus(DISTRICTS[districtKey] || DISTRICTS.cbd);
        setActivityLevel(0);
      }
    }

    run();
    const interval = window.setInterval(run, 8000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [districtKey, enabled, intent, query]);

  return { signals, mode, focus, activityLevel };
}
