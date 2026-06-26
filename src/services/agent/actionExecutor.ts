export type AgentAction = {
  action?: string;
  type?: string;
  entityId?: string;
  filter?: string;
  district?: string;
  route?: string;
  [key: string]: unknown;
};

export function executeAgentAction(action: AgentAction, handlers: Record<string, (action: AgentAction) => void> = {}) {
  const actionType = String(action.action || action.type || "");
  const handler = handlers[actionType];
  if (handler) {
    handler(action);
    return true;
  }
  return false;
}
