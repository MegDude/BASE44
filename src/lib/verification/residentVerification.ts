export type ResidentVerificationRequest = {
  buildingId?: string;
  buildingDomain?: string;
  unit?: string;
  email?: string;
  phone?: string;
};

const RESIDENTIAL_DOMAIN = /^[a-z0-9.-]+\.(residents|living|apartments|condos|homes|building)$/i;

export function isResidentialDomain(domain = "") {
  const normalized = domain.toLowerCase().trim();
  return RESIDENTIAL_DOMAIN.test(normalized) || [
    "springaustin.com",
    "theindependentaustin.com",
    "seaholmresidences.com",
  ].includes(normalized);
}

export async function startResidentVerification(request: ResidentVerificationRequest, env: Record<string, string | undefined> = process.env) {
  const domain = String(request.buildingDomain || request.email?.split("@")[1] || "").toLowerCase();
  if (!isResidentialDomain(domain)) {
    return { status: "rejected" as const, reason: "building_domain_not_approved", domain };
  }

  if (!request.phone || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    return { status: "pending_configuration" as const, domain };
  }

  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const response = await fetch(`https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: request.phone, Channel: "sms" }),
  });

  if (!response.ok) {
    return { status: "failed" as const, domain, error: await response.text() };
  }

  return { status: "otp_sent" as const, domain };
}

export async function confirmResidentVerification(phone: string, code: string, env: Record<string, string | undefined> = process.env) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    return { status: "pending_configuration" as const };
  }

  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const response = await fetch(`https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Code: code }),
  });

  const payload = await response.json().catch(() => ({}));
  return { status: payload.status === "approved" ? "verified" as const : "not_verified" as const, payload };
}
