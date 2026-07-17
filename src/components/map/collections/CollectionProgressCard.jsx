import { Award, Check, QrCode } from "lucide-react";

export function CollectionProgressCard({ route, completed, total }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section className="dp-collection-progress-card" aria-labelledby={`dp-collection-progress-${route.id}`}>
      <div className="dp-collection-progress-card__top">
        <span><Award aria-hidden="true" /></span>
        <div><p>Resident Passport</p><h3 id={`dp-collection-progress-${route.id}`}>{route.badge || "Collection badge"}</h3></div>
        <strong>{percent}%</strong>
      </div>
      <div className="dp-collection-progress-card__bar" aria-label={`${percent}% complete`}><span style={{ width: `${percent}%` }} /></div>
      <div className="dp-collection-progress-card__meta"><span><QrCode aria-hidden="true" /> {completed} verified</span><span><Check aria-hidden="true" /> {Math.max(0, total - completed)} remaining</span></div>
      <p>{route.completionReward || "Complete every stop to add this badge to your Resident Passport."}</p>
    </section>
  );
}
