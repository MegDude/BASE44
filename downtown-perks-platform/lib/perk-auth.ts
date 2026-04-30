/**
 * JWT helpers and auth middleware for the QR/OTP/Redemption flow.
 * Uses `jose` (Edge + Node compatible) with HS256.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export type ResidentRole = 'resident' | 'venue_admin' | 'platform_admin';

export interface ResidentClaims extends JWTPayload {
  userId: string;
  role: ResidentRole;
}

function getSecret(): Uint8Array {
  const secret = process.env.PERK_JWT_SECRET;
  if (!secret) throw new Error('PERK_JWT_SECRET env var is not set');
  return new TextEncoder().encode(secret);
}

export async function signResidentToken(userId: string, role: ResidentRole): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyResidentToken(token: string): Promise<ResidentClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as ResidentClaims;
  } catch {
    return null;
  }
}

/** Mask phone: keep first 2 chars + last 4 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\s/g, '');
  return clean.slice(0, 2) + '·····' + clean.slice(-4);
}

/** Next.js route handler type */
type Handler = (req: NextRequest, ctx: { user: ResidentClaims }) => Promise<NextResponse>;

/** Wraps a route handler, extracting + verifying the Bearer token */
export function withAuth(handler: Handler) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const header = req.headers.get('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing auth token.' }, { status: 401 });
    }
    const claims = await verifyResidentToken(token);
    if (!claims) {
      return NextResponse.json({ ok: false, error: 'Invalid or expired token.' }, { status: 401 });
    }
    return handler(req, { user: claims });
  };
}
