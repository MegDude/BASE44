import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// In-memory rate limiter: max 3 scans per hour per E.164 phone number
// Resets on cold start — acceptable for MVP
const rateLimitMap = new Map<string, number[]>();
const MAX_SCANS_PER_HOUR = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  return `+${digits}`;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const prev = (rateLimitMap.get(phone) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (prev.length >= MAX_SCANS_PER_HOUR) return true;
  prev.push(now);
  rateLimitMap.set(phone, prev);
  return false;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawPhone =
    body && typeof body === "object" && "phone" in body
      ? (body as Record<string, unknown>).phone
      : undefined;
  const qrCodeId =
    body && typeof body === "object" && "qr_code_id" in body
      ? (body as Record<string, unknown>).qr_code_id
      : undefined;

  if (typeof rawPhone !== "string" || !rawPhone.trim()) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  if (typeof qrCodeId !== "string" || !qrCodeId.trim()) {
    return NextResponse.json(
      { error: "qr_code_id is required" },
      { status: 400 },
    );
  }

  const phone = toE164(rawPhone);

  if (isRateLimited(phone)) {
    return NextResponse.json(
      { error: "Too many scans. Try again later." },
      { status: 429 },
    );
  }

  // Mock path when Supabase is not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const code = generateCode();
    return NextResponse.json({
      ok: true,
      code,
      smsSent: false,
      offer: {
        title: "Demo Perk",
        description: "Your redemption code is ready (mock mode).",
      },
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Resolve QR code → venue
  const { data: qr, error: qrError } = await supabase
    .from("qr_codes")
    .select("venue_id")
    .eq("id", qrCodeId)
    .eq("active", true)
    .single();

  if (qrError || !qr) {
    return NextResponse.json(
      { error: "Invalid or inactive QR code" },
      { status: 404 },
    );
  }

  // Upsert resident user by phone
  const { data: resident, error: resError } = await supabase
    .from("resident_users")
    .upsert({ phone }, { onConflict: "phone" })
    .select("id")
    .single();

  if (resError || !resident) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }

  // Get active perk for this venue
  const { data: perk, error: perkError } = await supabase
    .from("perks")
    .select("id, title, description")
    .eq("venue_id", qr.venue_id)
    .eq("active", true)
    .limit(1)
    .single();

  if (perkError || !perk) {
    return NextResponse.json(
      { error: "No active perk for this venue" },
      { status: 404 },
    );
  }

  // Log scan event
  await supabase.from("scan_events").insert({
    resident_id: resident.id,
    qr_code_id: qrCodeId,
    event_type: "scan",
  });

  // Generate unique redemption code — retry up to 5× on collision (PG 23505)
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode();
    const today = new Date().toISOString().slice(0, 10);

    const { error: insertError } = await supabase
      .from("perk_redemptions")
      .insert({
        resident_id: resident.id,
        perk_id: perk.id,
        redemption_date: today,
        redemption_code: candidate,
      });

    if (!insertError) {
      code = candidate;
      break;
    }
    // 23505 = unique_violation → try a new code; anything else is fatal
    if ((insertError as { code?: string }).code !== "23505") {
      return NextResponse.json(
        { error: "Failed to create redemption" },
        { status: 500 },
      );
    }
  }

  if (!code) {
    return NextResponse.json(
      { error: "Failed to generate unique code after retries" },
      { status: 500 },
    );
  }

  // Send SMS via Twilio
  let smsSent = false;
  const fromNumber =
    process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE_NUMBER;

  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    fromNumber
  ) {
    try {
      const creds = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
      ).toString("base64");

      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: phone,
            Body: `Your Downtown Perks code: ${code}\n\nPerk: ${perk.title}\n${perk.description}\n\nShow this at the venue to redeem.`,
          }),
        },
      );

      smsSent = resp.ok;
      await supabase.from("scan_events").insert({
        resident_id: resident.id,
        qr_code_id: qrCodeId,
        event_type: smsSent ? "sms_sent" : "sms_failed",
      });
    } catch {
      await supabase.from("scan_events").insert({
        resident_id: resident.id,
        qr_code_id: qrCodeId,
        event_type: "sms_failed",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    code,
    smsSent,
    offer: { title: perk.title, description: perk.description },
  });
}
