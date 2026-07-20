import { postWorkflow } from "@/lib/backendWorkflows";

export type ResidentQrSession = {
  sessionId: string;
  token: string;
  qrValue: string;
  expiresAt: string;
  purpose: "resident_pass" | "perk_redemption" | "check_in";
};

export async function createResidentQrSession(input: {
  perkId?: string;
  purpose: ResidentQrSession["purpose"];
  sourceSurface: string;
}) {
  return postWorkflow("/api/resident/qr-session", input) as Promise<ResidentQrSession>;
}
