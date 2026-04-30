import type { NextRequest } from 'next/server';

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function getBaseUrl(request?: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return trimTrailingSlash(configured);
  if (request) return trimTrailingSlash(request.nextUrl.origin);
  return 'http://localhost:3000';
}

export function getAbsoluteUrl(path: string, request?: NextRequest) {
  return new URL(path, getBaseUrl(request)).toString();
}

export function sanitizeInternalPath(path: string | null | undefined, fallback = '/') {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}

export function resolveSameOriginUrl(
  input: string | null | undefined,
  request: NextRequest,
  fallbackPath: string,
) {
  const baseUrl = getBaseUrl(request);
  const fallbackUrl = new URL(fallbackPath, baseUrl).toString();
  if (!input) return fallbackUrl;

  try {
    const resolved = new URL(input, baseUrl);
    const allowedOrigin = new URL(baseUrl).origin;
    return resolved.origin === allowedOrigin ? resolved.toString() : fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}
