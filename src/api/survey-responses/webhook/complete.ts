import { appendSurveyResponseToGoogleSheet } from "@/lib/googleSheets";
import { sendSurveyManagementNotification } from "@/lib/notifications";
import type { SurveyResponse } from "@/lib/surveys/surveyIntelligence";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const response = await request.json() as SurveyResponse;
  if (!response?.id || !response?.surveyId) {
    return Response.json({ error: "Missing survey response payload" }, { status: 400 });
  }

  const exportResult = await appendSurveyResponseToGoogleSheet(response);
  const notification = await sendSurveyManagementNotification(response, exportResult.status);

  return Response.json({
    surveyResponseId: response.id,
    export: exportResult,
    notification,
  }, { status: exportResult.status === "failed" || notification.status === "failed" ? 207 : 200 });
}
