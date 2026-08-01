type RouteProgressProps = {
  current: number;
  total: number;
  started: boolean;
  nextStopName?: string;
};

export function RouteProgress({ current, total, started, nextStopName }: RouteProgressProps) {
  if (!started) return null;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <section className="dp-route-progress" aria-label="Route progress">
      <div>
        <strong>{`${current} of ${total} stops explored`}</strong>
        <span>{nextStopName ? `Next · ${nextStopName}` : `${Math.max(total - current, 0)} stops remaining`}</span>
      </div>
      <div
        className="dp-route-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`${current} of ${total} route stops completed`}
      >
        <i style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
