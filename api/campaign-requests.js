import { appendContactLead } from "../src/lib/googleSheets.js";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  if (req.body) return Promise.resolve(req.body);

  return new Promise((resolve, reject) => {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function normalizeCampaignRequest(body) {
  return {
    createdAt: body.submitted_at || new Date().toISOString(),
    sourcePage: body.source_page || "Partner Campaigns",
    entryPath: "campaign_request",
    name: body.name || "",
    email: body.email || "",
    phone: body.phone || "",
    company: body.organization || "",
    partnerType: "Campaign",
    sku: "",
    priceId: "",
    productTitle: body.campaignType || "",
    priceText: "",
    billingKind: "",
    selectedPlan: body.goal || "",
    selectedAddOns: body.campaignType || "",
    estimatedTotal: "",
    checkoutMode: "",
    planInterest: "Campaign request",
    campaignInterest: body.campaignType || "",
    budgetRange: "",
    timing: "",
    message: [
      body.campaign_message || body.message || "",
      body.place || body.place_or_event ? `Place or event: ${body.place || body.place_or_event}` : "",
      body.goal ? `Goal: ${body.goal}` : "",
      body.status ? `Request status: ${body.status}` : "",
    ].filter(Boolean).join("\n\n"),
    utmSource: body.utm_source || "",
    utmMedium: body.utm_medium || "",
    utmCampaign: body.utm_campaign || "",
    pageUrl: body.source_url || "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const request = normalizeCampaignRequest(body || {});

    if (!request.name) {
      sendJson(res, 400, { error: "Name is required" });
      return;
    }

    if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      sendJson(res, 400, { error: "A valid email is required" });
      return;
    }

    if (!request.company) {
      sendJson(res, 400, { error: "Organization is required" });
      return;
    }

    if (!request.selectedPlan || !request.campaignInterest || !request.message) {
      sendJson(res, 400, { error: "Campaign details are required" });
      return;
    }

    await appendContactLead(request);
    sendJson(res, 200, { ok: true, message: "Campaign request received." });
  } catch (error) {
    sendJson(res, 500, {
      error: error?.message || "Campaign request failed",
    });
  }
}
