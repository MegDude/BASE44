import { createSign } from "node:crypto";
import { buildSurveySheetRow, type SurveyResponse } from "@/lib/surveys/surveyIntelligence";

type GoogleSheetsEnv = {
  GOOGLE_SHEETS_CLIENT_EMAIL?: string;
  GOOGLE_SHEETS_PRIVATE_KEY?: string;
  GOOGLE_SHEETS_SURVEY_SPREADSHEET_ID?: string;
  GOOGLE_SHEETS_SURVEY_TAB_NAME?: string;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(env: GoogleSheetsEnv) {
  if (!env.GOOGLE_SHEETS_CLIENT_EMAIL || !env.GOOGLE_SHEETS_PRIVATE_KEY) {
    return { status: "pending_configuration" as const, errorMessage: "Google Sheets service account credentials are not configured." };
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const unsigned = `${header}.${payload}`;
  const privateKey = env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    return { status: "failed" as const, errorMessage: body.error_description || body.error || `Google auth failed with ${response.status}` };
  }
  return { status: "success" as const, accessToken: String(body.access_token) };
}

export async function appendSurveyResponseToGoogleSheet(response: SurveyResponse, env: GoogleSheetsEnv = process.env) {
  const spreadsheetId = env.GOOGLE_SHEETS_SURVEY_SPREADSHEET_ID;
  const tabName = env.GOOGLE_SHEETS_SURVEY_TAB_NAME || "Survey Responses";
  if (!spreadsheetId) {
    return { status: "pending_configuration" as const, errorMessage: "GOOGLE_SHEETS_SURVEY_SPREADSHEET_ID is not configured." };
  }

  const token = await getAccessToken(env);
  if (token.status !== "success") return token;

  const range = `${encodeURIComponent(tabName)}!A:Q`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const row = buildSurveySheetRow(response, "success");
  const sheetResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });
  const body = await sheetResponse.json().catch(() => ({}));
  if (!sheetResponse.ok) {
    return { status: "failed" as const, errorMessage: body.error?.message || `Google Sheets append failed with ${sheetResponse.status}` };
  }

  return {
    status: "success" as const,
    sheetId: spreadsheetId,
    rowNumber: body.updates?.updatedRange ? Number(String(body.updates.updatedRange).match(/(\d+)$/)?.[1] || 0) : undefined,
    googleSheetRowId: body.updates?.updatedRange || "",
  };
}
