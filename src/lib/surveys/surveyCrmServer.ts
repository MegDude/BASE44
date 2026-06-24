import { appendSurveyResponseToGoogleSheet } from "@/lib/googleSheets";
import { sendSurveyCompletionSms } from "@/lib/messaging/twilioMessaging";
import { sendSurveyManagementNotification } from "@/lib/notifications";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  buildN8nSurveyPayload,
  buildSurveyCrmEvent,
  resolveSurveyProviderForFlow,
} from "@/lib/surveys/surveyCrmArchitecture";
import type { SurveyResponse } from "@/lib/surveys/surveyIntelligence";

type SurveyCrmEnv = Record<string, string | undefined>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function normalizeSurveyWebhookPayload(payload: unknown): SurveyResponse | null {
  if (!isRecord(payload)) return null;
  const direct = payload as Partial<SurveyResponse>;
  const data = isRecord(payload.data) ? payload.data : payload;
  const answers = isRecord(direct.answers) ? direct.answers : isRecord(data.answers) ? data.answers : {};
  const surveyId = stringValue(direct.surveyId || data.surveyId || data.formId || data.form_id || data.id);
  if (!surveyId) return null;
  const completedAt = stringValue(direct.completedAt || data.completedAt || data.submittedAt || data.created_at) || new Date().toISOString();
  const sourceFlow = direct.sourceFlow || (stringValue(data.sourceFlow) as SurveyResponse["sourceFlow"]) || "resident-survey";
  const response: SurveyResponse = {
    id: stringValue(direct.id || data.responseId || data.submissionId || data.submission_id) || `survey-response-${surveyId}-${Date.now()}`,
    surveyId,
    surveyName: stringValue(direct.surveyName || data.surveyName || data.formName || data.form_name) || "Downtown Perks Survey",
    surveyProvider: direct.surveyProvider || resolveSurveyProviderForFlow(sourceFlow),
    providerSubmissionId: stringValue(direct.providerSubmissionId || data.submissionId || data.submission_id),
    residentId: stringValue(direct.residentId || data.residentId || data.resident_id) || "anonymous-resident",
    residentName: stringValue(direct.residentName || data.residentName || data.name),
    residentEmail: stringValue(direct.residentEmail || data.residentEmail || data.email),
    residentPhone: stringValue(direct.residentPhone || data.residentPhone || data.phone),
    buildingId: stringValue(direct.buildingId || data.buildingId || data.building_id),
    buildingName: stringValue(direct.buildingName || data.buildingName || data.building),
    unitId: stringValue(direct.unitId || data.unitId || data.unit),
    partnerId: stringValue(direct.partnerId || data.partnerId || data.partner_id),
    partnerName: stringValue(direct.partnerName || data.partnerName || data.partner),
    perkId: stringValue(direct.perkId || data.perkId || data.perk_id),
    perkName: stringValue(direct.perkName || data.perkName || data.perk),
    redemptionId: stringValue(direct.redemptionId || data.redemptionId || data.redemption_id),
    mapEntityId: stringValue(direct.mapEntityId || data.mapEntityId || data.map_entity_id),
    district: stringValue(direct.district || data.district),
    category: stringValue(direct.category || data.category),
    answers,
    score: typeof direct.score === "number" ? direct.score : typeof data.score === "number" ? data.score : undefined,
    sentiment: direct.sentiment || (stringValue(data.sentiment) as SurveyResponse["sentiment"]) || "neutral",
    completedAt,
    exportedToGoogleSheets: Boolean(direct.exportedToGoogleSheets),
    googleSheetRowId: stringValue(direct.googleSheetRowId || data.googleSheetRowId),
    notificationSent: Boolean(direct.notificationSent),
    sourceFlow,
  };
  return response;
}

export async function persistSurveyResponseToSupabase(response: SurveyResponse, env: SurveyCrmEnv = process.env) {
  const supabase = createSupabaseServiceClient(env);
  if (!supabase) {
    return { status: "pending_configuration" as const, errorMessage: "Supabase service credentials are not configured." };
  }

  const { error } = await supabase.from("survey_responses").upsert({
    id: response.id,
    survey_id: response.surveyId,
    resident_id: response.residentId,
    building_id: response.buildingId || null,
    unit_id: response.unitId || null,
    partner_id: response.partnerId || null,
    perk_id: response.perkId || null,
    redemption_id: response.redemptionId || null,
    map_entity_id: response.mapEntityId || null,
    district: response.district || null,
    category: response.category || null,
    answers: response.answers,
    score: response.score || null,
    sentiment: response.sentiment || null,
    completed_at: response.completedAt,
    exported_to_google_sheets: response.exportedToGoogleSheets,
    google_sheet_row_id: response.googleSheetRowId || null,
    notification_sent: response.notificationSent,
    source_flow: response.sourceFlow,
  });

  if (error) return { status: "failed" as const, errorMessage: error.message };
  return { status: "success" as const };
}

export async function sendSurveyN8nWorkflow(response: SurveyResponse, exportStatus: string, env: SurveyCrmEnv = process.env) {
  if (!env.N8N_SURVEY_COMPLETION_WEBHOOK_URL) {
    return { status: "pending_configuration" as const, errorMessage: "N8N_SURVEY_COMPLETION_WEBHOOK_URL is not configured." };
  }
  const result = await fetch(env.N8N_SURVEY_COMPLETION_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildN8nSurveyPayload(response, exportStatus)),
  });
  if (!result.ok) return { status: "failed" as const, errorMessage: `n8n workflow failed with ${result.status}` };
  return { status: "sent" as const };
}

export async function orchestrateSurveyCompletion(response: SurveyResponse, env: SurveyCrmEnv = process.env) {
  const event = buildSurveyCrmEvent(response);
  const persistence = await persistSurveyResponseToSupabase(response, env);
  const exportResult = await appendSurveyResponseToGoogleSheet(response, env);
  const notification = await sendSurveyManagementNotification(response, exportResult.status, env);
  const sms = await sendSurveyCompletionSms(response, env);
  const workflow = await sendSurveyN8nWorkflow(response, exportResult.status, env);

  return {
    event,
    persistence,
    export: exportResult,
    notification,
    sms,
    workflow,
  };
}
