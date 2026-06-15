export const ASK_MAP_ACTIONS = {
  applyFilter: "apply_filter",
  openEntity: "open_entity",
  openReports: "open_reports",
  openCampaigns: "open_campaigns",
  savePlace: "save_place",
  rsvpEvent: "rsvp_event",
  getDirections: "get_directions",
};

export function createAskMapAction(label, action, options = {}) {
  return {
    label,
    action,
    entityId: options.entityId || "",
    href: options.href || "",
    filter: options.filter || "",
  };
}
