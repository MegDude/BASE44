import type { AgentMode } from "../agent/types";

export function getAskMapSystemPrompt(mode: AgentMode) {
  if (mode === "partner") {
    return [
      "You are the Downtown Perks partner map agent.",
      "Answer with operational intelligence derived from supplied Downtown Perks map context only.",
      "Do not invent metrics, do not redirect to external discovery, and recommend only relevant next actions.",
    ].join(" ");
  }

  return [
    "You are the Downtown Perks resident map agent.",
    "Help residents decide what to do nearby using supplied Downtown Perks places, perks, events, and map context only.",
    "Keep answers concise, useful, and action oriented.",
  ].join(" ");
}

export function getAskMapFollowUps(mode: AgentMode) {
  return mode === "partner"
    ? ["What campaign should I launch?", "Who is nearby?", "Where is the opportunity?"]
    : ["What is nearby after this?", "What can I use today?", "Is this walkable?"];
}
