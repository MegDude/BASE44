export const DAA_CAMPAIGN_ID = "daa-art-parks-tour";
export const DAA_WORKSPACE_ID = "workspace_downtown_austin_alliance";
export const DAA_WORKSPACE_NAME = "Downtown Austin Alliance";

export const daaCampaignStrategy = {
  id: DAA_CAMPAIGN_ID,
  title: "Downtown Austin Art & Parks Tour",
  workspaceId: DAA_WORKSPACE_ID,
  workspaceName: DAA_WORKSPACE_NAME,
  layer: "Civic",
  residentAction: "check-in",
  checkInEnabled: true,
  measures: ["check-ins", "saves", "directions", "shares"],
  use: "Help residents and visitors remember civic stops, build self-guided routes, and connect nearby places into the same downtown walk.",
};
