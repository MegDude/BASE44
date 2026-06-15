export async function sendTwilioSms({ to, body }: { to: string; body: string }, env: Record<string, string | undefined> = process.env) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    return { status: "pending_configuration" as const };
  }

  return { status: "queued_by_provider_abstraction" as const, to, body };
}
