export async function sendResidentEmail({ to, subject, html }: { to: string; subject: string; html: string }, env: Record<string, string | undefined> = process.env) {
  if (!env.RESEND_API_KEY) {
    return { status: "pending_configuration" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Downtown Perks <notifications@downtownperks.local>",
      to,
      subject,
      html,
    }),
  });

  return { status: response.ok ? "sent" as const : "failed" as const, providerStatus: response.status };
}
