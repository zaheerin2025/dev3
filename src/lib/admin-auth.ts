// ─────────────────────────────────────────────────────────────
// Developers3 admin panel — shared auth helpers.
//
// Simple passcode auth (documented in worklog.md, Task 19-e):
//  1. POST /api/admin/auth { passcode } → { ok, token } (token === passcode).
//  2. Every /api/admin/* route requires header `x-admin-token` equal to the
//     expected value. Change the passcode by setting ADMIN_PASSCODE in .env
//     (defaults to 'developers3-admin' when unset) — client and server stay
//     in sync because the token IS the passcode value.
//
// SECURITY: comparison uses crypto.timingSafeEqual to prevent timing attacks.
// ─────────────────────────────────────────────────────────────

import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

/** Expected admin token value (also used as the passcode). */
export function expectedAdminToken(): string {
  return process.env.ADMIN_PASSCODE ?? 'developers3-admin';
}

/**
 * Constant-time string comparison — prevents timing attacks that could
 * leak the passcode character-by-character via response-time measurement.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Even when lengths differ, compare against expected to avoid
    // leaking length information through response time.
    const expected = Buffer.from(b, 'utf-8');
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(Buffer.from(a, 'utf-8'), Buffer.from(b, 'utf-8'));
}

/** Guard for /api/admin/* routes — returns a 401 response when unauthorized. */
export function isAdminRequest(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token') ?? '';
  if (token.length === 0) return false;
  return safeEqual(token, expectedAdminToken());
}
