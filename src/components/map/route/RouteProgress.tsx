type RouteProgressProps = {
  current: number;
  total: number;
  started: boolean;
  nextStopName?: string;
};

export function RouteProgress({ current, total, started, nextStopName }: RouteProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <section className="dp-route-progress" aria-label="Route progress">
      <div>
        <strong>{started ? `${current} of ${total} stops` : "Ready to start"}</strong>
        <span>{started && nextStopName ? `Up next · ${nextStopName}` : `${total} stops ahead`}</span>
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
