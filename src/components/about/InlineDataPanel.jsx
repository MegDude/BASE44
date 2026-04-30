export default function InlineDataPanel({ items = [] }) {
  return (
    <div className="border-t border-[rgba(11,31,51,0.08)] pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
        In one view
      </p>
      <div className="mt-4 space-y-0">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="border-b border-[rgba(11,31,51,0.08)] py-4 last:border-b-0"
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">{item.label}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.42)]">
                {item.meta}
              </span>
            </div>
            {item.body ? (
              <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{item.body}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
