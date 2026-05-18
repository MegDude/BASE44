import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeString } from "./_utils/publicActor.js";

function sanitizeOptional(value, max = 255) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function sanitizePhone(value) {
  const phone = sanitizeString(value, { max: 32 });
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Enter a valid mobile number.");
  }
  return phone;
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DIR = path.join(__dirname, "..", ".codex-local");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "card-capture.jsonl");

async function writeLocalFallback(payload) {
  await mkdir(FALLBACK_DIR, { recursive: true });
  await appendFile(FALLBACK_FILE, `${JSON.stringify(payload)}\n`, "utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  try {
    const firstName = sanitizeOptional(req.body?.firstName, 120) || "DowntownPerks Member";
    const mobile = sanitizePhone(req.body?.mobile);
    const email = sanitizeEmail(req.body?.email);
    const building = sanitizeOptional(req.body?.building, 180);
    const source = sanitizeOptional(req.body?.source, 64) || "direct";
    const sessionId = sanitizeOptional(req.body?.sessionId, 128);
    const pagePath = sanitizeOptional(req.body?.pagePath, 180) || "/card";
    const currentUrl = sanitizeOptional(req.body?.currentUrl, 400);
    const referrer = sanitizeOptional(req.body?.referrer, 400);
    const userAgent = sanitizeOptional(req.headers?.["user-agent"], 400);

    const payload = {
      submittedAt: new Date().toISOString(),
      flow: "resident_card",
      source,
      firstName,
      mobile,
      email,
      building,
      sessionId,
      pagePath,
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
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid card capture request.",
    });
  }
}
