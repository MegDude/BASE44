import type { SurveyResponse } from "@/lib/surveys/surveyIntelligence";
import { buildTwilioSurveyMessage } from "@/lib/surveys/surveyCrmArchitecture";

type TwilioEnv = Record<string, string | undefined>;

export type TwilioMessageResult =
  | { status: "sent"; sid?: string }
  | { status: "pending_configuration"; errorMessage: string }
  | { status: "skipped"; errorMessage: string }
  | { status: "failed"; errorMessage: string };

function getTwilioAuth(env: TwilioEnv) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) return "";
  return Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
}

export async function sendTwilioSms(
  input: { to?: string; body: string },
  env: TwilioEnv = process.env,
): Promise<TwilioMessageResult> {
  if (!input.to) return { status: "skipped", errorMessage: "No resident phone number available." };
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || (!env.TWILIO_PHONE_NUMBER && !env.TWILIO_MESSAGING_SERVICE_SID)) {
    return { status: "pending_configuration", errorMessage: "Twilio messaging environment variables are not configured." };
  }

  const body = new URLSearchParams({
    To: input.to,
    Body: input.body,
  });
  if (env.TWILIO_MESSAGING_SERVICE_SID) {
    body.set("MessagingServiceSid", env.TWILIO_MESSAGING_SERVICE_SID);
  } else if (env.TWILIO_PHONE_NUMBER) {
    body.set("From", env.TWILIO_PHONE_NUMBER);
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getTwilioAuth(env)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: "failed", errorMessage: payload.message || `Twilio send failed with ${response.status}` };
  }

  return { status: "sent", sid: payload.sid };
}

export function buildSurveyCompletionSms(response: SurveyResponse) {
  return {
    to: response.residentPhone,
    body: buildTwilioSurveyMessage(response),
  };
}

export async function sendSurveyCompletionSms(response: SurveyResponse, env: TwilioEnv = process.env) {
  return sendTwilioSms(buildSurveyCompletionSms(response), env);
}
