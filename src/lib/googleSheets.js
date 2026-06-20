import { createSign } from "node:crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getPrivateKey() {
  return process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getSheetsConfig() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = getPrivateKey();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tabName = process.env.GOOGLE_SHEETS_CONTACT_TAB || "Contact Leads";

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Google Sheets environment variables are not configured");
  }

  return { clientEmail, privateKey, spreadsheetId, tabName };
}

async function getAccessToken() {
  const { clientEmail, privateKey } = getSheetsConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google auth failed: ${details}`);
  }

  const token = await response.json();
  return token.access_token;
}

function clean(value) {
  if (value == null) return "";
  return String(value).trim();
}

export async function appendContactLead(lead) {
  const { spreadsheetId, tabName } = getSheetsConfig();
  const accessToken = await getAccessToken();
  const range = encodeURIComponent(`${tabName}!A:X`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const values = [[
    clean(lead.createdAt),
    clean(lead.sourcePage),
    clean(lead.entryPath),
    clean(lead.name),
    clean(lead.email),
    clean(lead.phone),
    clean(lead.company),
    clean(lead.partnerType),
    clean(lead.sku),
    clean(lead.priceId),
    clean(lead.productTitle),
    clean(lead.priceText),
    clean(lead.billingKind),
    clean(lead.selectedPlan || lead.planInterest),
    clean(lead.selectedAddOns || lead.campaignInterest),
    clean(lead.estimatedTotal),
    clean(lead.checkoutMode),
    clean(lead.budgetRange),
    clean(lead.timing),
    clean(lead.message),
    clean(lead.utmSource),
    clean(lead.utmMedium),
    clean(lead.utmCampaign),
    clean(lead.pageUrl),
  ]];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Sheets append failed: ${details}`);
  }

  return response.json();
}
