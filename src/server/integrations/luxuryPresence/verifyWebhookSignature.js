import crypto from "node:crypto";
import { Buffer } from "node:buffer";

function normalizeSignature(signatureHeader) {
  if (!signatureHeader) return "";
  const signature = String(signatureHeader).trim();
  if (signature.includes("=")) {
    const [, value] = signature.split("=");
    return value?.trim() || "";
  }
  return signature;
}

export function getLuxuryPresenceSignatureHeader(headers) {
  return (
    headers?.["x-luxury-presence-signature"] ||
    headers?.["X-Luxury-Presence-Signature"] ||
    headers?.["x-webhook-signature"] ||
    headers?.["X-Webhook-Signature"] ||
    headers?.["x-signature"] ||
    headers?.["X-Signature"] ||
    null
  );
}

export function verifyLuxuryPresenceSignature({ rawBody, signatureHeader, secret }) {
  if (!rawBody || !signatureHeader || !secret) return false;

  const received = normalizeSignature(signatureHeader);
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (!receivedBuffer.length || receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}