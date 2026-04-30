import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function sanitizeOptional(value, max = 255) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function sanitizeEmail(value) {
  const email = sanitizeOptional(value, 255);
  if (!email) return "";
  const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksValid) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}

function sanitizePhone(value) {
  const phone = sanitizeOptional(value, 32);
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Enter a valid phone number.");
  }
  return phone;
}

function sanitizeRequired(value, label, max = 255) {
  const result = sanitizeOptional(value, max);
  if (!result) {
    throw new Error(`${label} is required.`);
  }
  return result;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DIR = path.join(__dirname, "..", ".codex-local");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "partner-intake.jsonl");

async function writeLocalFallback(payload) {
  await mkdir(FALLBACK_DIR, { recursive: true });
  await appendFile(FALLBACK_FILE, `${JSON.stringify(payload)}\n`, "utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl =
    process.env.GOOGLE_SHEETS_PARTNER_INTAKE_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  try {
    const flowType = sanitizeRequired(req.body?.flowType, "Flow type", 80);
    const source = sanitizeOptional(req.body?.source, 120) || "partner-intake";
    const sourcePage = sanitizeOptional(req.body?.sourcePage, 180);
    const sourceComponent = sanitizeOptional(req.body?.sourceComponent, 120);
    const partnerType = sanitizeOptional(req.body?.partnerType, 64);
    const organization = sanitizeOptional(req.body?.organization, 180);
    const contactName = sanitizeRequired(req.body?.name, "Contact name", 140);
    const email = sanitizeEmail(req.body?.email);
    const phone = sanitizePhone(req.body?.phone);
    const venueName = sanitizeOptional(req.body?.venueName, 180);
    const propertyName = sanitizeOptional(req.body?.propertyName, 180);
    const brandName = sanitizeOptional(req.body?.brandName, 180);
    const category = sanitizeOptional(req.body?.category, 120);
    const address = sanitizeOptional(req.body?.address, 220);
    const website = sanitizeOptional(req.body?.website, 240);
    const intent = sanitizeOptional(req.body?.intent, 80);
    const perkTitle = sanitizeOptional(req.body?.perkTitle, 180);
    const perkValue = sanitizeOptional(req.body?.perkValue, 180);
    const perkDetails = sanitizeOptional(req.body?.perkDetails, 1200);
    const qrPlacement = sanitizeOptional(req.body?.qrPlacement, 120);
    const pilotWindow = sanitizeOptional(req.body?.pilotWindow, 120);
    const hours = sanitizeOptional(req.body?.hours, 240);
    const budget = sanitizeOptional(req.body?.budget, 120);
    const district = sanitizeOptional(req.body?.district, 120);
    const objective = sanitizeOptional(req.body?.objective, 1200);
    const campaignName = sanitizeOptional(req.body?.campaignName, 180);
    const currentUrl = sanitizeOptional(req.body?.currentUrl, 400);
    const referrer = sanitizeOptional(req.body?.referrer, 400);
    const userAgent = sanitizeOptional(req.headers?.["user-agent"], 400);

    const payload = {
      submittedAt: new Date().toISOString(),
      flowType,
      source,
      sourcePage,
      sourceComponent,
      partnerType,
      organization,
      contactName,
      email,
      phone,
      venueName,
      propertyName,
      brandName,
      category,
      address,
      website,
      intent,
      perkTitle,
      perkValue,
      perkDetails,
      qrPlacement,
      pilotWindow,
      hours,
      budget,
      district,
      objective,
      campaignName,
      currentUrl,
      referrer,
      userAgent,
    };

    if (!webhookUrl) {
      await writeLocalFallback({ ...payload, destination: "local-fallback" });
      return res.status(200).json({
        ok: true,
        rowId: null,
        destination: "local-fallback",
        qrReady: Boolean(perkTitle || qrPlacement),
        pilotWindow: pilotWindow || null,
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      await writeLocalFallback({ ...payload, destination: "local-fallback", webhookError: detail.slice(0, 400) });
      return res.status(200).json({
        ok: true,
        rowId: null,
        destination: "local-fallback",
        qrReady: Boolean(perkTitle || qrPlacement),
        pilotWindow: pilotWindow || null,
      });
    }

    let webhookBody = {};
    try {
      webhookBody = await response.json();
    } catch {
      webhookBody = { ok: true };
    }

    return res.status(200).json({
      ok: true,
      rowId: webhookBody.rowId || null,
      destination: webhookBody.destination || "google-sheets",
      qrReady: Boolean(perkTitle || qrPlacement),
      pilotWindow: pilotWindow || null,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid partner intake request.",
    });
  }
}
