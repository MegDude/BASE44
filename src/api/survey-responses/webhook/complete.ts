import { normalizeSurveyWebhookPayload, orchestrateSurveyCompletion } from "@/lib/surveys/surveyCrmServer";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const response = normalizeSurveyWebhookPayload(await request.json());
  if (!response?.id || !response?.surveyId) {
    return Response.json({ error: "Missing survey response payload" }, { status: 400 });
  }

  const result = await orchestrateSurveyCompletion(response);
  const failed = [
    result.persistence.status,
    result.export.status,
    result.notification.status,
    result.sms.status,
    result.workflow.status,
  ].includes("failed");

  return Response.json({
    surveyResponseId: response.id,
    ...result,
  }, { status: failed ? 207 : 200 });
}
