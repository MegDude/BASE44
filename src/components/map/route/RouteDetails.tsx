import type { RouteAccessibility } from "@/types/routeExperience";

type RouteDetailsProps = {
  description?: string;
  beforeYouGo?: string[];
  accessibility?: RouteAccessibility;
  partnerName?: string;
  routeId: string;
  mode: "resident" | "partner";
};

function accessibilityRows(accessibility?: RouteAccessibility) {
  if (!accessibility) return [];
  return [
    accessibility.stepFree === true ? "Step-free route information available" : "",
    accessibility.surface,
    accessibility.seating,
    accessibility.restrooms,
    accessibility.lighting,
    accessibility.water,
    accessibility.wheelchairNotes,
    accessibility.strollerNotes,
  ].filter(Boolean);
}

export function RouteDetails({ description, beforeYouGo = [], accessibility, partnerName, mode }: RouteDetailsProps) {
  const accessRows = accessibilityRows(accessibility);
  if (!description && !beforeYouGo.length && !accessRows.length && !partnerName && mode !== "partner") return null;
  return (
    <section className="dp-route-details" aria-labelledby="route-details-title">
      <h3 id="route-details-title">Route details</h3>
      {description ? <div className="dp-route-details__plain"><h4>About this route</h4><p>{description}</p></div> : null}
      {beforeYouGo.length ? <details><summary>Before you go</summary><ul>{beforeYouGo.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
      {accessRows.length ? <details><summary>Accessibility</summary><ul>{accessRows.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
      {partnerName ? <p className="dp-route-partner">Presented with {partnerName}</p> : null}
    </section>
  );
}
