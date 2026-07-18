import { ChevronRight } from "lucide-react";

type RelatedRoute = {
  id: string;
  title: string;
  routeType?: string;
  stopIds?: string[];
  estimatedTime?: string;
};

type RouteRelatedListProps = {
  routes: RelatedRoute[];
  onOpenRoute: (routeId: string) => void;
};

export function RouteRelatedList({ routes, onOpenRoute }: RouteRelatedListProps) {
  if (!routes.length) return null;
  return (
    <section className="dp-route-related" aria-labelledby="related-routes-title">
      <h3 id="related-routes-title">Related routes</h3>
      <div>
        {routes.slice(0, 3).map((route) => (
          <button type="button" key={route.id} onClick={() => onOpenRoute(route.id)}>
            <span>
              <strong>{route.title}</strong>
              <small>{route.routeType || "Route"} · {route.stopIds?.length || 0} stops{route.estimatedTime ? ` · ${route.estimatedTime}` : ""}</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
