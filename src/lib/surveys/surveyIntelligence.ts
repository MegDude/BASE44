export type SurveySourceFlow = "resident-survey" | "perk-redemption" | "event-feedback" | "building-feedback";
export type SurveyExportStatus = "pending" | "success" | "failed" | "pending_configuration";
export type ManagementNotificationStatus = "pending" | "sent" | "failed" | "pending_configuration";
export type SurveyProvider = "native" | "tally" | "jotform" | "surveyjs";

export type SurveyResponse = {
  id: string;
  surveyId: string;
  surveyName: string;
  surveyProvider?: SurveyProvider;
  providerSubmissionId?: string;
  residentId: string;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  buildingId?: string;
  buildingName?: string;
  unitId?: string;
  partnerId?: string;
  partnerName?: string;
  perkId?: string;
  perkName?: string;
  redemptionId?: string;
  mapEntityId?: string;
  district?: string;
  category?: string;
  answers: Record<string, unknown>;
  score?: number;
  sentiment?: "positive" | "neutral" | "negative";
  completedAt: string;
  exportedToGoogleSheets: boolean;
  googleSheetRowId?: string;
  notificationSent: boolean;
  sourceFlow: SurveySourceFlow;
};

export type SurveyExportLog = {
  id: string;
  surveyResponseId: string;
  destination: "google-sheets";
  status: SurveyExportStatus;
  attemptedAt: string;
  completedAt?: string;
  errorMessage?: string;
  sheetId?: string;
  rowNumber?: number;
};

export type ManagementNotification = {
  id: string;
  type: "survey-completed" | "redemption-survey-completed";
  residentId: string;
  buildingId?: string;
  surveyResponseId: string;
  redemptionId?: string;
  partnerId?: string;
  perkId?: string;
  message: string;
  status: ManagementNotificationStatus;
  channel: "email" | "slack" | "in-app";
  createdAt: string;
  sentAt?: string;
};

export const SURVEY_SHEET_COLUMNS = [
  "Completed At",
  "Resident Name",
  "Resident Email",
  "Building",
  "Unit",
  "Survey Name",
  "Source Flow",
  "Partner",
  "Perk",
  "Redemption ID",
  "District",
  "Category",
  "Rating / Score",
  "Sentiment",
  "Answers JSON",
  "Export Status",
  "App Response ID",
] as const;

const RESPONSES_KEY = "dp-survey-responses";
const EXPORT_LOG_KEY = "dp-survey-export-logs";
const NOTIFICATION_KEY = "dp-management-notifications";

function readLocalArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix: string, seed = "") {
  const cleanSeed = seed.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  if (cleanSeed) return `${prefix}-${cleanSeed}`;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getStoredSurveyResponses() {
  return readLocalArray<SurveyResponse>(RESPONSES_KEY);
}

export function getStoredSurveyExportLogs() {
  return readLocalArray<SurveyExportLog>(EXPORT_LOG_KEY);
}

export function getStoredManagementNotifications() {
  return readLocalArray<ManagementNotification>(NOTIFICATION_KEY);
}

export function buildSurveySheetRow(response: SurveyResponse, exportStatus: string) {
  return [
    response.completedAt,
    response.residentName || "Resident",
    response.residentEmail || "",
    response.buildingName || response.buildingId || "",
    response.unitId || "",
    response.surveyName,
    response.sourceFlow,
    response.partnerName || response.partnerId || "",
    response.perkName || response.perkId || "",
    response.redemptionId || "",
    response.district || "",
    response.category || "",
    response.score ?? "",
    response.sentiment || "",
    JSON.stringify(response.answers || {}),
    exportStatus,
    response.id,
  ];
}

export function queueSurveyResponse(response: SurveyResponse) {
  const responses = getStoredSurveyResponses();
  const existingIndex = responses.findIndex((item) => item.id === response.id);
  const nextResponses = existingIndex >= 0
    ? responses.map((item, index) => (index === existingIndex ? { ...item, ...response } : item))
    : [response, ...responses];
  writeLocalArray(RESPONSES_KEY, nextResponses);

  const exportLogs = getStoredSurveyExportLogs();
  const hasExportLog = exportLogs.some((item) => item.surveyResponseId === response.id && item.destination === "google-sheets");
  if (!hasExportLog) {
    writeLocalArray(EXPORT_LOG_KEY, [
      {
        id: id("survey-export", response.id),
        surveyResponseId: response.id,
        destination: "google-sheets",
        status: "pending",
        attemptedAt: new Date().toISOString(),
      },
      ...exportLogs,
    ]);
  }

  const notifications = getStoredManagementNotifications();
  const hasNotification = notifications.some((item) => item.surveyResponseId === response.id);
  if (!hasNotification) {
    writeLocalArray(NOTIFICATION_KEY, [
      {
        id: id("management-note", response.id),
        type: response.redemptionId ? "redemption-survey-completed" : "survey-completed",
        residentId: response.residentId,
        buildingId: response.buildingId,
        surveyResponseId: response.id,
        redemptionId: response.redemptionId,
        partnerId: response.partnerId,
        perkId: response.perkId,
        message: `New Downtown Perks survey response completed for ${response.surveyName}. Google Sheet export is pending.`,
        status: "pending",
        channel: "in-app",
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  }

  return response;
}

export function completeSurveyFlow(input: Partial<SurveyResponse> & Pick<SurveyResponse, "surveyId" | "surveyName" | "answers" | "sourceFlow">) {
  const completedAt = input.completedAt || new Date().toISOString();
  const response: SurveyResponse = {
    id: input.id || id("survey-response", `${input.surveyId}-${input.residentId || "anonymous"}-${input.redemptionId || input.mapEntityId || completedAt.slice(0, 10)}`),
    surveyId: input.surveyId,
    surveyName: input.surveyName,
    surveyProvider: input.surveyProvider || "native",
    providerSubmissionId: input.providerSubmissionId || "",
    residentId: input.residentId || "anonymous-resident",
    residentName: input.residentName || "Resident",
    residentEmail: input.residentEmail || "",
    residentPhone: input.residentPhone || "",
    buildingId: input.buildingId || "",
    buildingName: input.buildingName || "",
    unitId: input.unitId || "",
    partnerId: input.partnerId || "",
    partnerName: input.partnerName || "",
    perkId: input.perkId || "",
    perkName: input.perkName || "",
    redemptionId: input.redemptionId || "",
    mapEntityId: input.mapEntityId || "",
    district: input.district || "",
    category: input.category || "",
    answers: input.answers,
    score: input.score,
    sentiment: input.sentiment || "positive",
    completedAt,
    exportedToGoogleSheets: Boolean(input.exportedToGoogleSheets),
    googleSheetRowId: input.googleSheetRowId || "",
    notificationSent: Boolean(input.notificationSent),
    sourceFlow: input.sourceFlow,
  };

  return queueSurveyResponse(response);
}

export function getSurveyIntelligenceSummary(entity?: {
  id?: string;
  name?: string;
  district?: string;
  category?: string;
  type?: string;
  campaignName?: string;
  perk?: { title?: string; offer?: string };
  raw?: Record<string, unknown>;
}) {
  const entityName = entity?.campaignName || entity?.name || "Selected campaign";
  const isPerk = Boolean(entity?.perk || String(entity?.type || entity?.category || "").toLowerCase().includes("perk"));
  const baseScore = isPerk ? 4.7 : 4.5;
  return {
    surveyName: isPerk ? "Redemption Follow-up" : "Campaign Pulse",
    completionsToday: isPerk ? 18 : 27,
    redemptionLinkedCompletions: isPerk ? 14 : 11,
    averageRating: baseScore,
    topPartner: entityName,
    unresolvedNegativeFeedback: isPerk ? 1 : 2,
    exportHealth: "Pending Google credentials",
    latest: [
      {
        resident: "Maya R.",
        building: "The Shore",
        partner: entityName,
        perk: entity?.perk?.title || entity?.perk?.offer || "Resident offer",
        score: baseScore,
        exportStatus: "pending_configuration" as SurveyExportStatus,
        sourceFlow: isPerk ? "perk-redemption" as SurveySourceFlow : "resident-survey" as SurveySourceFlow,
      },
      {
        resident: "Resident",
        building: "Hanover Republic Square",
        partner: entityName,
        perk: "Map prompt",
        score: baseScore - 0.2,
        exportStatus: "pending" as SurveyExportStatus,
        sourceFlow: "building-feedback" as SurveySourceFlow,
      },
    ],
  };
}
