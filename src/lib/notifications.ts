import type { ManagementNotification, SurveyResponse } from "@/lib/surveys/surveyIntelligence";
import { sendResidentEmail } from "@/lib/notifications/resend";

type NotificationEnv = Record<string, string | undefined>;

export function buildSurveyManagementMessage(response: SurveyResponse, exportStatus: string) {
  return [
    "New Downtown Perks survey response completed",
    `Resident: ${response.residentName || "Resident"}`,
    `Building: ${response.buildingName || response.buildingId || "Not provided"}`,
    response.unitId ? `Unit: ${response.unitId}` : "",
    `Survey: ${response.surveyName}`,
    response.partnerName ? `Partner: ${response.partnerName}` : "",
    response.perkName ? `Perk: ${response.perkName}` : "",
    response.redemptionId ? `Redemption: ${response.redemptionId}` : "",
    response.score ? `Rating: ${response.score}` : "",
    response.sentiment ? `Sentiment: ${response.sentiment}` : "",
    `Google Sheet export: ${exportStatus}`,
    `/map?mode=partner&tab=reports&filter=Surveys&responseId=${encodeURIComponent(response.id)}`,
  ].filter(Boolean).join("\n");
}

export async function sendSurveyManagementNotification(response: SurveyResponse, exportStatus: string, env: NotificationEnv = process.env): Promise<ManagementNotification> {
  const channel = env.MANAGEMENT_NOTIFICATION_EMAIL ? "email" : "in-app";
  const message = buildSurveyManagementMessage(response, exportStatus);
  const base = {
    id: `management-note-${response.id}`,
    type: response.redemptionId ? "redemption-survey-completed" as const : "survey-completed" as const,
    residentId: response.residentId,
    buildingId: response.buildingId,
    surveyResponseId: response.id,
    redemptionId: response.redemptionId,
    partnerId: response.partnerId,
    perkId: response.perkId,
    message,
    channel,
    createdAt: new Date().toISOString(),
  };

  if (!env.MANAGEMENT_NOTIFICATION_EMAIL) {
    return { ...base, status: "pending_configuration" };
  }

  const result = await sendResidentEmail({
    to: env.MANAGEMENT_NOTIFICATION_EMAIL,
    subject: "New Downtown Perks survey response completed",
    html: `<pre>${message.replace(/[<&>]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] || char))}</pre>`,
  }, env);

  return {
    ...base,
    status: result.status === "sent" ? "sent" : result.status === "pending_configuration" ? "pending_configuration" : "failed",
    sentAt: result.status === "sent" ? new Date().toISOString() : undefined,
  };
}
