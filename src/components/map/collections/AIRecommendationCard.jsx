import { Sparkles } from "lucide-react";

export function AIRecommendationCard({ route, activeStop, completed }) {
  const hints = route.aiHints || [];
  const hour = new Date().getHours();
  const timeHint = hour < 11 ? "You are exploring in the morning." : hour < 17 ? "You have time for a useful downtown continuation." : "Build the next stop into tonight's plan.";
  const recommendation = hints[completed % Math.max(1, hints.length)] || `Continue with ${activeStop?.name || activeStop?.title || "the closest unvisited stop"}.`;
  return (
    <section className="dp-collection-ai-card" aria-labelledby={`dp-collection-ai-${route.id}`}>
      <Sparkles aria-hidden="true" />
      <div><p>Smart next step</p><h3 id={`dp-collection-ai-${route.id}`}>{timeHint}</h3><span>{recommendation}</span></div>
    </section>
  );
}
