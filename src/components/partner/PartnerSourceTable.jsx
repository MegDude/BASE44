export default function PartnerSourceTable({
  title = "Source performance",
  intro = "Which access points are driving discovery and action.",
  rows = [],
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-6 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)]">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-[rgba(11,31,51,0.62)]">{intro}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(11,31,51,0.08)] text-[rgba(11,31,51,0.48)]">
              <th className="py-3 pr-4 font-medium">Source</th>
              <th className="py-3 pr-4 font-medium">Code</th>
              <th className="py-3 pr-4 font-medium">Opens</th>
              <th className="py-3 pr-4 font-medium">Actions</th>
              <th className="py-3 pr-4 font-medium">Saves</th>
              <th className="py-3 pr-4 font-medium">Unlocks</th>
              <th className="py-3 font-medium">Visits</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.source_code || row.label} className="border-b border-[rgba(11,31,51,0.05)]">
                  <td className="py-3 pr-4 font-medium text-[var(--dp-navy,#0B1F33)]">{row.label}</td>
                  <td className="py-3 pr-4 text-[rgba(11,31,51,0.52)]">{row.source_code}</td>
                  <td className="py-3 pr-4 text-[var(--dp-navy,#0B1F33)]">{row.map_opens}</td>
                  <td className="py-3 pr-4 text-[var(--dp-navy,#0B1F33)]">{row.entity_opens}</td>
                  <td className="py-3 pr-4 text-[var(--dp-navy,#0B1F33)]">{row.saves}</td>
                  <td className="py-3 pr-4 text-[var(--dp-navy,#0B1F33)]">{row.unlocks}</td>
                  <td className="py-3 text-[var(--dp-navy,#0B1F33)]">{row.redemptions}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[rgba(11,31,51,0.52)]">
                  No source data available for this partner yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
