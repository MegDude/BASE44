import inventory from "../../inventory/generated/content-inventory.json";

type CountCardProps = { label: string; value: number };

function CountCard({ label, value }: CountCardProps) {
  return (
    <div className="border-t border-[#C8A96A] py-4">
      <p className="text-[#526171] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#0B1F33]">{value.toLocaleString()}</p>
    </div>
  );
}

export default function AdminContentIndex() {
  const { metadata, qualityIssues = [], redirects = [], workspaces = [] } = inventory;
  const highPriority = qualityIssues.filter((issue) => issue.severity === "High").slice(0, 20);
  const counts = [
    ["App routes", metadata.routeCount], ["Redirects", metadata.redirectCount],
    ["Workspaces", metadata.workspaceCount], ["Entities", metadata.entityCount],
    ["Map pins", metadata.pinCount], ["Perks", metadata.perkCount],
    ["Events", metadata.eventCount], ["Campaigns", metadata.campaignCount],
    ["Routes and collections", metadata.routeCollectionCount], ["Relationships", metadata.relationshipCount],
  ] as const;

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-[#0B1F33] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#DDE3EA] pb-6">
          <p className="text-[#927641] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Internal content audit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">See what the app contains</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#526171]">
            Review routes, places, partner records, search content, and quality gaps across Downtown Perks. Correct the original item, then refresh this index.
          </p>
          <p className="mt-3 text-xs text-[#6B7785]">Generated {new Date(metadata.generatedAt).toLocaleString()}</p>
        </header>

        <section aria-labelledby="coverage-heading" className="py-7">
          <h2 id="coverage-heading" className="text-lg font-semibold">What is covered</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
            {counts.map(([label, value]) => <CountCard key={label} label={label} value={Number(value)} />)}
          </div>
        </section>

        <section aria-labelledby="action-heading" className="border-t border-[#DDE3EA] py-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="action-heading" className="text-lg font-semibold">Fix these records next</h2>
              <p className="mt-1 text-sm text-[#526171]">High-priority content gaps stay visible until they are corrected.</p>
            </div>
            <p className="text-sm font-medium text-[#927641]">{qualityIssues.length.toLocaleString()} total findings</p>
          </div>
          <div className="mt-5 overflow-x-auto border-y border-[#DDE3EA]">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#0B1F33] text-white">
                <tr>{["Priority", "Type", "Record", "Problem", "Next action"].map((label) => <th key={label} className="px-3 py-3 text-xs font-semibold uppercase tracking-normal">{label}</th>)}</tr>
              </thead>
              <tbody>
                {highPriority.map((issue) => (
                  <tr key={issue.issueId} className="border-b border-[#E7EBF0] align-top last:border-0">
                    <td className="px-3 py-3 font-semibold text-[#9A3F35]">{issue.severity}</td>
                    <td className="px-3 py-3">{issue.objectType}</td>
                    <td className="px-3 py-3 font-mono text-xs">{issue.objectId}</td>
                    <td className="px-3 py-3">{issue.issue}</td>
                    <td className="px-3 py-3 text-[#526171]">{issue.recommendedAction}</td>
                  </tr>
                ))}
                {!highPriority.length && <tr><td className="px-3 py-6 text-[#526171]" colSpan={5}>No high-priority gaps were generated.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#DDE3EA] py-7 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Workspace coverage</h2>
            <p className="mt-1 text-sm text-[#526171]">{workspaces.length} source-backed workspace records are available for authenticated review.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Redirect coverage</h2>
            <p className="mt-1 text-sm text-[#526171]">{redirects.length} aliases and redirects are recorded with state-preservation checks.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
