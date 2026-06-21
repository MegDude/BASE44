import { appendSurveyResponseToGoogleSheet } from "@/lib/googleSheets";
import type { SurveyResponse } from "@/lib/surveys/surveyIntelligence";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const response = await request.json() as SurveyResponse;
  if (!response?.id || !response?.surveyId) {
    return Response.json({ error: "Missing survey response payload" }, { status: 400 });
  }

  const result = await appendSurveyResponseToGoogleSheet(response);
  return Response.json({ surveyResponseId: response.id, ...result }, { status: result.status === "failed" ? 502 : 200 });
}
