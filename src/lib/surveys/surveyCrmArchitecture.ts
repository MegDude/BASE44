import type { SurveyProvider, SurveyResponse } from "@/lib/surveys/surveyIntelligence";

export type MessagingJourneyType =
  | "resident-onboarding"
  | "event-reminder"
  | "passport-progress"
  | "perk-redemption-follow-up"
  | "partner-intelligence";

export type SurveyCrmEventType =
  | "survey_completed"
  | "redemption_survey_completed"
  | "event_feedback_completed"
  | "resident_onboarding_completed";

export type SurveyCrmEvent = {
  eventType: SurveyCrmEventType;
  provider: SurveyProvider;
  response: SurveyResponse;
  participationContext: {
    residentId: string;
    buildingId?: string;
    partnerId?: string;
    perkId?: string;
    redemptionId?: string;
    mapEntityId?: string;
    district?: string;
    category?: string;
  };
  destinations: {
    supabase: boolean;
    googleSheets: boolean;
    managementNotification: boolean;
    twilioJourney?: MessagingJourneyType;
    n8nWorkflow?: string;
    openAiSummary: boolean;
  };
  createdAt: string;
};

export const SURVEY_CRM_STACK = {
  surveyEngine: {
    recommended: "tally" as SurveyProvider,
    alternatives: ["jotform", "surveyjs"] as SurveyProvider[],
    purpose: "Resident surveys, event feedback, onboarding, and perk-redemption follow-ups.",
  },
  messaging: {
    provider: "twilio",
    purpose: "Verified SMS onboarding, reminders, passport progress, and campaign journeys.",
  },
  database: {
    provider: "supabase",
    purpose: "Resident profiles, survey responses, messaging journeys, redemptions, and CRM leads.",
  },
  analytics: {
    providers: ["google-sheets", "reports-db"],
    purpose: "Live reporting, partner summaries, export health, and operational review.",
  },
  ai: {
    provider: "backend-agent",
    purpose: "Summaries, sentiment, resident segments, and recommended partner actions.",
  },
  automation: {
    provider: "n8n",
    purpose: "Webhook orchestration across surveys, SMS, CRM, exports, and reports.",
  },
} as const;

export const SURVEY_CRM_ENV_KEYS = [
  "VITE_TALLY_RESIDENT_ONBOARDING_FORM_ID",
  "VITE_TALLY_REDEMPTION_SURVEY_FORM_ID",
  "VITE_TALLY_EVENT_FEEDBACK_FORM_ID",
  "JOTFORM_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "TWILIO_VERIFY_SERVICE_SID",
  "TWILIO_MESSAGING_SERVICE_SID",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_SHEETS_CLIENT_EMAIL",
  "GOOGLE_SHEETS_PRIVATE_KEY",
  "GOOGLE_SHEETS_SURVEY_SPREADSHEET_ID",
  "GOOGLE_SHEETS_SURVEY_TAB_NAME",
  "BACKEND_AGENT_API_BASE_URL",
  "N8N_SURVEY_COMPLETION_WEBHOOK_URL",
] as const;

export function resolveSurveyProviderForFlow(sourceFlow: SurveyResponse["sourceFlow"]): SurveyProvider {
  if (sourceFlow === "building-feedback") return "jotform";
  return "tally";
}

export function getSurveyCrmEventType(response: SurveyResponse): SurveyCrmEventType {
  if (response.redemptionId || response.sourceFlow === "perk-redemption") return "redemption_survey_completed";
  if (response.sourceFlow === "event-feedback") return "event_feedback_completed";
  if (response.surveyId.includes("onboarding")) return "resident_onboarding_completed";
  return "survey_completed";
}

export function getMessagingJourneyForSurvey(response: SurveyResponse): MessagingJourneyType | undefined {
  if (response.sourceFlow === "perk-redemption" || response.redemptionId) return "perk-redemption-follow-up";
  if (response.sourceFlow === "event-feedback") return "event-reminder";
  if (response.surveyId.includes("passport")) return "passport-progress";
  if (response.surveyId.includes("onboarding")) return "resident-onboarding";
  return undefined;
}

export function buildSurveyCrmEvent(response: SurveyResponse): SurveyCrmEvent {
  const provider = response.surveyProvider || resolveSurveyProviderForFlow(response.sourceFlow);
  return {
    eventType: getSurveyCrmEventType(response),
    provider,
    response,
    participationContext: {
      residentId: response.residentId,
      buildingId: response.buildingId,
      partnerId: response.partnerId,
      perkId: response.perkId,
      redemptionId: response.redemptionId,
      mapEntityId: response.mapEntityId,
      district: response.district,
      category: response.category,
    },
    destinations: {
      supabase: true,
      googleSheets: true,
      managementNotification: true,
      twilioJourney: getMessagingJourneyForSurvey(response),
      n8nWorkflow: "survey-completion",
      openAiSummary: true,
    },
    createdAt: new Date().toISOString(),
  };
}

export function buildN8nSurveyPayload(response: SurveyResponse, exportStatus = "pending") {
  const event = buildSurveyCrmEvent(response);
  return {
    eventType: event.eventType,
    provider: event.provider,
    responseId: response.id,
    surveyId: response.surveyId,
    surveyName: response.surveyName,
    residentId: response.residentId,
    residentName: response.residentName,
    residentEmail: response.residentEmail,
    residentPhone: response.residentPhone,
    buildingId: response.buildingId,
    buildingName: response.buildingName,
    partnerId: response.partnerId,
    partnerName: response.partnerName,
    perkId: response.perkId,
    perkName: response.perkName,
    redemptionId: response.redemptionId,
    mapEntityId: response.mapEntityId,
    district: response.district,
    category: response.category,
    score: response.score,
    sentiment: response.sentiment,
    sourceFlow: response.sourceFlow,
    exportStatus,
    answers: response.answers,
    completedAt: response.completedAt,
  };
}

export function buildTwilioSurveyMessage(response: SurveyResponse) {
  if (response.sourceFlow === "perk-redemption" || response.redemptionId) {
    return `Thanks for using Downtown Perks${response.perkName ? ` at ${response.perkName}` : ""}. Your feedback helps shape better resident perks downtown.`;
  }
  if (response.sourceFlow === "event-feedback") {
    return `Thanks for sharing event feedback with Downtown Perks. We will use it to make nearby events easier to discover.`;
  }
  return `Thanks for completing a Downtown Perks survey. Your answers help improve downtown recommendations, perks, and resident experiences.`;
}
