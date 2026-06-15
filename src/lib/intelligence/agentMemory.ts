export type AgentMemoryRecord = {
  query: string;
  mode: "resident" | "partner";
  intent?: string;
  selectedEntities?: string[];
  recommendations?: string[];
  clickedAction?: string;
  conversionEvent?: string;
  sessionContext?: Record<string, unknown>;
};

export function createAgentMemoryRecord(record: AgentMemoryRecord) {
  return {
    ...record,
    source: "downtown_perks_agent",
    createdAt: new Date().toISOString(),
  };
}
