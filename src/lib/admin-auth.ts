// ─────────────────────────────────────────────────────────────
// Developers3 admin panel — shared auth helpers.
//
// Simple passcode auth (documented in worklog.md, Task 19-e):
//  1. POST /api/admin/auth { passcode } → { ok, token } (token === passcode).
//  2. Every /api/admin/* route requires header `x-admin-token` equal to the
//     expected value. Change the passcode by setting ADMIN_PASSCODE in .env
//     (defaults to 'developers3-admin' when unset) — client and server stay
//     in sync because the token IS the passcode value.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from 'next/server';

/** Expected admin token value (also used as the passcode). */
export function expectedAdminToken(): string {
  return process.env.ADMIN_PASSCODE ?? 'developers3-admin';
}

/** Guard for /api/admin/* routes — returns a 401 response when unauthorized. */
export function isAdminRequest(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token') ?? '';
  return token.length > 0 && token === expectedAdminToken();
}
