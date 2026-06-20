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

function normalizeLead(body) {
  return {
    createdAt: new Date().toISOString(),
    sourcePage: body.sourcePage || "Contact",
    entryPath: body.entryPath || "",
    name: body.name || "",
    email: body.email || "",
    phone: body.phone || "",
    company: body.company || "",
    partnerType: body.partnerType || "",
    sku: body.sku || "",
    priceId: body.priceId || "",
    productTitle: body.productTitle || "",
    priceText: body.priceText || "",
    billingKind: body.billingKind || "",
    selectedPlan: body.selectedPlan || body.planInterest || "",
    selectedAddOns: body.selectedAddOns || body.campaignInterest || "",
    estimatedTotal: body.estimatedTotal || "",
    checkoutMode: body.checkoutMode || "",
    planInterest: body.planInterest || "",
    campaignInterest: body.campaignInterest || "",
    budgetRange: body.budgetRange || body.budget || "",
    timing: body.timing || body.timeline || "",
    message: body.message || "",
    utmSource: body.utmSource || "",
    utmMedium: body.utmMedium || "",
    utmCampaign: body.utmCampaign || "",
    pageUrl: body.pageUrl || "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const lead = normalizeLead(body || {});

    if (!lead.name) {
      sendJson(res, 400, { error: "Name is required" });
      return;
    }

    if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      sendJson(res, 400, { error: "A valid email is required" });
      return;
    }

    if (!lead.partnerType) {
      sendJson(res, 400, { error: "Partner type is required" });
      return;
    }

    if (!lead.planInterest) {
      sendJson(res, 400, { error: "Interest is required" });
      return;
    }

    if (!lead.message) {
      sendJson(res, 400, { error: "Message is required" });
      return;
    }

    await appendContactLead(lead);
    sendJson(res, 200, { ok: true, message: "Message sent. We’ll follow up with the right next step." });
  } catch (error) {
    sendJson(res, 500, {
      error: error?.message || "Contact submission failed",
    });
  }
}
