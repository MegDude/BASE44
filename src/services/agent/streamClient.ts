import { buildAgentPayload, type AgentQueryInput } from "./agentClient";

export async function streamAgent(
  input: AgentQueryInput,
  onEvent: (event: Record<string, unknown>) => void,
  endpoint = "/api/agent/stream",
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildAgentPayload(input)),
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Agent stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      const data = part
        .split("\n")
        .find((line) => line.startsWith("data:"))
        ?.replace(/^data:\s*/, "");
      if (!data) continue;
      onEvent(JSON.parse(data));
    }
  }
}
