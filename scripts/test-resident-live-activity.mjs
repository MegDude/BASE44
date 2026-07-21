import fs from "node:fs";

const home = fs.readFileSync("src/pages/ResidentHome.tsx", "utf8");
const residentClient = fs.readFileSync("src/lib/resident/liveActivity.ts", "utf8");
const residentApi = fs.readFileSync("api/resident/live-activity.js", "utf8");
const partnerClient = fs.readFileSync("src/lib/partner/publishedContentClient.ts", "utf8");
const partnerApi = fs.readFileSync("api/partner/published-content.js", "utf8");
const workspace = fs.readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");

const checks = [
  [!home.includes("Started 5 mins ago"), "Resident Home does not invent relative activity times"],
  [!home.includes("const liveActivity = ["), "Resident Home has no hard-coded live activity list"],
  [home.includes("getResidentLiveActivity(controller.signal)"), "Resident Home loads the shared activity feed"],
  [residentClient.includes('fetch("/api/resident/live-activity"'), "Resident client uses the resident activity endpoint"],
  [residentApi.includes('from("perks")') && residentApi.includes('from("events")'), "Resident endpoint reads canonical offers and events"],
  [residentApi.includes("ACTIVE_PERK_STATUSES") && residentApi.includes("ACTIVE_EVENT_STATUSES"), "Resident endpoint filters publishable states"],
  [residentApi.includes('status: "unavailable", items: []'), "Unavailable storage never produces placeholder activity"],
  [partnerClient.includes("/api/partner/published-content"), "Partner publisher uses the canonical publishing endpoint"],
  [partnerApi.includes("requirePartnerMembership") && partnerApi.includes("partner_id"), "Partner writes are authenticated and workspace-scoped"],
  [workspace.includes("createPublishedWorkspaceItem") && workspace.includes("updatePublishedWorkspaceItem"), "Offer and event editors write through the shared publishing contract"],
];

const failed = checks.filter(([passed]) => !passed);
checks.forEach(([passed, message]) => console.log(`${passed ? "PASS" : "FAIL"} ${message}`));
if (failed.length) process.exit(1);
